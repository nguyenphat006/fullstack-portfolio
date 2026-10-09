import os
import csv
import traceback
from datetime import datetime
try:
    from celery import shared_task
except ImportError:
    def shared_task(*args, **kwargs):
        def decorator(func):
            def delay(*d_args, **d_kwargs):
                return func(None, *d_args, **d_kwargs)
            func.delay = delay
            return func
        if len(args) == 1 and callable(args[0]):
            return decorator(args[0])
        return decorator
from django.apps import apps
from django.conf import settings
from django.utils import timezone, translation
from django.utils.translation import gettext as _
from .models import DataTransferJob
from .excel_service import ExcelService


@shared_task(bind=True, max_retries=1)
def execute_data_export_job(self, job_id: int):
    """
    Celery Background Task: Xuất dữ liệu lớn ra file Excel (.xlsx) hoặc CSV (.csv).
    - Cập nhật tiến trình thời gian thực (progress 0% -> 100%).
    - Xử lý theo từng batch dữ liệu để tránh tràn bộ nhớ RAM.
    - Lưu file vào media/exports/ và lưu đường dẫn tải về.
    """
    job = DataTransferJob.objects.filter(id=job_id).first()
    if not job:
        return f"Job #{job_id} không tồn tại."

    # Thông báo / chữ sinh ra trong tác vụ nền theo ngôn ngữ của người yêu cầu (lưu lúc tạo job)
    with translation.override((job.query_params or {}).get('lang') or settings.LANGUAGE_CODE):
        return _run_export(job, job_id)


