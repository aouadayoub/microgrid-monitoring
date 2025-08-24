# backend/reports/models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class ReportConfiguration(models.Model):
    REPORT_FORMAT_CHOICES = [
        ('pdf', 'PDF'),
        ('md', 'Markdown'),
        ('csv', 'CSV'),
    ]
    
    REPORT_TYPE_CHOICES = [
        ('kpi', 'KPI Summary'),
        ('electrical', 'Electrical Metrics'),
        ('production', 'Production Analysis'),
        ('consumption', 'Consumption Analysis'),
        ('comprehensive', 'Comprehensive Report'),
    ]
    
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    report_type = models.CharField(max_length=20, choices=REPORT_TYPE_CHOICES)
    format = models.CharField(max_length=10, choices=REPORT_FORMAT_CHOICES)
    include_charts = models.BooleanField(default=True)
    date_range = models.CharField(max_length=20, default='last_7_days', 
                                 choices=[('today', 'Today'), 
                                         ('yesterday', 'Yesterday'),
                                         ('last_7_days', 'Last 7 Days'),
                                         ('last_30_days', 'Last 30 Days'),
                                         ('this_month', 'This Month'),
                                         ('custom', 'Custom')])
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.get_report_type_display()})"

class GeneratedReport(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    configuration = models.ForeignKey(ReportConfiguration, on_delete=models.CASCADE)
    file = models.FileField(upload_to='reports/', null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    generated_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    @property
    def file_url(self):
        if self.file and hasattr(self.file, 'url'):
            return self.file.url
        return None
    
    def __str__(self):
        return f"Report {self.id} - {self.configuration.name}"