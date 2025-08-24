# Microgrid Monitoring System

A web application for monitoring microgrid energy metrics with real-time data ingestion, an API, and an interactive dashboard.

## Features

  - **Real-time Monitoring**: Track energy production and consumption.
  - **CSV Data Upload**: Ingest and process datasets.
  - **REST API**: Access and query metrics programmatically.
  - **Interactive Dashboard**: A React-based frontend with data visualizations.
  - **User Authentication**: Secure login using JWT.
  - **Automated Reporting**: Background report generation.

## Tech Stack

  - **Backend**: Django, Django REST Framework, PostgreSQL, Celery, Redis
  - **Frontend**: React.js
  - **Infrastructure**: Docker & Docker Compose

## Prerequisites

  - Docker (20.10+)
  - Docker Compose (2.0+)
  - Git

## Setup

### 1\. Clone the Repository

```bash
git clone https://github.com/aouadayoub/microgrid-monitoring.git
cd microgrid-monitoring
```

### 2\. Configure Environment

Create a `.env` file in the root directory and add the following configuration.

```ini
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0,web

POSTGRES_DB=microgrid_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=root1234
POSTGRES_HOST=db
POSTGRES_PORT=5432

CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0

REACT_APP_API_URL=http://localhost/api
```

You can generate a new Django secret key by running this command:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 3\. Start Services

Use Docker Compose to build and start all services.

```bash
docker-compose up --build
```

### 4\. Run Database Migrations

Apply the database migrations to set up the schema.

```bash
docker-compose run --rm web python manage.py migrate
```

### 5\. Create a Superuser

Create an admin user to access the Django admin panel.

```bash
docker-compose run --rm web python manage.py createsuperuser
```

## Usage

  - **Frontend**: `http://localhost`
  - **API Docs**: `http://localhost/api/docs/`
  - **Admin Panel**: `http://localhost/admin/`

## Data Upload

To upload data, navigate to the upload page within the application. CSV files containing energy metrics will be automatically processed and stored in the database. A sample dataset from the **PowerData Microgrid** can be used for testing.

## API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/token/` | `POST` | Get a new JWT token. |
| `/api/token/refresh/` | `POST` | Refresh an expired token. |
| `/api/ingestion/` | `POST` | Upload a CSV file for data ingestion. |
| `/api/metrics/` | `GET` | Retrieve energy metrics. |
| `/api/reports/` | `GET` | Download generated reports. |
| `/api/health/` | `GET` | Health check for the API. |

## Docker Commands

```bash
# Start services in detached mode
docker-compose up -d

# View logs for a specific service (e.g., the 'web' container)
docker-compose logs web

# Stop all services
docker-compose down
```

## Project Structure

```text
microgrid-monitoring/
├── backend/                 # Django app
│   ├── ingestion/           # Data ingestion
│   ├── metrics/             # Energy metrics
│   ├── reports/             # Reports
│   ├── microgrid_monitoring/ # Project settings
│   └── requirements.txt
├── frontend/                # React app
│   ├── src/                 # React components
│   └── nginx/               # Nginx config
├── docker-compose.yml
└── README.md
```

## Troubleshooting

  - **Port conflict**: If the application fails to start, another service might be using port 80. Stop the other service or change the port mapping in `docker-compose.yml`.
  - **Database errors**: Ensure the PostgreSQL service is running correctly. Check the `db` container logs with `docker-compose logs db`.
  - **Static files missing**: If the frontend isn't displaying correctly, you may need to collect the static files.

<!-- end list -->

```bash
docker-compose run --rm web python manage.py collectstatic
```

## Contributing

1.  Fork the repository.
2.  Create a new branch: `git checkout -b feature-name`
3.  Commit your changes: `git commit -m "Add a new feature"`
4.  Push to the branch and open a pull request.

## License

This project is licensed under the MIT License.