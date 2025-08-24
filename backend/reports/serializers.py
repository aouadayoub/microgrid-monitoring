# backend/reports/serializers.py
from rest_framework import serializers
from .models import ReportConfiguration, GeneratedReport
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class ReportConfigurationSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    
    class Meta:
        model = ReportConfiguration
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at', 'updated_at']

class GeneratedReportSerializer(serializers.ModelSerializer):
    configuration = ReportConfigurationSerializer(read_only=True)
    
    class Meta:
        model = GeneratedReport
        fields = '__all__'