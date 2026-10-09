"""
Tìm kiếm toàn cục (thanh tìm kiếm trên sidebar / Ctrl+K) — gom nguồn tìm từ từng app.

Mỗi app nghiệp vụ tự khai báo trong `apps/<app>/search.py` (tùy chọn), cùng kiểu `rbac.py`:
    SEARCH_PROVIDERS = [
        SearchProvider(module_code='MATERIAL', model=Material, code_field='material_code',
                       title_field='material_name', url='/master-data/materials/{id}'),
    ]

`GET /api/v1/search/?q=` chạy mọi nguồn mà người dùng có quyền `<MODULE_CODE>_READ` và phân hệ đang bật
(`ModuleRegistries.is_active`), mỗi nguồn trả tối đa `limit` bản ghi, xếp hạng: trùng mã > mã bắt đầu bằng
từ khóa > tên bắt đầu bằng từ khóa > chứa từ khóa. Thêm / bỏ app là thêm / bỏ nguồn tìm, không sửa lõi.
"""
import importlib
from dataclasses import dataclass, field
from typing import Callable

from django.apps import apps
from django.db import models
from django.db.models import Case, IntegerField, Q, QuerySet, Value, When

from .permissions import get_user_permissions


@dataclass(frozen=True)
class SearchProvider:
    """Một nguồn tìm kiếm = một bảng có mã + tên, gắn với một phân hệ RBAC."""

    module_code: str
    model: type[models.Model]
    code_field: str
    title_field: str
    # Đường dẫn mở kết quả; `{id}` / `{code}` được thay bằng giá trị bản ghi.
    # Phân hệ chưa có trang chi tiết → mở danh sách đã lọc: '/master-data/units?q={code}'
    url: str
    # Trường tìm thêm (không dùng để xếp hạng), vd. email, mã khuôn
    extra_fields: tuple[str, ...] = ()
    # Dòng phụ dưới tên (trường hoặc hàm nhận bản ghi), vd. tên nhóm
    subtitle: str | Callable[[models.Model], str | None] | None = None
    image_field: str | None = None
    # Lọc thêm / select_related (mặc định: manager mặc định — đã bỏ bản ghi xóa mềm)
    queryset: Callable[[], QuerySet] | None = None
    permission: str | None = None  # mặc định '<MODULE_CODE>_READ'
    select_related: tuple[str, ...] = field(default=())

    @property
    def required_permission(self) -> str:
        return self.permission or f'{self.module_code}_READ'

    def base_queryset(self) -> QuerySet:
        qs = self.queryset() if self.queryset else self.model._default_manager.all()
        return qs.select_related(*self.select_related) if self.select_related else qs

    def search(self, q: str, limit: int) -> list[dict]:
        lookup = Q(**{f'{self.code_field}__icontains': q}) | Q(**{f'{self.title_field}__icontains': q})
        for name in self.extra_fields:
            lookup |= Q(**{f'{name}__icontains': q})
        rank = Case(
            When(**{f'{self.code_field}__iexact': q}, then=Value(0)),
            When(**{f'{self.code_field}__istartswith': q}, then=Value(1)),
            When(**{f'{self.title_field}__istartswith': q}, then=Value(2)),
            default=Value(3),
            output_field=IntegerField(),
        )
        rows = self.base_queryset().filter(lookup).annotate(_rank=rank).order_by('_rank', self.title_field, 'pk')[:limit]
        return [self.serialize(obj) for obj in rows]

    def serialize(self, obj) -> dict:
        code = getattr(obj, self.code_field)
        if callable(self.subtitle):
            subtitle = self.subtitle(obj)
        else:
            subtitle = getattr(obj, self.subtitle, None) if self.subtitle else None
        image = getattr(obj, self.image_field, None) if self.image_field else None
        return {
            'id': obj.pk,
            'code': str(code) if code is not None else '',
            'title': str(getattr(obj, self.title_field) or code),
            'subtitle': str(subtitle) if subtitle else None,
            'image': str(image) if image else None,
            'url': self.url.format(id=obj.pk, code=code),
        }


def collect_search_providers() -> list[SearchProvider]:
    """Gom `SEARCH_PROVIDERS` từ `search.py` của các app `apps.*` đang cài (thứ tự theo INSTALLED_APPS)."""
    providers: list[SearchProvider] = []
    for config in apps.get_app_configs():
        if not config.name.startswith('apps.'):
            continue
        try:
            module = importlib.import_module(f'{config.name}.search')
        except ModuleNotFoundError as exc:
            if exc.name == f'{config.name}.search':
                continue
            raise
        providers.extend(getattr(module, 'SEARCH_PROVIDERS', []))
    return providers


def global_search(user, q: str, limit: int = 5) -> list[dict]:
    """Kết quả nhóm theo phân hệ, chỉ gồm phân hệ người dùng được xem và đang bật."""
    from apps.authentication.models import ModuleRegistry

    perms = get_user_permissions(user)
    allowed = [p for p in collect_search_providers() if '*' in perms or p.required_permission in perms]
    if not allowed:
        return []
    modules = {
        m.module_code: m
        for m in ModuleRegistry.objects.filter(module_code__in={p.module_code for p in allowed}, is_active=True)
    }
    groups = []
    for provider in allowed:
        module = modules.get(provider.module_code)
        if module is None:
            continue
        results = provider.search(q, limit)
        if results:
            groups.append({
                'module_code': provider.module_code,
                'module_name': module.localized_name(),
                'icon': module.icon,
                'route': module.route_path,
                'results': results,
            })
    return groups
