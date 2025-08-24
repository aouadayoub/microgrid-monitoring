from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.http import JsonResponse

def health_view(request):
    return JsonResponse({"status": "ok"})

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/ingestion/", include("ingestion.urls")),
    path("api/metrics/", include("metrics.urls")),
    path('api/', include('reports.urls')),
    path("api/schema/", SpectacularAPIView.as_view(), name='schema'),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path("api/schema/redoc/", SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    path("api/token/", TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path("api/token/refresh/", TokenRefreshView.as_view(), name='token_refresh'),
    path("api/health/", health_view),
]