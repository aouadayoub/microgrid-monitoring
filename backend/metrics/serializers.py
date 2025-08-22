from rest_framework import serializers

class KPISerializer(serializers.Serializer):
    consommation_totale = serializers.FloatField(allow_null=True)
    production_totale = serializers.FloatField(allow_null=True)
    autonomie = serializers.FloatField(allow_null=True)
    pertes = serializers.FloatField(allow_null=True)
    pic_consommation = serializers.FloatField(allow_null=True)
    pic_production = serializers.FloatField(allow_null=True)
    production_battery = serializers.FloatField(allow_null=True)
    production_pv = serializers.FloatField(allow_null=True)
    production_fc = serializers.FloatField(allow_null=True)
    ratio_renewables = serializers.FloatField(allow_null=True)
    voltage_moyen = serializers.FloatField(allow_null=True)
    frequence_moyenne = serializers.FloatField(allow_null=True)