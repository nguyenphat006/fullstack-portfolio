"""
Trang Tổng quan: 1 endpoint gộp mọi số liệu (KPI, biểu đồ, hoạt động gần đây).

- Mỗi khối chỉ trả khi user có quyền READ tương ứng, ngược lại trả `null` (frontend ẩn khối).
- Cache 60 giây theo user (Redis) — trang tổng quan không cần số liệu từng giây.
- Thêm KPI cho module mới: viết 1 hàm `_kpi_<ten>` trả `{value, previous}` rồi gắn vào `KPI_BUILDERS`.
"""
from datetime import timedelta
from django.utils.translation import gettext as _

from django.apps import apps
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.utils import translation
from django.db.models import Count
from django.db.models.functions import Coalesce, TruncDate
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import permissions, serializers
from rest_framework.views import APIView

from apps.core.permissions import get_user_permissions
from apps.core.responses import success_response

CACHE_SECONDS = 60
ACTIVITY_DAYS = 14
TOP_CATEGORIES = 6
RECENT_LIMIT = 8


def _can(perms: set, code: str) -> bool:
    return '*' in perms or code in perms


def _window(qs, field: str, days: int, now):
    """Đếm bản ghi trong `days` ngày gần nhất và `days` ngày liền trước (để so sánh)."""
    start = now - timedelta(days=days)
    prev_start = start - timedelta(days=days)
    current = qs.filter(**{f'{field}__gte': start}).count()
    previous = qs.filter(**{f'{field}__gte': prev_start, f'{field}__lt': start}).count()
    return current, previous


def _kpi_users(user, perms, now):
    if not _can(perms, 'USER_READ'):
        return None
    users = get_user_model().objects.filter(deleted_at__isnull=True)
    new_30, prev_30 = _window(users, 'created_at', 30, now)
    return {
        'key': 'users', 'label': _('Người dùng hoạt động'), 'value': users.filter(is_active=True).count(),
        'delta': new_30, 'previous': prev_30, 'hint': _('tài khoản mới trong 30 ngày'), 'href': '/users',
    }


def _kpi_materials(user, perms, now):
    if not apps.is_installed('apps.master_data') or not _can(perms, 'MATERIAL_READ'):
        return None
    Material = apps.get_model('master_data', 'Material')
    qs = Material.objects.all()
    new_30, prev_30 = _window(qs, 'created_at', 30, now)
    return {
        'key': 'materials', 'label': _('Nguyên vật liệu'), 'value': qs.count(),
        'delta': new_30, 'previous': prev_30, 'hint': _('thêm mới trong 30 ngày'), 'href': '/master-data/materials',
    }


def _kpi_exports(user, perms, now):
    DataTransferJob = apps.get_model('core', 'DataTransferJob')
    qs = DataTransferJob.objects.all()
    if not ('*' in perms):
        qs = qs.filter(created_by=user)  # người thường chỉ thấy tác vụ của mình
    current, previous = _window(qs, 'created_at', 7, now)
    return {
        'key': 'exports', 'label': _('Tác vụ xuất dữ liệu'), 'value': current,
        'delta': current - previous, 'previous': previous, 'hint': _('so với 7 ngày trước'), 'href': None,
    }


def _events():
    import pghistory.models
    return pghistory.models.Events.objects.all()


def _kpi_activity(user, perms, now):
    if not _can(perms, 'AUDIT_LOGS_READ'):
        return None
    today = timezone.localdate()
    qs = _events()
    current = qs.filter(pgh_created_at__date=today).count()
    previous = qs.filter(pgh_created_at__date=today - timedelta(days=1)).count()
    return {
        'key': 'activity', 'label': _('Thao tác hôm nay'), 'value': current,
        'delta': current - previous, 'previous': previous, 'hint': _('so với hôm qua'), 'href': '/audit-logs',
    }


KPI_BUILDERS = [_kpi_users, _kpi_materials, _kpi_exports, _kpi_activity]


