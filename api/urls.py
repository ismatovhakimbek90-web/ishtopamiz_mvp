from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('auth/register/', views.RegisterView.as_view()),
    path('auth/login/', views.LoginView.as_view()),
    path('auth/logout/', views.LogoutView.as_view()),
    path('auth/me/', views.MeView.as_view()),
    # Jobs
    path('jobs/', views.JobListCreateView.as_view()),
    path('jobs/<int:pk>/', views.JobDetailView.as_view()),
    path('jobs/<int:job_id>/apply/', views.ApplyView.as_view()),
    path('jobs/<int:job_id>/applications/', views.JobApplicationsView.as_view()),
    # Applications
    path('applications/mine/', views.MyApplicationsView.as_view()),
    path('applications/<int:app_id>/status/', views.UpdateApplicationView.as_view()),
    # Matching
    path('jobs/matched/', views.MatchedJobsView.as_view()),
]
