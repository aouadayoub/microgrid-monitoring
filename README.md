# microgrid-monitoring
A web application for microgrid energy monitoring, featuring data ingestion, a REST API, and an interactive dashboard with real-time KPIs.


commandes :
docker compose run --rm web python manage.py makemigrations

docker compose run --rm web python manage.py createsuperuser

dataset source :
[dataset](https://www.kaggle.com/datasets/yekenot/power-data-from-mesa-del-sol-microgrid)