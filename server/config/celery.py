import os
from celery import Celery

# Thiết lập Django settings module mặc định cho 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('app')

# Sử dụng chuỗi cấu hình tiền tố 'CELERY_' từ settings.py.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Tự động tìm kiếm các tasks.py trong tất cả các installed apps.
app.autodiscover_tasks()


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
