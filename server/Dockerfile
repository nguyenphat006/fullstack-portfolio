# Sử dụng Python 3.12 bản slim nhẹ và ổn định
FROM python:3.12-slim

# Thiết lập biến môi trường tránh sinh file .pyc và in log trực tiếp ra console
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Cài đặt các gói phụ thuộc hệ thống cần thiết cho PostgreSQL và Pillow
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    libjpeg-dev \
    zlib1g-dev \
    gettext \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Cài đặt Python packages
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# Sao chép mã nguồn vào container
COPY . /app/

# Mở cổng 8000
EXPOSE 8000

# Lệnh khởi động server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
