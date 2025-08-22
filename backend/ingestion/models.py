from django.db import models


class MicrogridData(models.Model):
    timestamp = models.DateTimeField()

    battery_active_power = models.FloatField(null=True, blank=True)
    battery_active_power_set_response = models.FloatField(null=True, blank=True)

    pvpcs_active_power = models.FloatField(null=True, blank=True)

    ge_body_active_power = models.FloatField(null=True, blank=True)
    ge_active_power = models.FloatField(null=True, blank=True)
    ge_body_active_power_set_response = models.FloatField(null=True, blank=True)

    fc_active_power_fc_end_set = models.FloatField(null=True, blank=True)
    fc_active_power = models.FloatField(null=True, blank=True)
    fc_active_power_fc_end_set_response = models.FloatField(null=True, blank=True)

    island_mode_mccb_active_power = models.FloatField(null=True, blank=True)
    mg_lv_msb_ac_voltage = models.FloatField(null=True, blank=True)
    receiving_point_ac_voltage = models.FloatField(null=True, blank=True)
    island_mode_mccb_ac_voltage = models.FloatField(null=True, blank=True)

    island_mode_mccb_frequency = models.FloatField(null=True, blank=True)
    mg_lv_msb_frequency = models.FloatField(null=True, blank=True)

    inlet_temperature_of_chilled_water = models.FloatField(null=True, blank=True)
    outlet_temperature = models.FloatField(null=True, blank=True)

    class Meta:
        ordering = ["timestamp"]

    def __str__(self):
        return f"{self.timestamp} | PV={self.pvpcs_active_power} | GE={self.ge_active_power}"
