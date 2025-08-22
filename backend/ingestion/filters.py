from django_filters import rest_framework as filters
from .models import MicrogridData

class MicrogridDataFilter(filters.FilterSet):
    min_power = filters.NumberFilter(field_name="ge_active_power", lookup_expr='gte')
    max_power = filters.NumberFilter(field_name="ge_active_power", lookup_expr='lte')
    
    class Meta:
        model = MicrogridData
        fields = {
            'timestamp': ['gte', 'lte', 'exact'],
            'ge_active_power': ['gte', 'lte'],
            'pvpcs_active_power': ['gte', 'lte'],
        }