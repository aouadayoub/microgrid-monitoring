# backend/reports/urls.py
from django.urls import path
from .views import (
    ReportConfigurationListCreate,
    ReportConfigurationRetrieveUpdateDestroy,
    GeneratedReportList,
    GeneratedReportRetrieve,
    ReportGenerationView,
    DownloadReportView,
)

urlpatterns = [
    path(
        "configurations/",
        ReportConfigurationListCreate.as_view(),
        name="reportconfiguration-list-create",
    ),
    path(
        "configurations/<int:pk>/",
        ReportConfigurationRetrieveUpdateDestroy.as_view(),
        name="reportconfiguration-retrieve-update-destroy",
    ),
    # Generated Report URLs
    path("reports/generated/", GeneratedReportList.as_view(), name="generatedreport-list"),
    path(
        "reports/<int:pk>/",
        GeneratedReportRetrieve.as_view(),
        name="generatedreport-retrieve",
    ),
    # Report Generation and Download URLs
    path(
        "generate/",
        ReportGenerationView.as_view(),
        name="report-generation",
    ),
    path(
        "download/",
        DownloadReportView.as_view(),
        name="download-report",
    ),
]