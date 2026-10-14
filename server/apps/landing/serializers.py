from rest_framework import serializers

from .models import LandingSection


class LandingSectionSerializer(serializers.ModelSerializer):
    updated_by_name = serializers.CharField(source='updated_by.full_name', read_only=True, default='')
    updated_at = serializers.DateTimeField(format="%d/%m/%Y %H:%M", read_only=True)

    class Meta:
        model = LandingSection
        fields = ['id', 'key', 'content', 'content_en', 'sort_order', 'is_active', 'updated_by_name', 'updated_at']
        read_only_fields = ['id', 'key', 'updated_by_name', 'updated_at']


class LandingSectionUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LandingSection
        fields = ['content', 'content_en', 'is_active']

    def validate_content(self, value):
        if not isinstance(value, (dict, list)):
            raise serializers.ValidationError('Nội dung phải là JSON (object hoặc mảng).')
        return value

    validate_content_en = validate_content
