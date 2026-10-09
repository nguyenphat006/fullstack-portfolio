from django.contrib import admin

from .models import Blog


@admin.register(Blog)
class BlogAdmin(admin.ModelAdmin):
    list_display = ('slug', 'title', 'category', 'is_active', 'updated_at')
    search_fields = ('slug', 'title')
    list_filter = ('is_active', 'category')
