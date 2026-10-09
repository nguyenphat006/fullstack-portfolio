"""
Django settings for Admin Template project.
"""

import os
import sys
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env
load_dotenv(os.path.join(BASE_DIR, '.env'))

# Add 'apps' to Python sys.path for cleaner imports
sys.path.insert(0, os.path.join(BASE_DIR, 'apps'))

from django.core.exceptions import ImproperlyConfigured


def env_bool(name: str, default: bool = False) -> bool:
    return os.getenv(name, str(default)).strip().lower() in ('true', '1', 't', 'yes')


# Mặc định AN TOÀN: DEBUG tắt. Môi trường dev bật bằng DEBUG=True trong server/.env
DEBUG = env_bool('DEBUG', False)
RUNNING_TESTS = 'test' in sys.argv

# SECRET_KEY bắt buộc ở production. Chỉ dev/test mới được dùng khóa dự phòng.
# Tạo khóa: python -c "from django.core.management.utils import get_random_secret_key as g; print(g())"
SECRET_KEY = os.getenv('SECRET_KEY')
if not SECRET_KEY:
    if DEBUG or RUNNING_TESTS:
        SECRET_KEY = 'django-insecure-dev-only-key-do-not-use-in-production'
    else:
        raise ImproperlyConfigured("Thiếu biến môi trường SECRET_KEY (bắt buộc khi DEBUG=False).")

ALLOWED_HOSTS = ['*'] if DEBUG else [host.strip() for host in os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',') if host.strip()]

# Bảo mật khi chạy production (DEBUG=False) — phía sau reverse proxy HTTPS (nginx / Caddy / Render...)
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_SSL_REDIRECT = env_bool('SECURE_SSL_REDIRECT', True)
    # Healthcheck nội bộ container gọi http://127.0.0.1 -> không redirect HTTPS, luôn được phép host nội bộ
    SECURE_REDIRECT_EXEMPT = [r'^api/v1/health/$']
    ALLOWED_HOSTS = [*ALLOWED_HOSTS, '127.0.0.1', 'localhost']
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    # HSTS: chỉ bật khi chắc chắn toàn bộ domain chạy HTTPS (khó hoàn tác) -> mặc định 0, cấu hình qua env
    SECURE_HSTS_SECONDS = int(os.getenv('SECURE_HSTS_SECONDS', '0'))
    SECURE_HSTS_INCLUDE_SUBDOMAINS = env_bool('SECURE_HSTS_INCLUDE_SUBDOMAINS', False)
    SECURE_HSTS_PRELOAD = env_bool('SECURE_HSTS_PRELOAD', False)
    CSRF_TRUSTED_ORIGINS = [o.strip() for o in os.getenv('CSRF_TRUSTED_ORIGINS', '').split(',') if o.strip()]

# Application definition
DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'pgtrigger',
    'pghistory',
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',
    'drf_spectacular',
]

LOCAL_APPS = [
    'apps.core',
    'apps.authentication',
    'apps.audit',
    'apps.dashboard',
    'apps.projects',
    'apps.blogs',
    'apps.contacts',
    # [startmodule] app mới được chèn phía trên dòng này
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# Custom User Model
AUTH_USER_MODEL = 'authentication.CustomUser'

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Phải đứng đầu tiên
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # static files khi chạy gunicorn (production)
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.locale.LocaleMiddleware',  # ngôn ngữ theo header Accept-Language (frontend gửi theo lựa chọn)
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'pghistory.middleware.HistoryMiddleware',
    'apps.core.middleware.JWTHistoryContextMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

# Database Configuration (Hỗ trợ Neon DB / Cloud PostgreSQL qua DATABASE_URL hoặc Docker/Local)
DATABASE_URL = os.getenv('DATABASE_URL')

if DATABASE_URL:
    import dj_database_url
    DATABASES = {
        'default': dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            ssl_require='neon.tech' in DATABASE_URL or 'sslmode=require' in DATABASE_URL
        )
    }
