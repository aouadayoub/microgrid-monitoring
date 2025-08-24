# Use official Python image
FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    libfreetype6-dev \
    libjpeg-dev \
    zlib1g-dev \
    liblcms2-dev \
    libopenjp2-7-dev \
    tcl8.6-dev tk8.6-dev \
    ghostscript \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Add appuser and create directories
RUN adduser --disabled-password --gecos '' appuser && \
    mkdir -p /app/staticfiles /app/csv_uploads

# Install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Remove this line:
# USER appuser

# Run with Gunicorn
CMD ["gunicorn", "--workers=3", "--threads=2", "--bind", "0.0.0.0:8000", "microgrid_monitoring.wsgi:application"]