def _activity_series(perms):
    if not _can(perms, 'AUDIT_LOGS_READ'):
        return None
    today = timezone.localdate()
    start = today - timedelta(days=ACTIVITY_DAYS - 1)
    rows = (
        _events()
        .filter(pgh_created_at__date__gte=start)
        .annotate(day=TruncDate('pgh_created_at'))
        .values('day')
        .annotate(count=Count('pgh_slug'))
    )
    counts = {r['day']: r['count'] for r in rows}
    return [
        {'date': (start + timedelta(days=i)).isoformat(), 'count': counts.get(start + timedelta(days=i), 0)}
        for i in range(ACTIVITY_DAYS)
    ]


def _materials_by_category(perms):
    if not apps.is_installed('apps.master_data') or not _can(perms, 'MATERIAL_READ'):
        return None
    Material = apps.get_model('master_data', 'Material')
    rows = list(
        Material.objects
        .annotate(group=Coalesce('category__parent__name', 'category__name'))
        .values('group')
        .annotate(count=Count('id'))
        .order_by('-count')
    )
    top = [{'label': r['group'] or _('Chưa phân nhóm'), 'count': r['count']} for r in rows[:TOP_CATEGORIES]]
    rest = sum(r['count'] for r in rows[TOP_CATEGORIES:])
    if rest:
        top.append({'label': _('Khác'), 'count': rest})
    return top


def _recent_activity(perms):
    if not _can(perms, 'AUDIT_LOGS_READ'):
        return None
    from apps.audit.serializers import AuditLogEventSerializer
    events = _events().order_by('-pgh_created_at')[:RECENT_LIMIT]
    data = AuditLogEventSerializer(events, many=True).data
    return [
        {
            'id': e['id'], 'created_at': e['created_at'], 'user': (e.get('user') or {}).get('full_name') or (e.get('user') or {}).get('username') or _('Hệ thống'),
            'action_code': e['action_code'], 'model_name': e['model_name'], 'object_id': e['object_id'],
        }
        for e in data
    ]


class KpiSerializer(serializers.Serializer):
    key = serializers.CharField()
    label = serializers.CharField()
    value = serializers.IntegerField()
    delta = serializers.IntegerField()
    previous = serializers.IntegerField()
    hint = serializers.CharField()
    href = serializers.CharField(allow_null=True)


class ActivityPointSerializer(serializers.Serializer):
    date = serializers.DateField()
    count = serializers.IntegerField()


class CategoryCountSerializer(serializers.Serializer):
    label = serializers.CharField()
    count = serializers.IntegerField()


class RecentActivitySerializer(serializers.Serializer):
    id = serializers.CharField()
    created_at = serializers.CharField()
    user = serializers.CharField()
    action_code = serializers.CharField()
    model_name = serializers.CharField()
    object_id = serializers.IntegerField(allow_null=True)


class DashboardOverviewSerializer(serializers.Serializer):
    kpis = KpiSerializer(many=True)
    activity = ActivityPointSerializer(many=True, allow_null=True)
    materials_by_category = CategoryCountSerializer(many=True, allow_null=True)
    recent_activity = RecentActivitySerializer(many=True, allow_null=True)


class DashboardOverviewView(APIView):
    """Số liệu trang Tổng quan (chỉ cần đăng nhập; từng khối tự lọc theo quyền của user)."""
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(tags=['Tổng quan (Dashboard)'], summary='Số liệu trang Tổng quan', responses=DashboardOverviewSerializer)
    def get(self, request):
        cache_key = f'dashboard_overview_{request.user.id}_{translation.get_language()}'  # nhãn theo ngôn ngữ
        data = cache.get(cache_key)
        if data is None:
            perms = get_user_permissions(request.user)
            now = timezone.now()
            data = {
                'kpis': [k for k in (builder(request.user, perms, now) for builder in KPI_BUILDERS) if k],
                'activity': _activity_series(perms),
                'materials_by_category': _materials_by_category(perms),
                'recent_activity': _recent_activity(perms),
            }
            data = DashboardOverviewSerializer(data).data
            cache.set(cache_key, data, CACHE_SECONDS)
        return success_response(data=data)
