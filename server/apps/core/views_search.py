"""Tìm kiếm toàn cục theo mã / tên trên mọi phân hệ người dùng được xem (xem `search_registry.py`)."""
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import permissions, serializers
from rest_framework.views import APIView

from .responses import success_response
from .search_registry import global_search

MIN_QUERY_LENGTH = 2
DEFAULT_LIMIT = 5
MAX_LIMIT = 10


class SearchResultSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    code = serializers.CharField()
    title = serializers.CharField()
    subtitle = serializers.CharField(allow_null=True)
    image = serializers.CharField(allow_null=True)
    url = serializers.CharField()


class SearchGroupSerializer(serializers.Serializer):
    module_code = serializers.CharField()
    module_name = serializers.CharField()
    icon = serializers.CharField(allow_null=True)
    route = serializers.CharField(allow_null=True)
    results = SearchResultSerializer(many=True)


class GlobalSearchView(APIView):
    """Chỉ cần đăng nhập; từng phân hệ tự lọc theo quyền `<MODULE>_READ` của người dùng."""
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        tags=['Tìm kiếm toàn cục (Global Search)'],
        summary="Tìm bản ghi theo mã / tên trên mọi phân hệ được phép xem",
        parameters=[
            OpenApiParameter('q', str, description=f"Từ khóa, tối thiểu {MIN_QUERY_LENGTH} ký tự"),
            OpenApiParameter('limit', int, description=f"Số kết quả mỗi phân hệ (mặc định {DEFAULT_LIMIT}, tối đa {MAX_LIMIT})"),
        ],
        responses=SearchGroupSerializer(many=True),
    )
    def get(self, request):
        q = (request.query_params.get('q') or '').strip()
        try:
            limit = min(max(int(request.query_params.get('limit', DEFAULT_LIMIT)), 1), MAX_LIMIT)
        except ValueError:
            limit = DEFAULT_LIMIT
        groups = global_search(request.user, q, limit) if len(q) >= MIN_QUERY_LENGTH else []
        return success_response(data=groups)
