from django.urls import path
from .views import (
    SimpleCSVUploadAPIView,
    MicrogridDataListView,
    MicrogridDataDetailView,
    BulkDeleteMicrogridDataView,
    TaskStatusAPIView
)

urlpatterns = [
    path('upload/', SimpleCSVUploadAPIView.as_view(), name='csv-upload'),
    path('data/', MicrogridDataListView.as_view(), name='microgrid-data-list'),
    path('data/<int:pk>/', MicrogridDataDetailView.as_view(), name='microgrid-data-detail'),
    path('data/bulk-delete/', BulkDeleteMicrogridDataView.as_view(), name='microgrid-data-bulk-delete'),
    path('tasks/<str:task_id>/', TaskStatusAPIView.as_view(), name='task-status'),
]