from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
import json

import pghistory.models
from django.apps import apps as django_apps
from django.db import models as dj_models
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from django.utils.translation import gettext, gettext_lazy as _

from apps.authentication.serializers import ACTION_NAME_MAP

MODEL_LABEL_MAP = {
    'authentication.customuser': _('Người dùng (Users)'),
    'authentication.role': _('Vai trò (Roles)'),
    'authentication.moduleregistry': _('Phân hệ & Điều hướng (ModuleRegistries)'),
    'master_data.unitofmeasure': _('Đơn vị tính (UnitsOfMeasure)'),
}

def action_label(code: str) -> str:
    """Nhãn hành động theo ngôn ngữ của request: 'CREATE - Tạo Mới Dữ liệu'."""
    name = ACTION_NAME_MAP.get(code)
    return f"{code} - {gettext(name)}" if name else code

LABEL_TO_RBAC_ACTION = {
    'insert': 'CREATE',
    'create': 'CREATE',
    'update': 'UPDATE',
    'delete': 'DELETE',
    'approve': 'APPROVE',
    'release': 'RELEASE',
    'execute': 'EXECUTE',
    'export': 'EXPORT',
    'import': 'IMPORT',
    'config': 'CONFIG',
    'view': 'VIEW',
    'read': 'READ',
    'snapshot': 'SNAPSHOT',
}

class AuditUserSerializer(serializers.Serializer):
    """Người thực hiện thao tác (trích từ pgh_context) — chỉ dùng mô tả OpenAPI."""
    id = serializers.IntegerField(allow_null=True)
    username = serializers.CharField()
    full_name = serializers.CharField()
    email = serializers.CharField(allow_blank=True)
    roles = serializers.ListField(child=serializers.CharField())


class AuditDiffItemSerializer(serializers.Serializer):
    """Một thay đổi trường dữ liệu — chỉ dùng mô tả OpenAPI."""
    field = serializers.CharField()
    label = serializers.CharField()
    old_value = serializers.JSONField(allow_null=True)
    new_value = serializers.JSONField(allow_null=True)
    old_display = serializers.CharField(allow_null=True)
    new_display = serializers.CharField(allow_null=True)


