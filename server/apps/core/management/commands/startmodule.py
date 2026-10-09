"""
startmodule — sinh một phân hệ CRUD backend chuẩn template (app Django riêng).

    python manage.py startmodule suppliers Supplier --label "nhà cung cấp" --route master-data/suppliers --parent MASTER_DATA

Tạo apps/<app>/ (model, serializer đọc/ghi, BaseERPViewSet, urls, admin, rbac.py (phân hệ + quyền), test hợp đồng API)
và tự đăng ký:
  - config/settings.py  LOCAL_APPS           (marker "[startmodule]")
  - config/urls.py      api_v1_patterns      (marker "[startmodule]")
seed_core tự gom apps/<app>/rbac.py -> không sửa seed_core.
In ra đoạn DBML cần bổ sung vào server/database.dbml (DBML là nguồn chuẩn).
Sau đó: makemigrations -> migrate -> seed_core -> test -> spectacular -> (client) npm run gen:api && npm run gen:module.
"""
import keyword
import re
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

TEMPLATE_DIR = Path(__file__).resolve().parents[2] / 'module_template'
MARKER = '# [startmodule]'


def to_kebab(name: str) -> str:
    return re.sub(r'([a-z0-9])([A-Z])', r'\1-\2', name).lower()


def to_snake_upper(name: str) -> str:
    return re.sub(r'([a-z0-9])([A-Z])', r'\1_\2', name).upper()


def insert_before_marker(path: Path, marker: str, text: str):
    content = path.read_text(encoding='utf-8')
    lines = content.split('\n')
    idx = next((i for i, line in enumerate(lines) if marker in line), None)
    if idx is None:
        raise CommandError(f"Không tìm thấy marker '{marker}' trong {path}")
    lines[idx:idx] = text.rstrip('\n').split('\n')
    path.write_text('\n'.join(lines), encoding='utf-8')


