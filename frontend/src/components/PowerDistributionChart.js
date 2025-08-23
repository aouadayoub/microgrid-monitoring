import React from 'react';
import Plot from 'react-plotly.js';

const PowerDistributionChart = ({ data }) => {
  const createPowerFlowChart = () => {
    if (!data) return null;

    // Données pour le graphique en barres horizontales
    const sources = ['Battery', 'Photovoltaïque', 'Fuel Cell'];
    const productions = [
      data.production_battery || 0,
      data.production_pv || 0,
      data.production_fc || 0
    ];
    
    const colors = ['#3498db', '#f39c12', '#e74c3c'];

    return {
      data: [{
        type: 'bar',
        orientation: 'h',
        x: productions,
        y: sources,
        marker: {
          color: colors,
          opacity: 0.8,
          line: {
            color: '#2c3e50',
            width: 1
          }
        },
        hovertemplate: '<b>%{y}</b><br>' +
                      'Production: %{x:.2f} kWh<br>' +
                      '<extra></extra>',
        text: productions.map(val => `${val.toFixed(1)} kWh`),
        textposition: 'outside'
      }],
      layout: {
        title: {
          text: 'Production par Source d\'Énergie',
          font: { size: 16, color: '#2c3e50' }
        },
        xaxis: {
          title: 'Production (kWh)',
          gridcolor: '#ecf0f1'
        },
        yaxis: {
          title: 'Sources d\'Énergie',
          automargin: true
        },
        margin: { t: 50, r: 100, b: 80, l: 120 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)'
      },
      config: {
        displayModeBar: false,
        responsive: true
      }
    };
  };

  const createEnergyBalanceChart = () => {
    if (!data) return null;

    const balanceData = [
      {
        category: 'Production Totale',
        value: data.production_totale || 0,
        color: '#27ae60',
        type: 'production'
      },
      {
        category: 'Consommation Totale',
        value: -(data.consommation_totale || 0),
        color: '#e74c3c',
        type: 'consommation'
      }
    ];

    // Calcul du bilan énergétique
    const balance = (data.production_totale || 0) - (data.consommation_totale || 0);
    
    return {
      data: [{
        type: 'bar',
        x: balanceData.map(item => item.category),
        y: balanceData.map(item => item.value),
        marker: {
          color: balanceData.map(item => item.color),
          opacity: 0.8,
          line: {
            color: '#2c3e50',
            width: 1
          }
        },
        hovertemplate: '<b>%{x}</b><br>' +
                      'Valeur: %{y:.2f} kWh<br>' +
                      '<extra></extra>',
        text: balanceData.map(item => `${Math.abs(item.value).toFixed(1)} kWh`),
        textposition: 'outside'
      }],
      layout: {
        title: {
          text: `Bilan Énergétique (${balance >= 0 ? 'Excédent' : 'Déficit'}: ${Math.abs(balance).toFixed(2)} kWh)`,
          font: { size: 16, color: balance >= 0 ? '#27ae60' : '#e74c3c' }
        },
        xaxis: {
          title: 'Type',
          tickangle: -45
        },
        yaxis: {
          title: 'Énergie (kWh)',
          gridcolor: '#ecf0f1',
          zeroline: true,
          zerolinecolor: '#2c3e50',
          zerolinewidth: 2
        },
        shapes: [{
          type: 'line',
          x0: -0.5,
          x1: 1.5,
          y0: 0,
          y1: 0,
          line: {
            color: '#2c3e50',
            width: 2,
            dash: 'dash'
          }
        }],
        margin: { t: 60, r: 50, b: 100, l: 80 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)'
      },
      config: {
        displayModeBar: false,
        responsive: true
      }
    };
  };

  const createPeakPowerChart = () => {
    if (!data) return null;

    const peakData = [
      {
        type: 'Pic Production',
        value: data.pic_production || 0,
        color: '#27ae60'
      },
      {
        type: 'Pic Consommation',
        value: data.pic_consommation || 0,
        color: '#e74c3c'
      }
    ];

    return {
      data: [{
        type: 'bar',
        x: peakData.map(item => item.type),
        y: peakData.map(item => item.value),
        marker: {
          color: peakData.map(item => item.color),
          opacity: 0.8,
          line: {
            color: '#2c3e50',
            width: 1
          }
        },
        hovertemplate: '<b>%{x}</b><br>' +
                      'Puissance: %{y:.2f} kW<br>' +
                      '<extra></extra>',
        text: peakData.map(item => `${item.value.toFixed(1)} kW`),
        textposition: 'outside'
      }],
      layout: {
        title: {
          text: 'Puissances de Pointe',
          font: { size: 16, color: '#2c3e50' }
        },
        xaxis: {
          title: 'Type de Pic',
          tickangle: -45
        },
        yaxis: {
          title: 'Puissance (kW)',
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

  const powerFlowChart = createPowerFlowChart();
  const energyBalanceChart = createEnergyBalanceChart();
  const peakPowerChart = createPeakPowerChart();

  return (
    <div className="power-distribution-container">
      {/* Graphique de flux de puissance par source */}
      <div className="chart-wrapper">
        {powerFlowChart ? (
          <Plot
            data={powerFlowChart.data}
            layout={powerFlowChart.layout}
            config={powerFlowChart.config}
            style={{ width: '100%', height: '300px' }}
          />
        ) : (
          <div className="chart-placeholder">
            <p>Aucune donnée de production disponible</p>
          </div>
        )}
      </div>

      {/* Graphique du bilan énergétique */}
      <div className="chart-wrapper">
        {energyBalanceChart ? (
          <Plot
            data={energyBalanceChart.data}
            layout={energyBalanceChart.layout}
            config={energyBalanceChart.config}
            style={{ width: '100%', height: '400px' }}
          />
        ) : (
          <div className="chart-placeholder">
            <p>Impossible de calculer le bilan énergétique</p>
          </div>
        )}
      </div>

      {/* Graphique des puissances de pointe */}
      <div className="chart-wrapper">
        {peakPowerChart ? (
          <Plot
            data={peakPowerChart.data}
            layout={peakPowerChart.layout}
            config={peakPowerChart.config}
            style={{ width: '100%', height: '300px' }}
          />
        ) : (
          <div className="chart-placeholder">
            <p>Données de puissance de pointe indisponibles</p>
          </div>
        )}
      </div>

      {/* Indicateurs de performance */}
      {data && (
        <div className="power-metrics">
          <h4>Métriques de Puissance</h4>
          <div className="metrics-grid">
            <div className="metric-card">
              <span className="metric-label">Facteur de Charge Moyen</span>
              <span className="metric-value">
                {data.pic_production > 0 ? 
                  ((data.production_totale || 0) / (data.pic_production * 24) * 100).toFixed(1) : 
                  'N/A'
                }%
              </span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Efficacité Énergétique</span>
              <span className="metric-value">
                {(data.autonomie || 0).toFixed(1)}%
              </span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Déficit de Puissance</span>
              <span className="metric-value">
                {Math.max(0, (data.pic_consommation || 0) - (data.pic_production || 0)).toFixed(2)} kW
              </span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Sources Renouvelables</span>
              <span className="metric-value">
                {(data.ratio_renewables || 0).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PowerDistributionChart;