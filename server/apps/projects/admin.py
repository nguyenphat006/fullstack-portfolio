from django.contrib import admin

from .models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('slug', 'title', 'year', 'featured', 'is_active', 'updated_at')
    search_fields = ('slug', 'title')
    list_filter = ('is_active', 'featured')
