import os
import csv
import logging
import traceback
from datetime import timedelta

from celery import shared_task
from celery.exceptions import MaxRetriesExceededError
from django.utils import timezone
from django.conf import settings

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.units import inch

from ingestion.models import MicrogridData
from metrics.services import calculate_kpis
from .models import GeneratedReport

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60, queue='reports')
def generate_report_task(self, report_id):
    """
    Asynchronous Celery task to generate a report with retries and status updates.
    """
    try:
        report = GeneratedReport.objects.get(id=report_id)
        report.status = "processing"
        report.save()

        config = report.configuration

        # --- Date range handling ---
        end_date = timezone.now().date()
        if config.date_range == "today":
            start_date = end_date
        elif config.date_range == "yesterday":
            start_date = end_date - timedelta(days=1)
            end_date = start_date
        elif config.date_range == "last_7_days":
            start_date = end_date - timedelta(days=7)
        elif config.date_range == "last_30_days":
            start_date = end_date - timedelta(days=30)
        elif config.date_range == "this_month":
            start_date = end_date.replace(day=1)
        else:  # custom
            start_date = config.start_date
            end_date = config.end_date

        # --- Data & KPIs ---
        data = MicrogridData.objects.filter(
            timestamp__date__gte=start_date,
            timestamp__date__lte=end_date,
        )
        kpis = calculate_kpis(data)

        # --- Format-specific generation ---
        if config.format == "pdf":
            file_path = generate_pdf_report(config, kpis, data, start_date, end_date)
        elif config.format == "md":
            file_path = generate_markdown_report(config, kpis, data, start_date, end_date)
        elif config.format == "csv":
            file_path = generate_csv_report(config, kpis, data, start_date, end_date)
        else:
            raise ValueError(f"Unsupported report format: {config.format}")

        # --- Mark as completed ---
        report.file.name = file_path
        report.status = "completed"
        report.completed_at = timezone.now()
        report.save()

        logger.info(f"✅ Successfully generated report {report_id}")

    except Exception as exc:
        logger.error(
            f"❌ Error generating report {report_id}: {exc}\n{traceback.format_exc()}"
        )

        try:
            report = GeneratedReport.objects.get(id=report_id)
            report.status = "retrying"
            report.error_message = str(exc)
            report.save()
        except Exception:
            pass  # avoid secondary DB errors

        try:
            raise self.retry(exc=exc)
        except MaxRetriesExceededError:
            logger.critical(
                f"🚨 Report generation failed after max retries for report {report_id}"
            )
            try:
                report = GeneratedReport.objects.get(id=report_id)
                report.status = "failed"
                report.error_message = f"Max retries exceeded: {str(exc)}"
                report.save()
            except Exception:
                pass


# ---------------------------------------------------------------------
# Report Generators
# ---------------------------------------------------------------------

def generate_pdf_report(config, kpis, data, start_date, end_date):
    filename = f"report_{config.id}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    file_path = os.path.join(settings.MEDIA_ROOT, "reports", filename)
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    doc = SimpleDocTemplate(file_path, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = []

    # Title
    title_style = ParagraphStyle(
        "Title", parent=styles["Heading1"], fontSize=18, spaceAfter=30, alignment=1
    )
    elements.append(Paragraph(f"{config.name}", title_style))

    # Date range
    elements.append(Paragraph(f"Period: {start_date} to {end_date}", styles["Normal"]))
    elements.append(Spacer(1, 0.2 * inch))

    # KPI Table
    elements.append(Paragraph("Key Performance Indicators", styles["Heading2"]))
    kpi_data = [["KPI", "Value", "Unit"]]
    for key, value in kpis.items():
        if key in ["autonomie", "ratio_renewables"]:
            kpi_data.append([key, f"{value:.2f}", "%"])
        elif key in ["consommation_totale", "production_totale", "pertes"]:
            kpi_data.append([key, f"{value:.2f}", "kWh"])
        elif key in ["pic_consommation", "pic_production"]:
            kpi_data.append([key, f"{value:.2f}", "kW"])

    table = Table(kpi_data)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 12),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                ("BACKGROUND", (0, 1), (-1, -1), colors.beige),
                ("GRID", (0, 0), (-1, -1), 1, colors.black),
            ]
        )
    )
    elements.append(table)
    elements.append(Spacer(1, 0.5 * inch))

    doc.build(elements)
    return f"reports/{filename}"


def generate_markdown_report(config, kpis, data, start_date, end_date):
    filename = f"report_{config.id}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.md"
    file_path = os.path.join(settings.MEDIA_ROOT, "reports", filename)
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    with open(file_path, "w") as f:
        f.write(f"# {config.name}\n\n")
        f.write(f"**Period:** {start_date} to {end_date}\n\n")
        f.write(f"**Generated:** {timezone.now().strftime('%Y-%m-%d %H:%M')}\n\n")

        f.write("## Key Performance Indicators\n\n")
        f.write("| KPI | Value | Unit |\n|-----|-------|------|\n")
        for key, value in kpis.items():
            if key in ["autonomie", "ratio_renewables"]:
                f.write(f"| {key} | {value:.2f} | % |\n")
            elif key in ["consommation_totale", "production_totale", "pertes"]:
                f.write(f"| {key} | {value:.2f} | kWh |\n")
            elif key in ["pic_consommation", "pic_production"]:
                f.write(f"| {key} | {value:.2f} | kW |\n")

    return f"reports/{filename}"


def generate_csv_report(config, kpis, data, start_date, end_date):
    filename = f"report_{config.id}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.csv"
    file_path = os.path.join(settings.MEDIA_ROOT, "reports", filename)
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    with open(file_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["Report:", config.name])
        writer.writerow(["Period:", f"{start_date} to {end_date}"])
        writer.writerow(["Generated:", timezone.now().strftime("%Y-%m-%d %H:%M")])
        writer.writerow([])
        writer.writerow(["KPI", "Value", "Unit"])
        for key, value in kpis.items():
            if key in ["autonomie", "ratio_renewables"]:
                writer.writerow([key, f"{value:.2f}", "%"])
            elif key in ["consommation_totale", "production_totale", "pertes"]:
                writer.writerow([key, f"{value:.2f}", "kWh"])
            elif key in ["pic_consommation", "pic_production"]:
                writer.writerow([key, f"{value:.2f}", "kW"])

    return f"reports/{filename}"


# ---------------------------------------------------------------------
# Maintenance Task
# ---------------------------------------------------------------------
@shared_task(queue='reports')
def cleanup_old_reports(days=30):
    """Delete reports older than X days"""
    cutoff_date = timezone.now() - timezone.timedelta(days=days)
    old_reports = GeneratedReport.objects.filter(generated_at__lt=cutoff_date)
    count, _ = old_reports.delete()
    return f"🧹 Deleted {count} old reports"
