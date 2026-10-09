from rest_framework import serializers

class DynamicFieldsModelSerializer(serializers.ModelSerializer):
    """
    Serializer cho phép lọc linh hoạt các trường trả về qua query param `?fields=id,code,name`.
    Giúp Frontend giảm 80% dung lượng payload khi chỉ cần lấy danh sách cho Dropdown/Select.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        request = self.context.get('request', None)
        if request and hasattr(request, 'query_params'):
            fields_param = request.query_params.get('fields', None)
            if fields_param:
                field_names = [f.strip() for f in fields_param.split(',') if f.strip()]
                allowed = set(field_names)
                existing = set(self.fields.keys())
                for field_name in existing - allowed:
                    self.fields.pop(field_name)


class AuditModelSerializer(DynamicFieldsModelSerializer):
    """
    Serializer cơ sở dành cho các Model kế thừa từ `AuditModel`.
    Tự động format thông tin người tạo và người sửa dưới dạng text dễ đọc cho UI.
    """
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True, default=None)
    updated_by_name = serializers.CharField(source='updated_by.full_name', read_only=True, default=None)

    class Meta:
        fields = '__all__'
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
            'deleted_at',
            'created_by',
            'updated_by',
            'created_by_name',
            'updated_by_name'
        ]


class AttachmentSerializer(AuditModelSerializer):
    """
    Serializer cho tệp đính kèm đa hình (Attachments).
    """
    # Link có chữ ký, hết hạn — không lộ đường dẫn /media công khai
    file_url = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(format="%d/%m/%Y %H:%M", read_only=True)
    file_size_formatted = serializers.SerializerMethodField()

    class Meta:
        from .models import Attachment
        model = Attachment
        fields = [
            'id',
            'entity_type',
            'entity_id',
            'file',
            'file_name',
            'file_url',
            'file_size',
            'file_size_formatted',
            'mime_type',
            'file_category',
            'description',
            'is_active',
            'created_by',
            'created_by_name',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'file_url',
            'file_size_formatted',
            'created_at',
            'updated_at',
            'created_by',
            'created_by_name',
        ]
        extra_kwargs = {
            'file': {'write_only': True},
            'file_name': {'required': False},
            'file_size': {'required': False},
            'mime_type': {'required': False},
        }

    def get_file_url(self, obj) -> str:
        from .attachment_access import signed_file_url
        return signed_file_url(obj.id) if obj.file else ""

    def get_file_size_formatted(self, obj) -> str:
        size = obj.file_size or 0
        if size < 1024:
            return f"{size} B"
        elif size < 1024 * 1024:
            return f"{size / 1024:.1f} KB"
        else:
            return f"{size / (1024 * 1024):.2f} MB"

    def validate(self, attrs):
        file_obj = attrs.get('file')
        if file_obj:
            if not attrs.get('file_name'):
                attrs['file_name'] = file_obj.name
            if not attrs.get('file_size'):
                attrs['file_size'] = file_obj.size
            if not attrs.get('mime_type'):
                attrs['mime_type'] = getattr(file_obj, 'content_type', '')
        return super().validate(attrs)

    def create(self, validated_data):
        return super().create(validated_data)


class DataTransferJobSerializer(serializers.ModelSerializer):
    """Trạng thái tác vụ nền Xuất / Nhập dữ liệu (polling tiến độ từ FloatingTaskWidget)."""
    job_type_display = serializers.CharField(source='get_job_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        from .models import DataTransferJob
        model = DataTransferJob
        fields = [
            'id', 'job_type', 'job_type_display', 'entity_type', 'status', 'status_display',
            'progress', 'total_rows', 'processed_rows', 'file_url', 'error_message',
            'created_at', 'started_at', 'completed_at',
        ]
        read_only_fields = fields
