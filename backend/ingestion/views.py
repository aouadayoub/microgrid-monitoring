import os
import pandas as pd
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from celery.result import AsyncResult
from .serializers import CSVUploadSerializer, MicrogridDataSerializer
from .models import MicrogridData
from .tasks import process_csv_file
from .filters import MicrogridDataFilter

class SimpleCSVUploadAPIView(generics.CreateAPIView):
    serializer_class = CSVUploadSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        csv_file = request.FILES["csv_file"]
        delimiter = serializer.validated_data.get("delimiter", ",")

        # Save file in shared volume
        upload_dir = "/app/csv_uploads"
        os.makedirs(upload_dir, exist_ok=True)
        file_name = f"{csv_file.name}_{timezone.now().timestamp()}.csv"
        file_path = os.path.join(upload_dir, file_name)

        with open(file_path, "wb+") as f:
            for chunk in csv_file.chunks():
                f.write(chunk)

        # Pass shared path to Celery
        task = process_csv_file.delay(file_path, delimiter)

        return Response(
            {
                "message": "File is being processed in the background.",
                "task_id": task.id,
                "status": "accepted"
            },
            status=status.HTTP_202_ACCEPTED
        )


class MicrogridDataListView(generics.ListAPIView):
    """
    GET endpoint to retrieve imported microgrid data.
    Supports pagination, filtering by timestamp, and ordering.
    """
    queryset = MicrogridData.objects.all()
    serializer_class = MicrogridDataSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = MicrogridDataFilter 
    ordering_fields = '__all__'
    ordering = ['timestamp']

class MicrogridDataDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET, PUT, PATCH, DELETE endpoint for a single microgrid data record.
    """
    queryset = MicrogridData.objects.all()
    serializer_class = MicrogridDataSerializer
    permission_classes = [IsAuthenticated]


class BulkDeleteMicrogridDataView(APIView):
    """
    DELETE endpoint to bulk delete microgrid data records based on filters.
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        queryset = MicrogridData.objects.all()
        
        if start_date and end_date:
            queryset = queryset.filter(timestamp__range=[start_date, end_date])
        elif start_date:
            queryset = queryset.filter(timestamp__gte=start_date)
        elif end_date:
            queryset = queryset.filter(timestamp__lte=end_date)
        
        # Count records to be deleted
        count = queryset.count()
        
        # Delete the records
        queryset.delete()
        
        return Response(
            {
                "message": f"Successfully deleted {count} records.",
                "deleted_count": count
            },
            status=status.HTTP_200_OK
        )


class TaskStatusAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, task_id):
        task_result = AsyncResult(task_id)
        response_data = {
            'task_id': task_id,
            'status': task_result.status,
            'result': task_result.result
        }
        return Response(response_data)