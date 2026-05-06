from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from django.views.generic import TemplateView
from .models import User, Job, Application
from .serializers import UserSerializer, JobSerializer, ApplicationSerializer

# ── SERVE FRONTEND ──
class FrontendView(TemplateView):
    template_name = 'index.html'

# ── AUTH ──
class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data.copy()
        if not data.get('username'):
            data['username'] = data.get('email', '').split('@')[0]
        ser = UserSerializer(data=data)
        if ser.is_valid():
            user = ser.save()
            login(request, user)
            return Response({'user': UserSerializer(user).data}, status=201)
        return Response(ser.errors, status=400)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').lower()
        password = request.data.get('password', '')
        try:
            user_obj = User.objects.get(email=email)
            user = authenticate(request, username=user_obj.username, password=password)
        except User.DoesNotExist:
            user = None
        if user:
            login(request, user)
            return Response({'user': UserSerializer(user).data})
        return Response({'error': 'Email yoki parol noto\'g\'ri'}, status=400)

class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({'ok': True})

class MeView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)

# ── JOBS ──
class JobListCreateView(generics.ListCreateAPIView):
    serializer_class = JobSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = Job.objects.all()
        q = self.request.query_params.get('q')
        loc = self.request.query_params.get('location')
        if q: qs = qs.filter(title__icontains=q)
        if loc: qs = qs.filter(location=loc)
        return qs

    def perform_create(self, serializer):
        u = self.request.user
        serializer.save(employer=u, company=u.company or u.get_full_name())

class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def update(self, request, *args, **kwargs):
        job = self.get_object()
        if job.employer != request.user:
            return Response({'error': 'Ruxsat yo\'q'}, status=403)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        job = self.get_object()
        if job.employer != request.user:
            return Response({'error': 'Ruxsat yo\'q'}, status=403)
        return super().destroy(request, *args, **kwargs)

# ── APPLICATIONS ──
class ApplyView(APIView):
    def post(self, request, job_id):
        if request.user.role != 'seeker':
            return Response({'error': 'Faqat ish qidiruvchilar ariza yuborishi mumkin'}, status=403)
        try:
            job = Job.objects.get(id=job_id)
        except Job.DoesNotExist:
            return Response({'error': 'E\'lon topilmadi'}, status=404)
        app, created = Application.objects.get_or_create(job=job, seeker=request.user)
        if not created:
            return Response({'error': 'Siz allaqachon ariza yuborgansiz'}, status=400)
        return Response(ApplicationSerializer(app).data, status=201)

class JobApplicationsView(generics.ListAPIView):
    serializer_class = ApplicationSerializer

    def get_queryset(self):
        job = Job.objects.get(id=self.kwargs['job_id'])
        if job.employer != self.request.user:
            return Application.objects.none()
        return job.applications.all()

class UpdateApplicationView(APIView):
    def patch(self, request, app_id):
        try:
            app = Application.objects.get(id=app_id)
        except Application.DoesNotExist:
            return Response({'error': 'Topilmadi'}, status=404)
        if app.job.employer != request.user:
            return Response({'error': 'Ruxsat yo\'q'}, status=403)
        new_status = request.data.get('status')
        if new_status not in ['pending', 'accepted', 'rejected']:
            return Response({'error': 'Noto\'g\'ri status'}, status=400)
        app.status = new_status
        app.save()
        return Response(ApplicationSerializer(app).data)

class MyApplicationsView(generics.ListAPIView):
    serializer_class = ApplicationSerializer

    def get_queryset(self):
        return Application.objects.filter(seeker=self.request.user)

# ── MATCHING ──
class MatchedJobsView(APIView):
    def get(self, request):
        user_skills = set(s.lower() for s in request.user.skills)
        jobs = Job.objects.all()
        result = []
        for job in jobs:
            job_skills = set(s.lower() for s in job.skills)
            if not user_skills or not job_skills:
                score = 0
            else:
                intersection = len(user_skills & job_skills)
                union = len(user_skills | job_skills)
                score = round((intersection / union) * 100) if union else 0
            d = JobSerializer(job).data
            d['match_score'] = score
            result.append(d)
        result.sort(key=lambda x: x['match_score'], reverse=True)
        return Response(result)
