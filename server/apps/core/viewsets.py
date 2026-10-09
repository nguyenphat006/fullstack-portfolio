from django.db import transaction
from django.db.models import Count, Q
from django.utils import timezone
from django.utils import translation
from django.utils.translation import gettext as _
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import APIException, ValidationError
from rest_framework.permissions import IsAuthenticated

from .pagination import StandardResultsSetPagination
from .responses import success_response


class BaseERPViewSet(viewsets.ModelViewSet):
    """
    ViewSet nền cho mọi thực thể nghiệp vụ (template chuẩn của dự án).

    Cung cấp sẵn:
    - CRUD trả envelope kèm thông điệp tiếng Việt; response luôn serialize bằng `serializer_class` (serializer đọc),
      dữ liệu đầu vào dùng `write_serializer_class` (nếu khai báo).
    - Tự gán `created_by` / `updated_by`; xóa = xóa mềm; mọi thao tác ghi bọc `transaction.atomic()`.
    - Action chuẩn: `statistics`, `batch-delete`, `batch-status`, `export-columns`, `export-excel`, `excel-template`.
    - Không có thùng rác: bản ghi đã xóa mềm không xem lại / khôi phục qua API (vẫn giữ trong CSDL để bảo toàn
      khóa ngoại, chống trùng mã và giữ nhật ký).
    - Payload hàng loạt thống nhất: `{"ids": [1, 2, 3]}` (+ `"is_active": bool` cho batch-status).

    Hook ghi đè cho quy tắc nghiệp vụ:
    - `check_can_destroy(instance)`                  -> raise BusinessError để chặn xóa (xóa đơn lẫn hàng loạt)
    - `check_can_change_status(instance, is_active)` -> raise BusinessError để chặn khóa/mở
    - `after_write(instance=None)`                   -> chạy sau mọi thao tác ghi (vd. invalidate cache)
    - `get_statistics(queryset)`                     -> tùy biến số liệu `statistics`

    Phân quyền: ViewSet con thêm `ModulePermissionChecker` + `permission_module = '<MODULE_CODE>'`.
    """
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    write_serializer_class = None
    entity_label = None  # Tên hiển thị trong thông điệp; mặc định verbose_name của Model

    # ------------------------------------------------------------------ helpers
    def get_model(self):
        return self.get_queryset().model

    def get_entity_label(self) -> str:
        return self.entity_label or str(self.get_model()._meta.verbose_name)

    def get_serializer_class(self):
        if self.write_serializer_class and self.action in ('create', 'update', 'partial_update'):
            return self.write_serializer_class
        return super().get_serializer_class()

    def serialize_read(self, instance):
        """Serialize bản ghi bằng serializer đọc (`serializer_class`) để trả về sau khi ghi."""
        return self.serializer_class(instance, context=self.get_serializer_context()).data

    def get_batch_ids(self, request) -> list:
        ids = request.data.get('ids')
        if not isinstance(ids, list) or not ids:
            raise ValidationError({'ids': [_('Danh sách ids phải là mảng không rỗng.')]})
        try:
            return [int(i) for i in ids]
        except (TypeError, ValueError):
            raise ValidationError({'ids': [_('Danh sách ids chỉ được chứa số nguyên.')]})

    def _current_user(self):
        user = self.request.user
        return user if user and user.is_authenticated else None

    # -------------------------------------------------------------------- hooks
    def check_can_destroy(self, instance):
        """Raise BusinessError nếu bản ghi không được phép xóa."""

    def check_can_change_status(self, instance, is_active: bool):
        """Raise BusinessError nếu bản ghi không được phép đổi trạng thái."""

    def after_write(self, instance=None):
        """Chạy sau mọi thao tác ghi thành công (tạo/sửa/xóa/khôi phục/hàng loạt)."""

    def get_statistics(self, queryset) -> dict:
        first_day_of_month = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        return queryset.order_by().aggregate(
            total=Count('id'),
            active=Count('id', filter=Q(is_active=True)),
            inactive=Count('id', filter=Q(is_active=False)),
            new_this_month=Count('id', filter=Q(created_at__gte=first_day_of_month)),
        )

    # --------------------------------------------------------------------- CRUD
    def perform_create(self, serializer):
        save_kwargs = {}
        user = self._current_user()
        model = serializer.Meta.model
        if user and hasattr(model, 'created_by'):
            save_kwargs['created_by'] = user
        if user and hasattr(model, 'updated_by'):
            save_kwargs['updated_by'] = user
        return serializer.save(**save_kwargs)

    def perform_update(self, serializer):
        save_kwargs = {}
        user = self._current_user()
        if user and hasattr(serializer.Meta.model, 'updated_by'):
            save_kwargs['updated_by'] = user
        return serializer.save(**save_kwargs)

    def perform_destroy(self, instance):
        """Xóa mềm thay vì xóa cứng khỏi cơ sở dữ liệu."""
        if hasattr(instance, 'soft_delete'):
            instance.soft_delete(user=self._current_user())
        else:
            instance.delete()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            self.perform_create(serializer)
        instance = serializer.instance
        self.after_write(instance)
        return success_response(
            data=self.serialize_read(instance),
            message=_("Thêm mới %(entity)s thành công") % {"entity": self.get_entity_label().lower()},
            status_code=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            self.perform_update(serializer)
        instance = serializer.instance
        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}
        self.after_write(instance)
        return success_response(
            data=self.serialize_read(instance),
            message=_("Cập nhật %(entity)s thành công") % {"entity": self.get_entity_label().lower()},
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.check_can_destroy(instance)
        with transaction.atomic():
            self.perform_destroy(instance)
        self.after_write(instance)
        return success_response(message=_("Đã xóa %(entity)s thành công") % {"entity": self.get_entity_label().lower()})

    # ---------------------------------------------------------- standard actions
    @action(detail=False, methods=['get'], url_path='statistics')
    def statistics(self, request):
        """Số liệu tổng quan: tổng / đang hoạt động / ngưng / mới trong tháng."""
        return success_response(data=self.get_statistics(self.get_queryset()))

    @action(detail=False, methods=['post'], url_path='batch-delete')
    def batch_delete(self, request):
        """Xóa mềm hàng loạt. Body: {"ids": [...]}. Bản ghi bị `check_can_destroy` chặn sẽ được bỏ qua."""
        ids = self.get_batch_ids(request)
        count, skipped = 0, []
        with transaction.atomic():
            for record in self.get_queryset().filter(id__in=ids):
                try:
                    self.check_can_destroy(record)
                except APIException as exc:
                    skipped.append({'id': record.id, 'reason': str(exc.detail)})
                    continue
                self.perform_destroy(record)
                count += 1
        self.after_write()
        message = _("Đã xóa %(count)s %(entity)s") % {"count": count, "entity": self.get_entity_label().lower()}
        if skipped:
            message += _(", bỏ qua %(count)s bản ghi được bảo vệ") % {"count": len(skipped)}
        return success_response(data={'count': count, 'skipped': skipped}, message=message)

    @action(detail=False, methods=['post'], url_path='batch-status')
    def batch_status(self, request):
        """Bật/tắt trạng thái hàng loạt. Body: {"ids": [...], "is_active": true | false}."""
        ids = self.get_batch_ids(request)
        is_active = request.data.get('is_active')
        if not isinstance(is_active, bool):
            raise ValidationError({'is_active': [_('Giá trị is_active phải là true hoặc false.')]})

        user = self._current_user()
        has_updated_by = hasattr(self.get_model(), 'updated_by')
        count, skipped = 0, []
        with transaction.atomic():
            for record in self.get_queryset().filter(id__in=ids).exclude(is_active=is_active):
                try:
                    self.check_can_change_status(record, is_active)
                except APIException as exc:
                    skipped.append({'id': record.id, 'reason': str(exc.detail)})
                    continue
                record.is_active = is_active
                update_fields = ['is_active', 'updated_at']
                if has_updated_by and user:
                    record.updated_by = user
                    update_fields.append('updated_by')
                record.save(update_fields=update_fields)
                count += 1
        self.after_write()
        entity = self.get_entity_label().lower()
        if is_active:
            message = _("Đã kích hoạt %(count)s %(entity)s") % {"count": count, "entity": entity}
        else:
            message = _("Đã ngưng hoạt động %(count)s %(entity)s") % {"count": count, "entity": entity}
        if skipped:
            message += _(", bỏ qua %(count)s bản ghi được bảo vệ") % {"count": len(skipped)}
        return success_response(data={'count': count, 'skipped': skipped}, message=message)

    # ------------------------------------------------------- excel import / export
    DEFAULT_EXCLUDED_FIELDS = {
        'id',
        'password',
        'is_superuser',
        'is_staff',
        'deleted_at',
        'groups',
        'user_permissions',
        'first_name',
        'last_name',
        'date_joined',
    }
    excel_excluded_fields = None  # Danh sách trường loại trừ bổ sung cho từng ViewSet con
    excel_columns = None  # Danh sách cột xuất tùy chỉnh (nếu muốn override)

    def get_excel_columns(self):
        """
        Lấy cấu hình cột cho xuất Excel/CSV từ Model Meta fields của Django.
        Tự động trích xuất trực tiếp từ Model, tự động ẩn các trường nhạy cảm/nội bộ (id, is_superuser, is_staff, password...).
        """
        if self.excel_columns:
            return self.excel_columns

        if hasattr(self, 'queryset') and self.queryset is not None:
            model = self.queryset.model
        elif hasattr(self, 'get_queryset'):
            model = self.get_queryset().model
        else:
            return []
        columns = []
        excluded_fields = set(self.DEFAULT_EXCLUDED_FIELDS)
        if self.excel_excluded_fields:
            excluded_fields.update(self.excel_excluded_fields)

        for field in model._meta.get_fields():
            if field.name in excluded_fields:
                continue

            # Bỏ qua quan hệ ngược (reverse relations)
            if field.auto_created and not field.concrete:
                continue

            field_type = 'string'
            internal_type = field.get_internal_type() if hasattr(field, 'get_internal_type') else ''

            if internal_type in ['DateTimeField']:
                field_type = 'datetime'
            elif internal_type in ['DateField']:
                field_type = 'date'
            elif internal_type in [
                'BigAutoField', 'AutoField', 'IntegerField', 'DecimalField',
                'FloatField', 'BigIntegerField', 'SmallIntegerField', 'PositiveIntegerField'
            ]:
                field_type = 'number'
            elif internal_type in ['BooleanField']:
                field_type = 'boolean'
            elif internal_type in ['ImageField', 'FileField'] or 'avatar' in field.name.lower() or 'image' in field.name.lower():
                field_type = 'image'

            key = field.name
            # Hỗ trợ ManyToMany đặc thù (ví dụ roles -> role_names)
            if field.many_to_many and field.name == 'roles':
                key = 'role_names'
                field_type = 'string'

            raw_label = getattr(field, 'verbose_name', field.name)
            label = str(raw_label).strip()
            if field.name == 'is_active':
                label = _('Trạng thái hoạt động')
            elif field.name == 'is_superuser':
                label = _('Quyền Quản trị tối cao (Superuser)')
            elif field.name == 'is_staff':
                label = _('Tình trạng nhân viên (Staff)')
            elif label:
                label = label[0].upper() + label[1:]
            else:
                label = field.name

            # Mặc định tích chọn các trường nghiệp vụ chính
            default_selected = field.name in [
                'avatar', 'username', 'full_name', 'email', 'phone_number',
                'roles', 'role_names', 'is_active', 'created_at'
            ] or (
                field.name not in [
                    'id', 'last_login', 'description', 'updated_at', 'is_superuser',
                    'first_name', 'last_name', 'is_staff', 'date_joined'
                ]
            )

            columns.append({
                'key': key,
                'label': label,
                'type': field_type,
                'default_selected': default_selected,
                'required': getattr(field, 'blank', True) is False and getattr(field, 'null', True) is False,
            })

        return columns

    @action(detail=False, methods=['get'], url_path='export-columns')
    def export_columns(self, request):
        """API trả về danh sách các trường dữ liệu (fields) của Model phục vụ cấu hình xuất file."""
        columns = self.get_excel_columns()
        return success_response(data=columns, message=_("Lấy danh sách trường dữ liệu thành công"))

    @action(detail=False, methods=['get', 'post'], url_path='export-excel')
    def export_excel(self, request):
        """API Xuất danh sách dữ liệu ra file Excel (.xlsx) hoặc CSV chuẩn Enterprise (Hỗ trợ Sync & Async Queue)."""
        from .excel_service import ExcelService
        from .models import DataTransferJob
        from .tasks import execute_data_export_job

        # Đọc tham số từ POST body hoặc GET query params
        data_source = request.data if request.method == 'POST' else request.query_params
        requested_cols = data_source.get('columns')
        ids = data_source.get('ids')
        export_format = data_source.get('format', 'xlsx')
        include_images = data_source.get('include_images', True)
        if isinstance(include_images, str):
            include_images = include_images.lower() in ['true', '1', 'yes']

        # 1. Lọc QuerySet theo phạm vi (IDs chọn lọc, toàn bộ hệ thống hoặc bộ lọc hiện tại)
        scope = data_source.get('scope', 'all')
        if ids and isinstance(ids, list) and len(ids) > 0:
            queryset = self.get_queryset().filter(id__in=ids)
        elif scope == 'full':
            # Xuất toàn bộ dữ liệu hệ thống (bỏ qua bộ lọc), loại trừ hoàn toàn các bản ghi đã xóa
            queryset = self.get_queryset()
        else:
            queryset = self.filter_queryset(self.get_queryset())

        # Luôn đảm bảo loại trừ các bản ghi đã xóa mềm (deleted_at IS NULL)
        model = queryset.model
        if hasattr(model, 'deleted_at'):
            queryset = queryset.filter(deleted_at__isnull=True)

        # 2. Lọc và sắp xếp các cột theo yêu cầu của Client
        all_cols = self.get_excel_columns()
        if requested_cols and isinstance(requested_cols, list) and len(requested_cols) > 0:
            cols_map = {c['key']: c for c in all_cols}
            columns = [cols_map[k] for k in requested_cols if k in cols_map]
            if not columns:
                columns = all_cols
        else:
            columns = all_cols

        model_name = model._meta.verbose_name or "Export"

        # Server tự động quyết định chuyển sang Async (Celery Queue) khi:
        # 1. Người dùng chọn Scope: 'full' (Toàn bộ hệ thống)
        # 2. Hoặc tổng số dòng > 1.000 dòng
        # 3. Hoặc có xuất hình ảnh thumbnail và số dòng > 200 dòng
        # 4. Hoặc client có truyền cờ is_async
        total_rows_count = queryset.count()
        has_image_col = any(c.get('type') == 'image' for c in columns)

        explicit_async = data_source.get('is_async')
        if explicit_async is not None:
            if isinstance(explicit_async, str):
                is_async = explicit_async.lower() in ['true', '1', 'yes']
            else:
                is_async = bool(explicit_async)
        else:
            is_async = (
                scope == 'full'
                or total_rows_count > 1000
                or (include_images and has_image_col and total_rows_count > 200)
            )

        # 3. Chế độ Async Background Task (Khi máy chủ quyết định hoặc client yêu cầu)
        if is_async:
            serializer_path = None
            if hasattr(self, 'get_serializer_class'):
                s_cls = self.get_serializer_class()
                serializer_path = f"{s_cls.__module__}.{s_cls.__name__}"

            job = DataTransferJob.objects.create(
                job_type='EXPORT_CSV' if export_format == 'csv' else 'EXPORT_EXCEL',
                entity_type=str(model_name),
                status='PENDING',
                progress=0,
                total_rows=queryset.count(),
                query_params={
                    'app_label': model._meta.app_label,
                    'model_name': model._meta.model_name,
                    'columns': columns,
                    'format': export_format,
                    'include_images': include_images,
                    'scope': scope,
                    'ids': ids if isinstance(ids, list) else [],
                    'filters': data_source.get('filters', {}),
                    'serializer_path': serializer_path,
                    'lang': translation.get_language(),  # tác vụ nền tạo thông báo theo ngôn ngữ người yêu cầu
                },
                created_by=request.user if request.user.is_authenticated else None
            )

            # Kích hoạt tác vụ ngầm qua Celery
            try:
                execute_data_export_job.delay(job_id=job.id)
            except Exception as e:
                # Dự phòng trong môi trường local khi chưa bật redis/celery
                import logging
                logging.getLogger(__name__).warning(f"Lỗi kích hoạt Celery delay ({e}), chuyển sang thực thi đồng bộ fallback.")
                execute_data_export_job(job_id=job.id)
                job.refresh_from_db()

            from rest_framework import status
            return success_response(
                data={
                    'job_id': job.id,
                    'status': job.status,
                    'is_async': True,
                    'progress': job.progress,
                    'total_rows': job.total_rows,
                    'file_url': job.file_url,
                },
                message=_("Tác vụ xuất dữ liệu đã được đưa vào hàng đợi xử lý ngầm"),
                status_code=status.HTTP_202_ACCEPTED
            )

        # 4. Chế độ Sync Trực Tiếp (Trả file ngay lập tức cho dữ liệu nhỏ)
        serializer = self.get_serializer(queryset, many=True)
        filename = f"Danh_sach_{model_name.replace(' ', '_')}"

        if export_format == 'csv':
            return ExcelService.export_to_csv_response(columns, serializer.data, filename=filename)

        return ExcelService.export_to_response(
            columns,
            serializer.data,
            filename=filename,
            include_images=include_images
        )

    @action(detail=False, methods=['get'], url_path='excel-template')
    def excel_template(self, request):
        """API Tải file mẫu Excel (.xlsx) dùng cho chức năng Nhập dữ liệu (Import)."""
        from .excel_service import ExcelService
        columns = self.get_excel_columns()
        model_name = self.get_queryset().model._meta.verbose_name or "Template"
        filename = f"Mau_nhap_lieu_{model_name.replace(' ', '_')}"
        return ExcelService.generate_template_response(columns, filename=filename)
