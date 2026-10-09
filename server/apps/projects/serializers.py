from rest_framework import serializers

from apps.core.messages import DUPLICATE_CODE, NAME_REQUIRED

from .models import Project

FIELDS = ['slug', 'title', 'summary', 'stack', 'year', 'image', 'color', 'role', 'content',
          'live_url', 'github_url', 'featured', 'description', 'is_active']


class ProjectSerializer(serializers.ModelSerializer):
    """Serializer ĐỌC — dùng cho mọi response (list, detail, sau create/update)."""
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True, default='')
    updated_by_name = serializers.CharField(source='updated_by.full_name', read_only=True, default='')
    created_at = serializers.DateTimeField(format="%d/%m/%Y %H:%M", read_only=True)
    updated_at = serializers.DateTimeField(format="%d/%m/%Y %H:%M", read_only=True)

    class Meta:
        model = Project
        fields = ['id', *FIELDS, 'created_by_name', 'updated_by_name', 'created_at', 'updated_at']
        read_only_fields = fields


class ProjectCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer GHI — validate dữ liệu đầu vào."""

    class Meta:
        model = Project
        fields = ['id', *FIELDS]
        read_only_fields = ['id']

    def validate_slug(self, value):
        slug = value.strip().lower()
        qs = Project.all_objects.filter(slug=slug)
        if self.instance is not None:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(DUPLICATE_CODE % {"code": slug})
        return slug

    def validate_title(self, value):
        title = value.strip()
        if not title:
            raise serializers.ValidationError(NAME_REQUIRED)
        return title
