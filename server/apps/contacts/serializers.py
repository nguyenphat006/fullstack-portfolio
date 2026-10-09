from rest_framework import serializers

from apps.core.messages import DUPLICATE_CODE, NAME_REQUIRED

from .models import Contact

FIELDS = ['name', 'email', 'message', 'description', 'is_active']


class ContactSerializer(serializers.ModelSerializer):
    """Serializer ĐỌC — dùng cho mọi response (list, detail, sau create/update)."""
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True, default='')
    updated_by_name = serializers.CharField(source='updated_by.full_name', read_only=True, default='')
    created_at = serializers.DateTimeField(format="%d/%m/%Y %H:%M", read_only=True)
    updated_at = serializers.DateTimeField(format="%d/%m/%Y %H:%M", read_only=True)

    class Meta:
        model = Contact
        fields = ['id', *FIELDS, 'created_by_name', 'updated_by_name', 'created_at', 'updated_at']
        read_only_fields = fields


class ContactCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer GHI — validate dữ liệu đầu vào."""

    class Meta:
        model = Contact
        fields = ['id', *FIELDS]
        read_only_fields = ['id']

    def validate_name(self, value):
        name = value.strip()
        if not name:
            raise serializers.ValidationError(NAME_REQUIRED)
        return name
