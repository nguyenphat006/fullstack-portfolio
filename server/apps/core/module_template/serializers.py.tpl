from rest_framework import serializers

from apps.core.messages import DUPLICATE_CODE, NAME_REQUIRED

from .models import __Model__


class __Model__Serializer(serializers.ModelSerializer):
    """Serializer ĐỌC — dùng cho mọi response (list, detail, sau create/update)."""
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True, default='')
    updated_by_name = serializers.CharField(source='updated_by.full_name', read_only=True, default='')
    created_at = serializers.DateTimeField(format="%d/%m/%Y %H:%M", read_only=True)
    updated_at = serializers.DateTimeField(format="%d/%m/%Y %H:%M", read_only=True)

    class Meta:
        model = __Model__
        fields = [
            'id', 'code', 'name', 'description', 'is_active',
            'created_by_name', 'updated_by_name', 'created_at', 'updated_at',
        ]
        read_only_fields = fields


class __Model__CreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer GHI — validate dữ liệu đầu vào, thông điệp tiếng Việt."""

    class Meta:
        model = __Model__
        fields = ['id', 'code', 'name', 'description', 'is_active']
        read_only_fields = ['id']

    def validate_code(self, value):
        code = value.strip().upper()
        qs = __Model__.all_objects.filter(code=code)
        if self.instance is not None:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(DUPLICATE_CODE % {"code": code})
        return code

    def validate_name(self, value):
        name = value.strip()
        if not name:
            raise serializers.ValidationError(NAME_REQUIRED)
        return name
