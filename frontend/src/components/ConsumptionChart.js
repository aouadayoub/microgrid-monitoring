import React from 'react';
import Plot from 'react-plotly.js';

const ConsumptionChart = ({ data, timeSeriesData }) => {
  const createConsumptionAnalysisChart = () => {
    if (!data) return null;

    const consumptionData = [
      { 
        category: 'Production Couverte', 
        value: Math.min(data.production_totale || 0, data.consommation_totale || 0),
        color: '#27ae60' 
      },
      { 
        category: 'Déficit', 
        value: Math.max(0, (data.consommation_totale || 0) - (data.production_totale || 0)),
        color: '#e74c3c' 
      }
    ].filter(item => item.value > 0);

    return {
      data: [{
        type: 'bar',
        x: consumptionData.map(item => item.category),
        y: consumptionData.map(item => item.value),
        marker: {
          color: consumptionData.map(item => item.color),
          opacity: 0.8,
          line: {
            color: '#2c3e50',
            width: 1
          }
        },
        hovertemplate: '<b>%{x}</b><br>' +
                      'Énergie: %{y:.2f} kWh<br>' +
                      '<extra></extra>',
        text: consumptionData.map(item => `${item.value.toFixed(1)} kWh`),
        textposition: 'outside'
      }],
      layout: {
        title: {
          text: 'Analyse Consommation vs Production',
          font: { size: 16, color: '#2c3e50' }
        },
        xaxis: {
          title: 'Catégorie',
          tickangle: -45
        },
        yaxis: {
          title: 'Énergie (kWh)',
          gridcolor: '#ecf0f1'
        },
        margin: { t: 50, r: 50, b: 100, l: 80 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)'
      },
      config: {
        displayModeBar: false,
        responsive: true
      }
    };
  };

  const createConsumptionTimeSeriesChart = () => {
    if (!timeSeriesData?.results || timeSeriesData.results.length === 0) {
      return null;
    }

    const sortedData = [...timeSeriesData.results].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );

    const timestamps = sortedData.map(item => new Date(item.timestamp));
    const consumption = sortedData.map(item => item.ge_active_power || 0);
    const totalProduction = sortedData.map(item => 
      (item.battery_active_power || 0) + 
      (item.pvpcs_active_power || 0) + 
      (item.fc_active_power || 0)
    );

    return {
      data: [
        {
          x: timestamps,
          y: consumption,
          type: 'scatter',
          mode: 'lines',
          name: 'Consommation',
          line: { color: '#e74c3c', width: 3 },
          hovertemplate: '<b>Consommation</b><br>%{y:.2f} kW<br>%{x}<extra></extra>'
        },
        {
          x: timestamps,
          y: totalProduction,
          type: 'scatter',
          mode: 'lines',
          name: 'Production Totale',
          line: { color: '#27ae60', width: 2, dash: 'dash' },
          hovertemplate: '<b>Production</b><br>%{y:.2f} kW<br>%{x}<extra></extra>'
        }
      ],
      layout: {
        title: {
          text: 'Consommation vs Production - Évolution Temporelle',
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

  const createAutonomyGaugeChart = () => {
    if (!data || data.autonomie === null || data.autonomie === undefined) return null;

    const autonomyValue = data.autonomie || 0;
    
    return {
      data: [{
        type: 'indicator',
        mode: 'gauge+number+delta',
        value: autonomyValue,
        domain: { x: [0, 1], y: [0, 1] },
        title: { 
          text: 'Taux d\'Autonomie (%)',
          font: { size: 16, color: '#2c3e50' }
        },
        delta: { 
          reference: 100,
          valueformat: '.1f'
        },
        gauge: {
          axis: { 
            range: [null, 100],
            tickwidth: 1,
            tickcolor: '#2c3e50'
          },
          bar: { color: autonomyValue >= 90 ? '#27ae60' : autonomyValue >= 70 ? '#f39c12' : '#e74c3c' },
          bgcolor: 'white',
          borderwidth: 2,
          bordercolor: '#2c3e50',
          steps: [
            { range: [0, 50], color: '#ffebee' },
            { range: [50, 80], color: '#fff8e1' },
            { range: [80, 100], color: '#e8f5e8' }
          ],
          threshold: {
            line: { color: '#e74c3c', width: 4 },
            thickness: 0.75,
            value: 90
          }
        }
      }],
      layout: {
        width: 400,
        height: 300,
        margin: { t: 25, r: 25, l: 25, b: 25 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#2c3e50', family: 'Arial' }
      },
      config: {
        displayModeBar: false,
        responsive: true
      }
    };
  };

  const analysisChart = createConsumptionAnalysisChart();
  const timeSeriesChart = createConsumptionTimeSeriesChart();
  const autonomyChart = createAutonomyGaugeChart();

  return (
    <div className="consumption-chart-container">
      {/* Graphique d'analyse consommation vs production */}
      <div className="chart-wrapper">
        {analysisChart ? (
          <Plot
            data={analysisChart.data}
            layout={analysisChart.layout}
            config={analysisChart.config}
            style={{ width: '100%', height: '400px' }}
          />
        ) : (
          <div className="chart-placeholder">
            <p>Aucune donnée de consommation disponible</p>
          </div>
        )}
      </div>

      {/* Jauge d'autonomie */}
      <div className="chart-wrapper">
        {autonomyChart ? (
          <Plot
            data={autonomyChart.data}
            layout={autonomyChart.layout}
            config={autonomyChart.config}
            style={{ width: '100%', height: '300px' }}
          />
        ) : (
          <div className="chart-placeholder">
            <p>Données d'autonomie indisponibles</p>
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

      {/* Résumé des données de consommation */}
      {data && (
        <div className="consumption-summary">
          <h4>Résumé de la Consommation</h4>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">Consommation Totale:</span>
              <span className="stat-value">{(data.consommation_totale || 0).toFixed(2)} kWh</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Pic de Consommation:</span>
              <span className="stat-value">{(data.pic_consommation || 0).toFixed(2)} kW</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Pertes/Déficit:</span>
              <span className="stat-value">{(data.pertes || 0).toFixed(2)} kWh</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Taux d'Autonomie:</span>
              <span className="stat-value">{(data.autonomie || 0).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsumptionChart;