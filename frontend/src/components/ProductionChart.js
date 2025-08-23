import React from 'react';
import Plot from 'react-plotly.js';

const ProductionChart = ({ data, timeSeriesData }) => {
  const createProductionDistributionChart = () => {
    if (!data) return null;

    const productionData = [
      { source: 'Battery', value: data.production_battery || 0, color: '#3498db' },
      { source: 'Photovoltaïque', value: data.production_pv || 0, color: '#f39c12' },
      { source: 'Fuel Cell', value: data.production_fc || 0, color: '#e74c3c' }
    ].filter(item => item.value > 0);

    return {
      data: [{
        type: 'pie',
        labels: productionData.map(item => item.source),
        values: productionData.map(item => item.value),
        marker: {
          colors: productionData.map(item => item.color),
          line: {
            color: '#ffffff',
            width: 2
          }
        },
        hovertemplate: '<b>%{label}</b><br>' +
                      'Production: %{value:.2f} kWh<br>' +
                      'Pourcentage: %{percent}<br>' +
                      '<extra></extra>',
        textinfo: 'label+percent',
        textposition: 'outside'
      }],
      layout: {
        title: {
          text: 'Répartition de la Production par Source',
          font: { size: 16, color: '#2c3e50' }
        },
        showlegend: true,
        legend: {
          orientation: 'v',
          x: 1.05,
          y: 0.5
        },
        margin: { t: 50, r: 150, b: 50, l: 50 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)'
      },
      config: {
        displayModeBar: false,
        responsive: true
      }
    };
  };

  const createTimeSeriesChart = () => {
    if (!timeSeriesData?.results || timeSeriesData.results.length === 0) {
      return null;
    }

    const sortedData = [...timeSeriesData.results].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );

    const timestamps = sortedData.map(item => new Date(item.timestamp));
    
    return {
      data: [
        {
          x: timestamps,
          y: sortedData.map(item => item.battery_active_power || 0),
          type: 'scatter',
          mode: 'lines',
          name: 'Battery',
          line: { color: '#3498db', width: 2 },
          hovertemplate: '<b>Battery</b><br>%{y:.2f} kW<br>%{x}<extra></extra>'
        },
        {
          x: timestamps,
          y: sortedData.map(item => item.pvpcs_active_power || 0),
          type: 'scatter',
          mode: 'lines',
          name: 'Photovoltaïque',
          line: { color: '#f39c12', width: 2 },
          hovertemplate: '<b>PV</b><br>%{y:.2f} kW<br>%{x}<extra></extra>'
        },
        {
          x: timestamps,
          y: sortedData.map(item => item.fc_active_power || 0),
          type: 'scatter',
          mode: 'lines',
          name: 'Fuel Cell',
          line: { color: '#e74c3c', width: 2 },
          hovertemplate: '<b>FC</b><br>%{y:.2f} kW<br>%{x}<extra></extra>'
        }
      ],
      layout: {
        title: {
          text: 'Production par Source - Évolution Temporelle',
          font: { size: 16, color: '#2c3e50' }
        },
        xaxis: {
          title: 'Temps',
          gridcolor: '#ecf0f1',
          tickformat: '%H:%M\n%d/%m'
        },
        yaxis: {
          title: 'Puissance (kW)',
          gridcolor: '#ecf0f1'
        },
        legend: {
          x: 0.02,
          y: 0.98,
          bgcolor: 'rgba(255,255,255,0.8)',
          bordercolor: '#bdc3c7',
          borderwidth: 1
        },
        margin: { t: 50, r: 50, b: 80, l: 80 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        hovermode: 'x unified'
      },
      config: {
        displayModeBar: true,
        modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d', 'autoScale2d'],
        responsive: true
      }
    };
  };

  const distributionChart = createProductionDistributionChart();
  const timeSeriesChart = createTimeSeriesChart();

  return (
    <div className="production-chart-container">
      {/* Graphique en secteurs de la répartition */}
      <div className="chart-wrapper">
        {distributionChart ? (
          <Plot
            data={distributionChart.data}
            layout={distributionChart.layout}
            config={distributionChart.config}
            style={{ width: '100%', height: '400px' }}
          />
        ) : (
          <div className="chart-placeholder">
            <p>Aucune donnée de production disponible</p>
          </div>
        )}
      </div>

      {/* Graphique temporel si disponible */}
      {timeSeriesChart && (
        <div className="chart-wrapper">
          <Plot
            data={timeSeriesChart.data}
            layout={timeSeriesChart.layout}
            config={timeSeriesChart.config}
            style={{ width: '100%', height: '400px' }}
          />
        </div>
      )}

      {/* Résumé des données de production */}
      {data && (
        <div className="production-summary">
          <h4>Résumé de la Production</h4>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">Production Totale:</span>
              <span className="stat-value">{(data.production_totale || 0).toFixed(2)} kWh</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Pic de Production:</span>
              <span className="stat-value">{(data.pic_production || 0).toFixed(2)} kW</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Sources Renouvelables:</span>
              <span className="stat-value">{(data.ratio_renewables || 0).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionChart;