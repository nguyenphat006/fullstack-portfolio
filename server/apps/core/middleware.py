import pghistory
from rest_framework_simplejwt.authentication import JWTAuthentication

class JWTHistoryContextMiddleware:
    """
    Middleware trích xuất JWT Token, Client IP, User Agent và gán Context vào pghistory
    để mọi thay đổi qua API đều được ghi vết chính xác Người dùng & Thiết bị thực hiện
    ở tầng PostgreSQL Triggers.
    """
    def __init__(self, get_response):
        self.get_response = get_response
        self.jwt_authenticator = JWTAuthentication()

    @staticmethod
    def get_client_ip(request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip or '127.0.0.1'

    def __call__(self, request):
        ip_address = self.get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        http_method = request.method
        url = request.path

        # Tự động suy diễn RBAC action từ HTTP Request & Header
        rbac_action = request.headers.get('X-Action')
        if not rbac_action:
            path_lower = url.lower()
            if '/approve' in path_lower:
                rbac_action = 'APPROVE'
            elif '/release' in path_lower:
                rbac_action = 'RELEASE'
            elif '/execute' in path_lower:
                rbac_action = 'EXECUTE'
            elif '/export' in path_lower:
                rbac_action = 'EXPORT'
            elif '/import' in path_lower:
                rbac_action = 'IMPORT'
            elif '/config' in path_lower or '/settings' in path_lower:
                rbac_action = 'CONFIG'
            elif http_method == 'POST':
                rbac_action = 'CREATE'
            elif http_method in ['PUT', 'PATCH']:
                rbac_action = 'UPDATE'
            elif http_method == 'DELETE':
                rbac_action = 'DELETE'
            else:
                rbac_action = 'READ'

        context_data = {
            'ip_address': ip_address,
            'user_agent': user_agent,
            'http_method': http_method,
            'url': url,
            'rbac_action': rbac_action,
        }

        auth_header = request.headers.get('Authorization') or request.META.get('HTTP_AUTHORIZATION')
        if auth_header and auth_header.startswith('Bearer '):
            try:
                auth_result = self.jwt_authenticator.authenticate(request)
                if auth_result is not None:
                    user, token = auth_result
                    request.user = user
                    context_data.update({
                        'user_id': user.id,
                        'username': user.username,
                        'full_name': getattr(user, 'full_name', user.username),
                        'email': getattr(user, 'email', ''),
                    })
            except Exception:
                pass

        try:
            pghistory.context(**context_data)
        except Exception:
            pass

        return self.get_response(request)
