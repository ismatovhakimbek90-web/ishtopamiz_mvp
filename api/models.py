from django.db import models
from django.contrib.auth.models import AbstractUser
import json

class User(AbstractUser):
    ROLE_CHOICES = [('seeker', 'Ish Qidiruvchi'), ('employer', 'Ish Beruvchi')]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='seeker')
    age = models.IntegerField(null=True, blank=True)
    city = models.CharField(max_length=100, blank=True)
    bio = models.TextField(blank=True)
    _skills = models.TextField(blank=True, default='[]', db_column='skills')
    company = models.CharField(max_length=200, blank=True)
    industry = models.CharField(max_length=200, blank=True)
    website = models.URLField(blank=True)

    @property
    def skills(self):
        try: return json.loads(self._skills)
        except: return []

    @skills.setter
    def skills(self, val):
        self._skills = json.dumps(val or [], ensure_ascii=False)

    class Meta:
        db_table = 'users'

class Job(models.Model):
    LOCATION_CHOICES = [('remote','Masofaviy'),('office','Ofis'),('hybrid','Gibrid')]
    employer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='jobs')
    title = models.CharField(max_length=300)
    company = models.CharField(max_length=200)
    salary = models.CharField(max_length=200)
    _skills = models.TextField(blank=True, default='[]', db_column='skills')
    location = models.CharField(max_length=20, choices=LOCATION_CHOICES, default='remote')
    deadline = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def skills(self):
        try: return json.loads(self._skills)
        except: return []

    @skills.setter
    def skills(self, val):
        self._skills = json.dumps(val or [], ensure_ascii=False)

    def __str__(self): return self.title
    class Meta:
        db_table = 'jobs'
        ordering = ['-created_at']

class Application(models.Model):
    STATUS_CHOICES = [('pending','Ko\'rib chiqilmoqda'),('accepted','Qabul qilindi'),('rejected','Rad etildi')]
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    seeker = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'applications'
        unique_together = ('job', 'seeker')
        ordering = ['-created_at']

    def __str__(self): return f"{self.seeker.get_full_name()} → {self.job.title}"
