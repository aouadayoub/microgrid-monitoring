from rest_framework import generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse
from .models import ReportConfiguration, GeneratedReport
from .serializers import ReportConfigurationSerializer, GeneratedReportSerializer
from .tasks import generate_report_task




class ReportConfigurationListCreate(generics.ListCreateAPIView):
    """
    ## API View for Report Configuration

    This view handles the listing and creation of `ReportConfiguration` objects.

    **Endpoints:**
    * `GET /configurations/`: Lists all report configurations for the authenticated user.
    * `POST /configurations/`: Creates a new report configuration.

    **Permissions:**
    * Requires `IsAuthenticated` permission.
    """
    queryset = ReportConfiguration.objects.all().order_by('-pk')
    serializer_class = ReportConfigurationSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        """
        Saves the new report configuration, assigning the current user as the creator.
        """
        serializer.save(created_by=self.request.user)

    def get_queryset(self):
        """
        Filters the queryset to only show report configurations created by the current user.
        """
        return ReportConfiguration.objects.filter(created_by=self.request.user)

class ReportConfigurationRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    """
    ## API View for Single Report Configuration

    This view provides detailed operations on a single `ReportConfiguration` object.

    **Endpoints:**
    * `GET /configurations/{id}/`: Retrieves a specific report configuration.
    * `PUT /configurations/{id}/`: Updates a specific report configuration.
    * `DELETE /configurations/{id}/`: Deletes a specific report configuration.

    **Permissions:**
    * Requires `IsAuthenticated` permission.
    """
    queryset = ReportConfiguration.objects.all()
    serializer_class = ReportConfigurationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Ensures users can only access their own report configurations.
        """
        return ReportConfiguration.objects.filter(created_by=self.request.user)

class GeneratedReportList(generics.ListAPIView):
    """
    ## API View for Generated Reports

    This view lists all `GeneratedReport` objects for the authenticated user.

    **Endpoint:**
    * `GET /reports/`: Lists all generated reports.

    **Permissions:**
    * Requires `IsAuthenticated` permission.
    """
    serializer_class = GeneratedReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filters the queryset to show only reports linked to configurations owned by the current user.
        """
        return GeneratedReport.objects.filter(configuration__created_by=self.request.user)

class GeneratedReportRetrieve(generics.RetrieveAPIView):
    """
    ## API View for Single Generated Report

    This view retrieves a single `GeneratedReport` object.

    **Endpoint:**
    * `GET /reports/{id}/`: Retrieves a specific generated report.

    **Permissions:**
    * Requires `IsAuthenticated` permission.
    """
    serializer_class = GeneratedReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Ensures users can only access their own generated reports.
        """
        return GeneratedReport.objects.filter(configuration__created_by=self.request.user)

class ReportGenerationView(generics.CreateAPIView):
    """
    ## API View to Start Report Generation

    This view is responsible for initiating the asynchronous report generation process.

    **Endpoint:**
    * `POST /generate/`: Starts a new report generation task.

    **Request Body:**
    * `config_id`: The ID of the `ReportConfiguration` to use for generating the report.

    **Permissions:**
    * Requires `IsAuthenticated` permission.
    """
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        """
        Handles the POST request to start a report generation.

        It creates a new `GeneratedReport` record with a 'pending' status and
        enqueues a Celery task to handle the actual file generation.
        """
        config_id = request.data.get('config_id')

        try:
            config = ReportConfiguration.objects.get(id=config_id, created_by=request.user)

            # Create a new generated report record
            report = GeneratedReport.objects.create(
                configuration=config,
                status='pending'
            )

            # Start the Celery task
            generate_report_task.delay(report.id)

            return Response({
                'status': 'Report generation started',
                'report_id': report.id
            }, status=status.HTTP_202_ACCEPTED)

        except ReportConfiguration.DoesNotExist:
            return Response({'error': 'Report configuration not found or not owned by user'}, status=status.HTTP_404_NOT_FOUND)

class DownloadReportView(generics.GenericAPIView):
    """
    ## API View to Download a Generated Report

    This view serves a previously generated report file.

    **Endpoint:**
    * `GET /download/?report_id={id}`: Downloads a completed report.

    **Query Parameters:**
    * `report_id`: The ID of the `GeneratedReport` to download.

    **Permissions:**
    * Requires `IsAuthenticated` permission.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        """
        Handles the GET request to download a report file.

        It checks the report's status and serves the file from the filesystem if it is 'completed'.
        """
        report_id = request.GET.get('report_id')
        if not report_id:
            return Response({'error': 'report_id query parameter is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            report = GeneratedReport.objects.get(id=report_id, configuration__created_by=request.user)
            if report.status != 'completed':
                return Response({'error': 'Report is not yet completed'}, status=status.HTTP_400_BAD_REQUEST)

            file_path = report.file.path
            file_name = report.file.name.split('/')[-1]

            with open(file_path, 'rb') as f:
                # Determine content type based on file extension
                content_type_map = {
                    'pdf': 'application/pdf',
                    'csv': 'text/csv',
                    'md': 'text/markdown'
                }
                extension = file_name.split('.')[-1].lower()
                content_type = content_type_map.get(extension, 'application/octet-stream')
                
                response = HttpResponse(f.read(), content_type=content_type)
                response['Content-Disposition'] = f'attachment; filename="{file_name}"'
                return response
        except GeneratedReport.DoesNotExist:
            return Response({'error': 'Report not found or not owned by user'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': f'An error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)