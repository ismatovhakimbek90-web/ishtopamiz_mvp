from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from api.views import FrontendView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('', FrontendView.as_view(), name='home'),
    path('<path:path>', FrontendView.as_view(), name='spa'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