def _run_export(job, job_id: int):

    job.status = 'PROCESSING'
    job.started_at = timezone.now()
    job.progress = 5
    job.save(update_fields=['status', 'started_at', 'progress'])

    try:
        query_params = job.query_params or {}
        app_label = query_params.get('app_label')
        model_name = query_params.get('model_name')
        columns = query_params.get('columns', [])
        export_format = query_params.get('format', 'xlsx').lower()
        include_images = query_params.get('include_images', True)
        scope = query_params.get('scope', 'all')
        ids = query_params.get('ids', [])
        filter_dict = query_params.get('filters', {})

        if not app_label or not model_name:
            raise ValueError("Thiếu thông tin app_label hoặc model_name trong query_params của Job.")

        model = apps.get_model(app_label, model_name)

        # 1. Khởi tạo QuerySet theo phạm vi (Scope)
        if scope == 'selected' and ids and isinstance(ids, list):
            queryset = model.objects.filter(id__in=ids)
        elif scope == 'full':
            queryset = model.objects.all()
        else:
            queryset = model.objects.all()
            # Áp dụng bộ lọc cơ bản nếu có
            if filter_dict and isinstance(filter_dict, dict):
                clean_filters = {k: v for k, v in filter_dict.items() if v not in [None, '', 'all']}
                if clean_filters:
                    queryset = queryset.filter(**clean_filters)

        # Đảm bảo luôn loại trừ bản ghi đã xóa mềm
        if hasattr(model, 'deleted_at'):
            queryset = queryset.filter(deleted_at__isnull=True)

        # Sắp xếp mặc định
        if hasattr(model, 'updated_at'):
            queryset = queryset.order_by('-updated_at', 'id')

        total_rows = queryset.count()
        job.total_rows = total_rows
        job.progress = 10
        job.save(update_fields=['total_rows', 'progress'])

        # 2. Thu thập dữ liệu theo batches để cập nhật tiến độ
        serialized_rows = []
        batch_size = 200

        # Lấy serializer class phù hợp nếu có đăng ký
        serializer_class = None
        serializer_path = query_params.get('serializer_path')
        if serializer_path:
            try:
                module_name, cls_name = serializer_path.rsplit('.', 1)
                mod = __import__(module_name, fromlist=[cls_name])
                serializer_class = getattr(mod, cls_name)
            except Exception:
                serializer_class = None

        for offset in range(0, max(total_rows, 1), batch_size):
            batch_qs = list(queryset[offset:offset + batch_size])
            if not batch_qs and total_rows > 0:
                break

            if serializer_class:
                batch_data = serializer_class(batch_qs, many=True).data
            else:
                # Trích xuất dữ liệu trực tiếp từ các trường của model
                batch_data = []
                for obj in batch_qs:
                    row_dict = {}
                    for col in columns:
                        k = col.get('key')
                        if hasattr(obj, k):
                            val = getattr(obj, k)
                            if callable(val):
                                val = val()
                            row_dict[k] = val
                        elif hasattr(obj, f"get_{k}_display"):
                            row_dict[k] = getattr(obj, f"get_{k}_display")()
                        elif k == 'role_names' and hasattr(obj, 'roles'):
                            row_dict[k] = ", ".join([r.role_name for r in obj.roles.all()])
                        else:
                            row_dict[k] = getattr(obj, k, "")
                    batch_data.append(row_dict)

            serialized_rows.extend(batch_data)
            processed = len(serialized_rows)
            job.processed_rows = processed
            if total_rows > 0:
                job.progress = min(85, int((processed / total_rows) * 75) + 10)
            else:
                job.progress = 50
            job.save(update_fields=['processed_rows', 'progress'])

        # 3. Render file trên đĩa
        job.progress = 90
        job.save(update_fields=['progress'])

        now = timezone.now()
        year_str = str(now.year)
        month_str = f"{now.month:02d}"
        export_dir = os.path.join(settings.MEDIA_ROOT, 'exports', year_str, month_str)
        os.makedirs(export_dir, exist_ok=True)

        from django.utils.text import slugify
        entity_slug = slugify(job.entity_type) or "export"
        timestamp_slug = now.strftime('%Y%m%d_%H%M%S')
        filename = f"{entity_slug}_{job.id}_{timestamp_slug}.{export_format}"
        file_path = os.path.join(export_dir, filename)

        if export_format == 'csv':
            with open(file_path, 'w', newline='', encoding='utf-8-sig') as f:
                writer = csv.writer(f)
                headers = [col.get('label', col.get('key')) for col in columns]
                writer.writerow(headers)
                for row in serialized_rows:
                    row_values = []
                    for col in columns:
                        key = col.get('key')
                        val = row.get(key, '') if isinstance(row, dict) else getattr(row, key, '')
                        row_values.append(val if val is not None else '')
                    writer.writerow(row_values)
        else:
            # Excel .xlsx
            sheet_title = job.entity_type[:30]
            wb = ExcelService.create_styled_workbook(
                columns=columns,
                rows_data=serialized_rows,
                sheet_name=sheet_title,
                include_images=include_images
            )
            wb.save(file_path)

        # 4. Cập nhật hoàn tất thành công
        relative_url = f"{settings.MEDIA_URL.rstrip('/')}/exports/{year_str}/{month_str}/{filename}"
        job.file_url = relative_url
        job.status = 'COMPLETED'
        job.progress = 100
        job.completed_at = timezone.now()
        job.save(update_fields=['file_url', 'status', 'progress', 'completed_at'])

        from .notifications import notify
        notify(job.created_by, _("Xuất dữ liệu %(entity)s đã xong") % {"entity": job.entity_type}, message=_("%(count)s dòng · bấm để tải tệp") % {"count": total_rows},
               level='SUCCESS', source=('DATA_TRANSFER_JOB', job.id))  # frontend tải qua /jobs/{id}/download/

        return f"Job #{job_id} hoàn tất xuất {total_rows} dòng vào file: {filename}"

    except Exception as exc:
        job.status = 'FAILED'
        job.error_message = f"{str(exc)}\n{traceback.format_exc()}"
        job.completed_at = timezone.now()
        job.save(update_fields=['status', 'error_message', 'completed_at'])
        from .notifications import notify
        notify(job.created_by, _("Xuất dữ liệu %(entity)s thất bại") % {"entity": job.entity_type}, message=str(exc)[:300],
               level='ERROR', source=('DATA_TRANSFER_JOB', job.id))
        return f"Job #{job_id} thất bại: {str(exc)}"

