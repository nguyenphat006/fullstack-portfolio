import io
import os
import csv
from datetime import datetime, date
from django.http import HttpResponse
from django.utils import timezone
from django.conf import settings
from PIL import Image as PILImage
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.drawing.image import Image as OpenpyxlImage
from django.utils.translation import gettext as _

class ExcelService:
    """
    Dịch vụ Xử lý Import / Export Excel chuẩn Enterprise.
    - Màu nhận diện: Precision Navy (#1E40AF), chữ trắng, font Segoe UI.
    - Dòng xen kẽ (Zebra rows), đường viền nhẹ Slate-200 (#E2E8F0).
    - Tự động định dạng Kiểu số (#,##0), Ngày tháng (DD/MM/YYYY HH:MM) và Độ rộng cột.
    - Hỗ trợ nhúng trực tiếp Hình ảnh Thumbnail (Avatar, Bản vẽ, Vật tư) vào ô tính.
    """

    HEADER_FILL = PatternFill(start_color="1E40AF", end_color="1E40AF", fill_type="solid")
    HEADER_FONT = Font(name="Segoe UI", size=11, bold=True, color="FFFFFF")
    HEADER_ALIGNMENT = Alignment(horizontal="center", vertical="center", wrap_text=True)

    REQUIRED_HEADER_FILL = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")
    REQUIRED_HEADER_FONT = Font(name="Segoe UI", size=11, bold=True, color="FEF08A")  # Vàng nhạt nổi bật

    ZEBRA_FILL = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")
    WHITE_FILL = PatternFill(start_color="FFFFFF", end_color="FFFFFF", fill_type="solid")

    DATA_FONT = Font(name="Segoe UI", size=10, color="0F172A")
    BORDER_SIDE = Side(style="thin", color="E2E8F0")
    CELL_BORDER = Border(left=BORDER_SIDE, right=BORDER_SIDE, top=BORDER_SIDE, bottom=BORDER_SIDE)

    @classmethod
    def create_styled_workbook(cls, columns: list, rows_data: list, sheet_name: str = "Data", include_images: bool = True) -> openpyxl.Workbook:
        """
        Tạo đối tượng openpyxl Workbook với định dạng chuẩn Enterprise.
        Hỗ trợ nhúng hình ảnh thumbnail khi cột có type == 'image'.
        """
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = sheet_name[:31]  # Excel giới hạn tên sheet 31 ký tự
        ws.views.sheetView[0].showGridLines = True

        # 1. Ghi Header Row
        ws.row_dimensions[1].height = 28
        for col_idx, col in enumerate(columns, start=1):
            cell = ws.cell(row=1, column=col_idx)
            is_req = col.get('required', False)
            label = f"{col.get('label', col.get('key'))}{' *' if is_req else ''}"
            cell.value = label
            cell.fill = cls.REQUIRED_HEADER_FILL if is_req else cls.HEADER_FILL
            cell.font = cls.REQUIRED_HEADER_FONT if is_req else cls.HEADER_FONT
            cell.alignment = cls.HEADER_ALIGNMENT
            cell.border = cls.CELL_BORDER

        # 2. Ghi Dữ Liệu
        col_widths = {}
        for r_idx, row in enumerate(rows_data, start=2):
            row_has_image = False
            is_even = (r_idx % 2 == 0)
            row_fill = cls.ZEBRA_FILL if is_even else cls.WHITE_FILL

            for c_idx, col in enumerate(columns, start=1):
                cell = ws.cell(row=r_idx, column=c_idx)
                key = col.get('key')
                val = row.get(key) if isinstance(row, dict) else getattr(row, key, None)
                col_type = col.get('type', 'string')

                # Format dữ liệu
                if col_type == 'image':
                    cell.value = ""
                    cell.alignment = Alignment(horizontal="center", vertical="center")
                    if include_images and val:
                        image_path = None
                        str_val = str(val).strip()
                        # Xử lý đường dẫn file ảnh
                        if str_val:
                            clean_val = str_val.lstrip('/')
                            if clean_val.startswith('media/'):
                                clean_val = clean_val[6:]
                            candidate = os.path.join(settings.MEDIA_ROOT, clean_val)
                            if os.path.exists(candidate):
                                image_path = candidate
                            elif os.path.exists(str_val):
                                image_path = str_val
                        elif hasattr(val, 'path') and os.path.exists(val.path):
                            image_path = val.path

                        if image_path:
                            try:
                                with PILImage.open(image_path) as pil_img:
                                    img_copy = pil_img.copy()
                                    img_copy.thumbnail((44, 44))
                                    thumb_io = io.BytesIO()
                                    img_copy.save(thumb_io, format='PNG')
                                    thumb_io.seek(0)
                                    xl_img = OpenpyxlImage(thumb_io)
                                    col_letter = get_column_letter(c_idx)
                                    ws.add_image(xl_img, f"{col_letter}{r_idx}")
                                    row_has_image = True
                            except Exception:
                                cell.value = _("[Ảnh lỗi]")
                        else:
                            cell.value = ""
                    else:
                        cell.value = str(val) if val else ""
                elif val is None:
                    cell.value = ""
                    cell.alignment = Alignment(horizontal="left", vertical="center")
                elif col_type == 'datetime':
                    if isinstance(val, str):
                        try:
                            val = datetime.fromisoformat(val.replace("Z", "+00:00"))
                        except Exception:
                            pass
                    cell.value = val
                    cell.number_format = 'DD/MM/YYYY HH:MM'
                    cell.alignment = Alignment(horizontal="center", vertical="center")
                elif col_type == 'date':
                    cell.value = val
                    cell.number_format = 'DD/MM/YYYY'
                    cell.alignment = Alignment(horizontal="center", vertical="center")
                elif col_type == 'number':
                    try:
                        cell.value = float(val)
                        cell.number_format = '#,##0.00' if isinstance(val, float) else '#,##0'
                    except Exception:
                        cell.value = val
                    cell.alignment = Alignment(horizontal="right", vertical="center")
                elif col_type == 'boolean':
                    cell.value = _("Hoạt động") if val else _("Khóa / Ngưng")
                    cell.alignment = Alignment(horizontal="center", vertical="center")
                else:
                    cell.value = str(val)
                    cell.alignment = Alignment(horizontal="left", vertical="center")

                cell.font = cls.DATA_FONT
                cell.fill = row_fill
                cell.border = cls.CELL_BORDER

                # Đo độ rộng cột
                val_len = len(str(cell.value or ""))
                col_widths[c_idx] = max(col_widths.get(c_idx, len(col.get('label', '')) + 4), val_len + 4)

            # Nếu dòng có ảnh thì tăng chiều cao ô tính
            ws.row_dimensions[r_idx].height = 42 if row_has_image else 22

        # 3. Tự động giãn độ rộng các cột
        for col_idx, col in enumerate(columns, start=1):
            col_letter = get_column_letter(col_idx)
            configured_width = col.get('width')
            if configured_width:
                ws.column_dimensions[col_letter].width = configured_width
            elif col.get('type') == 'image':
                ws.column_dimensions[col_letter].width = 12
            else:
                max_w = min(max(col_widths.get(col_idx, 14), 14), 50)
                ws.column_dimensions[col_letter].width = max_w

        return wb

    @classmethod
    def export_to_response(cls, columns: list, rows_data: list, filename: str = "Export_Data", sheet_name: str = "Data", include_images: bool = True) -> HttpResponse:
        """Xuất dữ liệu thành HttpResponse tải file .xlsx trực tiếp từ trình duyệt."""
        wb = cls.create_styled_workbook(columns, rows_data, sheet_name=sheet_name, include_images=include_images)
        buffer = io.BytesIO()
        wb.save(buffer)
        buffer.seek(0)

        response = HttpResponse(
            buffer.getvalue(),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        timestamp = timezone.now().strftime("%Y%m%d_%H%M%S")
        response['Content-Disposition'] = f'attachment; filename="{filename}_{timestamp}.xlsx"'
        return response

    @classmethod
    def export_to_csv_response(cls, columns: list, rows_data: list, filename: str = "Export_Data") -> HttpResponse:
        """Xuất dữ liệu thành HttpResponse tải file CSV (.csv) chuẩn UTF-8-BOM cho tiếng Việt."""
        response = HttpResponse(content_type='text/csv; charset=utf-8-sig')
        timestamp = timezone.now().strftime("%Y%m%d_%H%M%S")
        response['Content-Disposition'] = f'attachment; filename="{filename}_{timestamp}.csv"'

        writer = csv.writer(response)
        writer.writerow([col.get('label', col.get('key')) for col in columns])

        for row in rows_data:
            row_vals = []
            for col in columns:
                key = col.get('key')
                val = row.get(key) if isinstance(row, dict) else getattr(row, key, None)
                col_type = col.get('type', 'string')
                if val is None:
                    row_vals.append("")
                elif col_type == 'boolean':
                    row_vals.append(_("Hoạt động") if val else _("Khóa / Ngưng"))
                elif col_type == 'image':
                    row_vals.append(str(val) if val else "")
                else:
                    row_vals.append(str(val))
            writer.writerow(row_vals)

        return response

    @classmethod
    def generate_template_response(cls, columns: list, filename: str = "Template_Import", sample_rows: list = None) -> HttpResponse:
        """Tạo file mẫu Excel (.xlsx) chuẩn có hướng dẫn và các dòng mẫu."""
        samples = sample_rows or []
        return cls.export_to_response(columns, samples, filename=filename, sheet_name="Mau_Nhap_Lieu")

    @classmethod
    def parse_excel_file(cls, file_obj) -> dict:
        """
        Đọc và trích xuất dữ liệu từ tệp Excel tải lên.
        Trả về dict: { 'headers': [...], 'rows': [...], 'total_rows': N }
        """
        wb = openpyxl.load_workbook(file_obj, data_only=True)
        ws = wb.active

        rows = list(ws.iter_rows(values_only=True))
        if not rows:
            return {'headers': [], 'rows': [], 'total_rows': 0}

        # Dòng 1 là headers (loại bỏ ký tự * và khoảng trắng thừa)
        raw_headers = rows[0]
        cleaned_headers = [str(h).replace('*', '').strip() if h is not None else f"col_{i}" for i, h in enumerate(raw_headers)]

        data_rows = []
        for row_index, row_vals in enumerate(rows[1:], start=2):
            # Bỏ qua các dòng trống hoàn toàn
            if not any(val is not None and str(val).strip() != "" for val in row_vals):
                continue

            row_dict = {'_row_number': row_index}
            for header, val in zip(cleaned_headers, row_vals):
                row_dict[header] = val
            data_rows.append(row_dict)

        return {
            'headers': cleaned_headers,
            'rows': data_rows,
            'total_rows': len(data_rows)
        }
