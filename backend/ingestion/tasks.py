import pandas as pd
import os
from django.utils import timezone
from celery import shared_task
from .models import MicrogridData

@shared_task(queue='ingestion')
def process_csv_file(file_path, delimiter):
    """
    Celery task to process CSV file in the background.
    """
    if not os.path.exists(file_path):
        return {"error": f"File not found: {file_path}", "status": "failed"}
    try:
        # Try UTF-8, fallback to Latin-1
        try:
            df = pd.read_csv(file_path, delimiter=delimiter, encoding='utf-8')
        except UnicodeDecodeError:
            df = pd.read_csv(file_path, delimiter=delimiter, encoding='latin-1')

        # Clean column names to match model field names
        df.columns = df.columns.str.strip()
        
        # Map CSV column names to model field names
        column_mapping = {
            "Timestamp": "timestamp",
            "Battery_Active_Power": "battery_active_power",
            "Battery_Active_Power_Set_Response": "battery_active_power_set_response",
            "PVPCS_Active_Power": "pvpcs_active_power",
            "GE_Body_Active_Power": "ge_body_active_power",
            "GE_Active_Power": "ge_active_power",
            "GE_Body_Active_Power_Set_Response": "ge_body_active_power_set_response",
            "FC_Active_Power_FC_END_Set": "fc_active_power_fc_end_set",
            "FC_Active_Power": "fc_active_power",
            "FC_Active_Power_FC_end_Set_Response": "fc_active_power_fc_end_set_response",
            "Island_mode_MCCB_Active_Power": "island_mode_mccb_active_power",
            "MG-LV-MSB_AC_Voltage": "mg_lv_msb_ac_voltage",
            "Receiving_Point_AC_Voltage": "receiving_point_ac_voltage",
            "Island_mode_MCCB_AC_Voltage": "island_mode_mccb_ac_voltage",
            "Island_mode_MCCB_Frequency": "island_mode_mccb_frequency",
            "MG-LV-MSB_Frequency": "mg_lv_msb_frequency",
            "Inlet_Temperature_of_Chilled_Water": "inlet_temperature_of_chilled_water",
            "Outlet_Temperature": "outlet_temperature"
        }
        
        # Rename columns to match model
        df.rename(columns=column_mapping, inplace=True)
        
        total_rows = len(df)
        total_imported = 0
        total_skipped = 0
        
        # Process in chunks to reduce memory usage
        chunk_size = 10000
        for chunk_start in range(0, total_rows, chunk_size):
            chunk_end = min(chunk_start + chunk_size, total_rows)
            chunk_df = df.iloc[chunk_start:chunk_end]
            
            objs_to_create = []
            for _, row in chunk_df.iterrows():
                try:
                    timestamp_value = row.get("timestamp")
                    if pd.isna(timestamp_value) or str(timestamp_value).strip() == '':
                        total_skipped += 1
                        continue

                    # Try specific formats first
                    ts = None
                    for fmt in ["%Y/%m/%d %H:%M:%S", "%Y-%m-%d %H:%M:%S"]:
                        try:
                            ts = pd.to_datetime(str(timestamp_value), format=fmt, errors='coerce')
                            if not pd.isna(ts):
                                break
                        except:
                            continue
                    
                    # If specific formats didn't work, try general parsing
                    if pd.isna(ts) or ts is None:
                        ts = pd.to_datetime(str(timestamp_value), errors='coerce')
                    
                    if pd.isna(ts):
                        total_skipped += 1
                        continue
                        
                    # Fix: Convert pandas Timestamp to a naive Python datetime object
                    # and then make it timezone-aware.
                    ts_aware = timezone.make_aware(ts.to_pydatetime(), timezone.get_current_timezone())

                    def safe_float(val):
                        if pd.isna(val) or val == '':
                            return None
                        try:
                            return float(val)
                        except Exception:
                            return None

                    obj = MicrogridData(
                        timestamp=ts_aware,
                        battery_active_power=safe_float(row.get("battery_active_power")),
                        battery_active_power_set_response=safe_float(row.get("battery_active_power_set_response")),
                        pvpcs_active_power=safe_float(row.get("pvpcs_active_power")),
                        ge_body_active_power=safe_float(row.get("ge_body_active_power")),
                        ge_active_power=safe_float(row.get("ge_active_power")),
                        ge_body_active_power_set_response=safe_float(row.get("ge_body_active_power_set_response")),
                        fc_active_power_fc_end_set=safe_float(row.get("fc_active_power_fc_end_set")),
                        fc_active_power=safe_float(row.get("fc_active_power")),
                        fc_active_power_fc_end_set_response=safe_float(row.get("fc_active_power_fc_end_set_response")),
                        island_mode_mccb_active_power=safe_float(row.get("island_mode_mccb_active_power")),
                        mg_lv_msb_ac_voltage=safe_float(row.get("mg_lv_msb_ac_voltage")),
                        receiving_point_ac_voltage=safe_float(row.get("receiving_point_ac_voltage")),
                        island_mode_mccb_ac_voltage=safe_float(row.get("island_mode_mccb_ac_voltage")),
                        island_mode_mccb_frequency=safe_float(row.get("island_mode_mccb_frequency")),
                        mg_lv_msb_frequency=safe_float(row.get("mg_lv_msb_frequency")),
                        inlet_temperature_of_chilled_water=safe_float(row.get("inlet_temperature_of_chilled_water")),
                        outlet_temperature=safe_float(row.get("outlet_temperature")),
                    )
                    objs_to_create.append(obj)
                except Exception as e:
                    total_skipped += 1
                    continue

            if objs_to_create:
                MicrogridData.objects.bulk_create(objs_to_create, batch_size=500)
                total_imported += len(objs_to_create)

        # Clean up the temporary file
        try:
            os.remove(file_path)
        except:
            pass

        return {
            "imported_rows": total_imported,
            "skipped_rows": total_skipped,
            "total_rows": total_rows,
            "status": "completed"
        }
        
    except Exception as e:
        # Clean up the temporary file even if there's an error
        try:
            os.remove(file_path)
        except:
            pass
        
        return {"error": f"Failed to process CSV: {str(e)}", "status": "failed"}