elif os.getenv('DB_ENGINE', 'sqlite').lower() == 'postgres':
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME', 'app_db'),
            'USER': os.getenv('DB_USER', 'postgres'),
            'PASSWORD': os.getenv('DB_PASSWORD', 'postgres'),
            'HOST': os.getenv('DB_HOST', 'localhost'),
            'PORT': os.getenv('DB_PORT', '5432'),
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Unit test: không chạy trên Cloud DB dùng chung (Neon) -> dùng TEST_DATABASE_URL
# (mặc định Postgres local của docker-compose). Django tự tạo/xóa DB "test_<name>".
if RUNNING_TESTS:
    import dj_database_url
    DATABASES = {
        'default': dj_database_url.parse(
            os.getenv('TEST_DATABASE_URL', 'postgres://postgres:postgres@localhost:5432/app_db')
        )
    }

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {'min_length': 6},
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
# Đa ngôn ngữ: tiếng Việt mặc định; chuỗi hiển thị bọc gettext_lazy, bản dịch ở server/locale/<lang>/LC_MESSAGES/django.po
LANGUAGE_CODE = 'vi'
LANGUAGES = [('vi', 'Tiếng Việt'), ('en', 'English')]
LOCALE_PATHS = [BASE_DIR / 'locale']
TIME_ZONE = 'Asia/Ho_Chi_Minh'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Production: whitenoise nén + gắn hash tên file static (collectstatic trong Dockerfile.prod)
STORAGES = {
    'default': {'BACKEND': 'django.core.files.storage.FileSystemStorage'},
    'staticfiles': {
        'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage'
        if DEBUG or RUNNING_TESTS
        else 'whitenoise.storage.CompressedManifestStaticFilesStorage',
    },
}

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Caching Configuration
# Có REDIS_CACHE_URL -> dùng Redis (bắt buộc khi chạy nhiều process: gunicorn workers + Celery,
# vì cache quyền RBAC phải được invalidate đồng bộ giữa các process).
# Không có -> LocMemCache (chỉ phù hợp dev 1 process / unit test).
REDIS_CACHE_URL = os.getenv('REDIS_CACHE_URL')
if REDIS_CACHE_URL and not RUNNING_TESTS:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.redis.RedisCache',
            'LOCATION': REDIS_CACHE_URL,
            'TIMEOUT': 1800,  # 30 phút
            # Tiền tố riêng mỗi dự án: nhiều dự án clone từ template dùng chung 1 Redis thì cache quyền /
            # menu của user cùng id sẽ lẫn sang nhau. Mặc định theo tên CSDL.
            'KEY_PREFIX': os.getenv('CACHE_KEY_PREFIX') or str(DATABASES['default'].get('NAME') or 'erp'),
        }
    }
else:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'LOCATION': 'app-cache',
            'TIMEOUT': 1800,
        }
    }

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000').split(',')
    if origin.strip()
]
CORS_ALLOW_CREDENTIALS = True

# Django REST Framework Settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'apps.core.pagination.StandardResultsSetPagination',
    'PAGE_SIZE': 10,
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ),
    # Mọi response JSON được bọc envelope chuẩn {success, message, data, errors, code} (apps/core/responses.py)
    'DEFAULT_RENDERER_CLASSES': (
        'apps.core.renderers.EnvelopeJSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ) if DEBUG else (
        'apps.core.renderers.EnvelopeJSONRenderer',
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'EXCEPTION_HANDLER': 'apps.core.exceptions.custom_exception_handler',
}

# SimpleJWT Configuration
JWT_ACCESS_MINUTES = int(os.getenv('JWT_ACCESS_TOKEN_LIFETIME_MINUTES', 60))
JWT_REFRESH_DAYS = int(os.getenv('JWT_REFRESH_TOKEN_LIFETIME_DAYS', 7))

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=JWT_ACCESS_MINUTES),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=JWT_REFRESH_DAYS),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'TOKEN_TYPE_CLAIM': 'token_type',
}

# drf-spectacular (OpenAPI 3.0 / Swagger UI)
SPECTACULAR_SETTINGS = {
    'TITLE': 'Portfolio API Documentation',
    'DESCRIPTION': 'API quản trị nội dung Portfolio (Django + Next.js, tác giả: ERICSS)',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
    'SCHEMA_PATH_PREFIX': '/api/v1',
}

# ==============================================================================
# Celery & Redis Task Queue Configuration
# ==============================================================================
CELERY_BROKER_URL = os.getenv('CELERY_BROKER_URL', 'redis://127.0.0.1:6379/0')
CELERY_RESULT_BACKEND = os.getenv('CELERY_RESULT_BACKEND', 'redis://127.0.0.1:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60  # 30 phút tối đa cho tác vụ nặng
CELERY_BROKER_CONNECTION_TIMEOUT = 5.0
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True

# Khi chạy unit test: tự động chuyển sang chế độ EAGER (thực thi đồng bộ không cần Redis)
if RUNNING_TESTS:
    CELERY_TASK_ALWAYS_EAGER = True
    CELERY_TASK_EAGER_PROPAGATES = True
