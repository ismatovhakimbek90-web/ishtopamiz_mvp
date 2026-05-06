from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Job, Application

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'role', 'city', 'is_active']
    list_filter = ['role', 'is_active']
    fieldsets = UserAdmin.fieldsets + (
        ('IshTop Ma\'lumotlari', {'fields': ('role', 'age', 'city', 'bio', '_skills', 'company', 'industry', 'website')}),
    )

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ['title', 'company', 'location', 'salary', 'created_at']
    list_filter = ['location']

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ['seeker', 'job', 'status', 'created_at']
    list_filter = ['status']
