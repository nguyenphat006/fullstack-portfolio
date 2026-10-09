from django.contrib import admin

from .models import __Model__


@admin.register(__Model__)
class __Model__Admin(admin.ModelAdmin):
    list_display = ('code', 'name', 'is_active', 'updated_at')
    search_fields = ('code', 'name')
    list_filter = ('is_active',)
