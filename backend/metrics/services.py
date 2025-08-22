import pandas as pd
import numpy as np
from ingestion.models import MicrogridData

def calculate_kpis(start_date=None, end_date=None):
    qs = MicrogridData.objects.all()
    if start_date and end_date:
        qs = qs.filter(timestamp__range=[start_date, end_date])
    
    # Utiliser les noms de colonnes corrects (snake_case)
    df = pd.DataFrame(list(qs.values(
        'timestamp', 
        'battery_active_power',
        'pvpcs_active_power',
        'fc_active_power',
        'ge_active_power',
        'mg_lv_msb_ac_voltage',
        'mg_lv_msb_frequency'
    )))
    
    if df.empty:
        return {}
    
    # Gérer les valeurs nulles
    power_columns = ['battery_active_power', 'pvpcs_active_power', 'fc_active_power', 'ge_active_power']
    for col in power_columns:
        df[col] = df[col].fillna(0)
    
    # Calcul Δt en heures
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df = df.sort_values('timestamp')  # S'assurer que les données sont triées par temps
    
    # Calculer le temps écoulé entre les mesures
    time_diffs = df['timestamp'].diff().dt.total_seconds().fillna(0) / 3600  # en heures
    
    # Pour la première ligne, utiliser la moyenne des différences de temps suivantes
    if len(time_diffs) > 1:
        time_diffs.iloc[0] = time_diffs.iloc[1:].mean()
    else:
        time_diffs.iloc[0] = 1  # Valeur par défaut si une seule ligne
    
    df['dt'] = time_diffs

    # Consommation totale (en kWh)
    consommation_totale = (df['ge_active_power'] * df['dt']).sum()

    # Production par source (en kWh)
    df['Production_Battery'] = df['battery_active_power'] * df['dt']
    df['Production_PV'] = df['pvpcs_active_power'] * df['dt']
    df['Production_FC'] = df['fc_active_power'] * df['dt']
    df['Production_totale'] = df['Production_Battery'] + df['Production_PV'] + df['Production_FC']

    production_totale = df['Production_totale'].sum()
    production_battery = df['Production_Battery'].sum()
    production_pv = df['Production_PV'].sum()
    production_fc = df['Production_FC'].sum()

    # Taux autonomie et pertes
    autonomie = (production_totale / consommation_totale * 100) if consommation_totale else 0
    pertes = max(0, consommation_totale - production_totale)

    # Pics instantanés
    pic_consommation = df['ge_active_power'].max()
    pic_production = (df['battery_active_power'] + df['pvpcs_active_power'] + df['fc_active_power']).max()

    # Ratio renouvelables
    ratio_renewables = ((production_battery + production_pv) / production_totale * 100) if production_totale else 0

    # Moyennes voltage / fréquence (en ignorant les valeurs nulles)
    voltage_moyen = df['mg_lv_msb_ac_voltage'].mean() if not df['mg_lv_msb_ac_voltage'].isnull().all() else 0
    frequence_moyenne = df['mg_lv_msb_frequency'].mean() if not df['mg_lv_msb_frequency'].isnull().all() else 0

    return {
        'consommation_totale': round(consommation_totale, 2),
        'production_totale': round(production_totale, 2),
        'production_battery': round(production_battery, 2),
        'production_pv': round(production_pv, 2),
        'production_fc': round(production_fc, 2),
        'autonomie': round(autonomie, 2),
        'pertes': round(pertes, 2),
        'pic_consommation': round(pic_consommation, 2),
        'pic_production': round(pic_production, 2),
        'ratio_renewables': round(ratio_renewables, 2),
        'voltage_moyen': round(voltage_moyen, 2),
        'frequence_moyenne': round(frequence_moyenne, 2)
    }