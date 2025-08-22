from rest_framework import serializers
from .models import MicrogridData


class CSVUploadSerializer(serializers.Serializer):
    csv_file = serializers.FileField(
        help_text="Fichier CSV contenant les données du microgrid"
    )
    delimiter = serializers.CharField(
        max_length=1,
        default=",",
        help_text="Délimiteur utilisé dans le fichier CSV (par défaut: ,)"
    )


class MicrogridDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = MicrogridData
        fields = "__all__"
