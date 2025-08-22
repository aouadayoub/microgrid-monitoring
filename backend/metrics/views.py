from rest_framework.generics import RetrieveAPIView
from rest_framework.response import Response
from rest_framework import status
from .services import calculate_kpis
from .serializers import KPISerializer

class MetricsView(RetrieveAPIView):
    serializer_class = KPISerializer

    def get(self, request, *args, **kwargs):
        try:
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            kpis = calculate_kpis(start_date, end_date)
            
            if not kpis:
                return Response(
                    {"error": "Aucune donnée disponible pour la période sélectionnée"},
                    status=status.HTTP_404_NOT_FOUND
                )
                
            serializer = self.get_serializer(kpis)
            return Response(serializer.data)
            
        except Exception as e:
            return Response(
                {"error": f"Une erreur s'est produite: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        