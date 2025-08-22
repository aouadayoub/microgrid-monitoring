# microgrid_monitoring/celery.py
import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "microgrid_monitoring.settings")

app = Celery("microgrid_monitoring")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()