class AuditLogEventSerializer(serializers.ModelSerializer):
    """
    Serializer chuẩn hóa dữ liệu sự kiện từ pghistory.models.Events
    để hiển thị trên giao diện DataTable và Diff Drawer của Frontend.
    Toàn bộ mã hành động (action_code) và nhãn (action_label) được chuẩn hóa đồng bộ 100% với RBAC.
    """
    id = serializers.CharField(source='pgh_slug', read_only=True)
    created_at = serializers.DateTimeField(source='pgh_created_at', format="%d/%m/%Y %H:%M:%S", read_only=True)
    model_name = serializers.SerializerMethodField()
    model_code = serializers.CharField(source='pgh_obj_model', read_only=True)
    action_label = serializers.SerializerMethodField()
    action_code = serializers.SerializerMethodField()
    object_id = serializers.IntegerField(source='pgh_obj_id', read_only=True)
    user = serializers.SerializerMethodField()
    url = serializers.SerializerMethodField()
    ip_address = serializers.SerializerMethodField()
    user_agent = serializers.SerializerMethodField()
    http_method = serializers.SerializerMethodField()
    diff = serializers.SerializerMethodField()
    snapshot = serializers.JSONField(source='pgh_data', read_only=True)

    class Meta:
        model = pghistory.models.Events
        fields = [
            'id',
            'created_at',
            'model_name',
            'model_code',
            'action_label',
            'action_code',
            'object_id',
            'user',
            'url',
            'ip_address',
            'user_agent',
            'http_method',
            'diff',
            'snapshot',
        ]

    def _resolve_rbac_action(self, obj):
        # 1. Ưu tiên action được ghi vết tường minh trong context
        context = obj.pgh_context or {}
        if isinstance(context, dict) and context.get('rbac_action'):
            act = str(context['rbac_action']).upper()
            if act in ACTION_NAME_MAP:
                return act

        # 2. Nhận diện thao tác Soft Delete (update có trường deleted_at)
        if obj.pgh_label == 'update' and obj.pgh_diff and isinstance(obj.pgh_diff, dict):
            if 'deleted_at' in obj.pgh_diff:
                return 'DELETE'

        # 3. Map từ pgh_label cơ sở dữ liệu
        label = (obj.pgh_label or '').lower()
        return LABEL_TO_RBAC_ACTION.get(label, (obj.pgh_label or 'UPDATE').upper())

    def get_model_name(self, obj) -> str:
        model_key = (obj.pgh_obj_model or '').lower()
        if model_key in MODEL_LABEL_MAP:
            return str(MODEL_LABEL_MAP[model_key])
        model = _resolve_model(obj.pgh_obj_model)
        return str(model._meta.verbose_name) if model else (obj.pgh_obj_model or gettext('Chưa xác định'))

    def get_action_code(self, obj) -> str:
        return self._resolve_rbac_action(obj)

    def get_action_label(self, obj) -> str:
        code = self._resolve_rbac_action(obj)
        if code == 'SNAPSHOT':
            return gettext("SNAPSHOT - Ảnh Chụp Định Kỳ")
        return action_label(code)

    @extend_schema_field(AuditUserSerializer)
    def get_user(self, obj):
        context = obj.pgh_context or {}
        if isinstance(context, dict):
            # Trích xuất user từ JWTHistoryContextMiddleware hoặc HistoryMiddleware
            user_id = context.get('user_id') or context.get('user')
            username = context.get('username') or ('User #' + str(user_id) if user_id else gettext('Hệ thống'))
            full_name = context.get('full_name') or username
            email = context.get('email', '')
            return {
                'id': user_id,
                'username': username,
                'full_name': full_name,
                'email': email,
                'roles': self._user_roles(user_id),
            }
        return {
            'id': None,
            'username': gettext('Hệ thống'),
            'full_name': gettext('Hệ thống (Auto)'),
            'email': '',
            'roles': [],
        }

    def _cache(self, name):
        # context dùng chung cho mọi dòng của ListSerializer → mỗi user / bản ghi liên kết chỉ tra 1 lần mỗi trang
        return self.context.setdefault('_audit_cache', {}).setdefault(name, {})

    def _user_roles(self, user_id):
        if not user_id:
            return []
        cache = self._cache('roles')
        if user_id not in cache:
            from apps.authentication.models import UserRole
            cache[user_id] = list(
                UserRole.objects.filter(user_id=user_id, role__deleted_at__isnull=True)
                .order_by('role__role_name').values_list('role__role_name', flat=True)
            )
        return cache[user_id]

    def get_url(self, obj) -> str:
        context = obj.pgh_context or {}
        if isinstance(context, dict):
            return context.get('url', '')
        return ''

    def get_ip_address(self, obj) -> str:
        context = obj.pgh_context or {}
        if isinstance(context, dict):
            return context.get('ip_address', '')
        return ''

    def get_user_agent(self, obj) -> str:
        context = obj.pgh_context or {}
        if isinstance(context, dict):
            return context.get('user_agent', '')
        return ''

    def get_http_method(self, obj) -> str:
        context = obj.pgh_context or {}
        if isinstance(context, dict):
            return context.get('http_method', '')
        return ''

    @extend_schema_field(AuditDiffItemSerializer(many=True))
    def get_diff(self, obj):
        """Trường thay đổi kèm nhãn trường và giá trị dễ đọc (tên bản ghi liên kết, nhãn lựa chọn, ngày giờ)."""
        model = _resolve_model(obj.pgh_obj_model)
        changes = []
        raw_diff = obj.pgh_diff
        if raw_diff and isinstance(raw_diff, dict):
            for field_name, change in raw_diff.items():
                if isinstance(change, (list, tuple)) and len(change) == 2:
                    changes.append((field_name, change[0], change[1]))
                elif isinstance(change, dict):
                    changes.append((field_name, change.get('old'), change.get('new')))
                else:
                    changes.append((field_name, None, change))
        elif (obj.pgh_label or '').lower() in ('insert', 'create') and isinstance(obj.pgh_data, dict):
            # Thêm mới: liệt kê các trường có giá trị ban đầu
            changes = [(k, None, v) for k, v in obj.pgh_data.items() if v not in (None, '', [], {})]
        elif obj.pgh_label == 'update' and obj.pgh_data:
            # Không có pgh_diff: so với ảnh chụp liền trước của cùng đối tượng
            prev = pghistory.models.Events.objects.filter(
                pgh_obj_model=obj.pgh_obj_model,
                pgh_obj_id=obj.pgh_obj_id,
                pgh_created_at__lt=obj.pgh_created_at,
            ).order_by('-pgh_created_at').first()
            if prev and prev.pgh_data:
                keys = sorted(set(obj.pgh_data) | set(prev.pgh_data))
                changes = [
                    (k, prev.pgh_data.get(k), obj.pgh_data.get(k))
                    for k in keys if prev.pgh_data.get(k) != obj.pgh_data.get(k)
                ]

        result = []
        for field_name, old, new in changes:
            if field_name.lower() in HIDDEN_DIFF_FIELDS:
                continue
            field = _model_field(model, field_name)
            label = str(field.verbose_name) if field is not None else field_name
            result.append({
                'field': field_name,
                'label': label[:1].upper() + label[1:],
                'old_value': old,
                'new_value': new,
                'old_display': self._display(field, old),
                'new_display': self._display(field, new),
            })
        return result

    def _display(self, field, value):
        """Giá trị hiển thị; None = frontend tự định dạng giá trị gốc (số, có / không...)."""
        if value is None or field is None:
            return None
        if isinstance(field, dj_models.ForeignKey):
            cache = self._cache('related')
            key = (field.related_model._meta.label_lower, value)
            if key not in cache:
                related = field.related_model._base_manager.filter(pk=value).first()
                cache[key] = str(related) if related is not None else f"#{value}"
            return cache[key]
        if field.choices:
            return str(dict(field.flatchoices).get(value, value))
        if isinstance(field, dj_models.DateTimeField) and isinstance(value, str):
            parsed = parse_datetime(value)
            if parsed is not None:
                return timezone.localtime(parsed).strftime('%d/%m/%Y %H:%M')
        if isinstance(value, (dict, list)):
            return json.dumps(value, ensure_ascii=False)
        return None


# Trường kỹ thuật không hiện trong nhật ký (thời điểm hệ thống; người tạo / sửa đã có ở "Người thực hiện")
HIDDEN_DIFF_FIELDS = {
    'pgh_id', 'pgh_created_at', 'pgh_obj_id', 'pgh_label', 'pgh_context_id', 'id',
    'created_at', 'updated_at', 'deleted_at', 'last_login', 'date_joined', 'password',
    'created_by_id', 'updated_by_id',
}


def _resolve_model(model_code):
    try:
        return django_apps.get_model(model_code) if model_code else None
    except (LookupError, ValueError):
        return None


def _model_field(model, name):
    if model is None:
        return None
    for field in model._meta.concrete_fields:
        if name in (field.attname, field.name):
            return field
    return None