class Command(BaseCommand):
    help = "Sinh phân hệ CRUD backend chuẩn template (app mới + tự đăng ký settings/urls)"

    def add_arguments(self, parser):
        parser.add_argument('app', help='Tên app snake_case, vd: suppliers')
        parser.add_argument('model', help='Tên model PascalCase số ít, vd: Supplier')
        parser.add_argument('--label', required=True, help='Tên tiếng Việt viết thường, vd: "nhà cung cấp"')
        parser.add_argument('--route', required=True, help='Đường dẫn màn hình frontend (không cần "/" đầu), vd: master-data/suppliers')
        parser.add_argument('--label-en', help='Tên tiếng Anh hiển thị trên menu khi chọn English, vd: "Suppliers"')
        parser.add_argument('--plural', help='Số nhiều PascalCase (mặc định <Model>s) — dùng cho tên bảng DBML')
        parser.add_argument('--code', help='Mã phân hệ RBAC (mặc định: SUPPLIER)')
        parser.add_argument('--parent', default=None, help='module_code của nhóm menu cha, vd: MASTER_DATA')
        parser.add_argument('--icon', default='AppstoreOutlined', help='Khóa icon trong client/src/constants/iconMap.tsx')
        parser.add_argument('--sort-order', type=int, default=100)
        parser.add_argument('--dry-run', action='store_true')

    def handle(self, *args, **opts):
        app, model = opts['app'], opts['model']
        if not re.fullmatch(r'[a-z][a-z0-9_]*', app) or keyword.iskeyword(app):
            raise CommandError("Tên app phải là snake_case, vd: suppliers")
        if not re.fullmatch(r'[A-Z][A-Za-z0-9]*', model):
            raise CommandError("Tên model phải là PascalCase, vd: Supplier")
        raw_route = opts['route'].replace('\\', '/')
        if re.match(r'^[A-Za-z]:/', raw_route):
            # Git Bash trên Windows tự đổi "/abc" thành "C:/Program Files/Git/abc"
            raise CommandError('--route bị shell đổi thành đường dẫn ổ đĩa. Viết không có "/" đầu: --route master-data/suppliers')
        if not re.fullmatch(r'/?[a-z0-9-]+(/[a-z0-9-]+)*/?', raw_route):
            raise CommandError('--route chỉ gồm chữ thường, số, "-" và "/", vd: master-data/suppliers')
        route = '/' + raw_route.strip('/')

        plural = opts['plural'] or f'{model}s'
        code = opts['code'] or to_snake_upper(model)
        label = opts['label'].strip()
        vars_ = {
            '__AppConfig__': ''.join(p.capitalize() for p in app.split('_')) + 'Config',
            '__MODULE_CODE__': code,
            '__Models__': plural,
            '__Model__': model,
            '__resource__': to_kebab(plural),
            '__basename__': to_kebab(model),
            '__Label__': label[:1].upper() + label[1:],
            '__label__': label,
            '__app__': app,
            '__LABEL_EN__': repr(opts['label_en'].strip()) if opts.get('label_en') else 'None',
            '__ICON__': opts['icon'],
            '__ROUTE__': route,
            '__PARENT__': repr(opts['parent']) if opts['parent'] else 'None',
            '__SORT_ORDER__': str(opts['sort_order']),
        }

        def render(text: str) -> str:
            for key, value in vars_.items():
                text = text.replace(key, value)
            return text

        app_dir = Path(settings.BASE_DIR) / 'apps' / app
        if app_dir.exists():
            raise CommandError(f"apps/{app} đã tồn tại. startmodule chỉ tạo app mới (mỗi phân hệ một app).")
        from apps.authentication.management.commands.seed_core import DEFAULT_MODULES
        from apps.core.rbac_registry import collect_app_rbac
        if code in {m['module_code'] for m in DEFAULT_MODULES + collect_app_rbac()[0]}:
            raise CommandError(f"Phân hệ {code} đã tồn tại (seed_core hoặc rbac.py của app khác). Dùng --code khác.")

        files = {
            '__init__.py': '',
            'migrations/__init__.py': '',
        }
        for tpl in TEMPLATE_DIR.glob('*.tpl'):
            files[tpl.name[:-len('.tpl')]] = render(tpl.read_text(encoding='utf-8'))

        self.stdout.write(f"\nSinh phân hệ '{vars_['__Label__']}' ({model}) -> apps/{app}/  API /api/v1/{vars_['__resource__']}/")
        for name in sorted(files):
            self.stdout.write(f"  + apps/{app}/{name}")
        self.stdout.write("  ~ config/settings.py, config/urls.py")
        if opts['dry_run']:
            self.stdout.write("\n(dry-run: chưa ghi file)")
            return

        for name, content in files.items():
            target = app_dir / name
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(content, encoding='utf-8')

        base = Path(settings.BASE_DIR)
        insert_before_marker(base / 'config' / 'settings.py', MARKER, f"    'apps.{app}',")
        insert_before_marker(base / 'config' / 'urls.py', MARKER, f"    path('', include('apps.{app}.urls')),")
        self.stdout.write(self.style.SUCCESS("\n✔ Đã sinh phân hệ. Bổ sung bảng sau vào server/database.dbml:\n"))
        self.stdout.write(f"""Table {plural} {{
  Id int [primary key, increment]
  Code varchar(50) [not null, unique, note: 'Mã {label}']
  Name varchar(255) [not null, note: 'Tên {label}']

  // Standard Audit Fields
  Description text [null]
  IsActive boolean [default: true]
  CreatedById int [ref: > Users.Id]
  UpdatedById int [ref: > Users.Id]
  CreatedAt timestamp [default: `now()`]
  UpdatedAt timestamp
  DeletedAt timestamp [null, note: 'Soft delete']
}}
""")
        self.stdout.write(f"""Bước tiếp theo:
  1. Bổ sung trường nghiệp vụ theo DBML vào apps/{app}/models.py + serializers.py
  2. python manage.py makemigrations {app} && python manage.py migrate && python manage.py seed_core
  3. Chạy test (apps/{app}/tests.py) -> python manage.py spectacular --file schema.yml
  4. cd ../client && npm run gen:api && npm run gen:module -- --entity {model} --label "{label}" --route {route.lstrip('/')} --code {code}
""")
