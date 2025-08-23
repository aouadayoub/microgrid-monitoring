import React from 'react';
import Plot from 'react-plotly.js';

const ElectricalMetrics = ({ data }) => {
  const createVoltageGauge = () => {
    if (!data || data.voltage_moyen === null || data.voltage_moyen === undefined) return null;

    const voltage = data.voltage_moyen || 0;
    // Plage nominale typique pour un microgrid LV (par exemple 380-420V pour du 400V nominal)
    const nominalVoltage = 400;
    const minAcceptable = nominalVoltage * 0.9; // -10%
    const maxAcceptable = nominalVoltage * 1.1; // +10%
    
    return {
      data: [{
        type: 'indicator',
        mode: 'gauge+number',
        value: voltage,
        domain: { x: [0, 1], y: [0, 1] },
        title: { 
          text: 'Tension AC Moyenne (V)',
          font: { size: 14, color: '#2c3e50' }
        },
        gauge: {
          axis: { 
            range: [300, 500],
            tickwidth: 1,
            tickcolor: '#2c3e50'
          },
          bar: { 
            color: voltage >= minAcceptable && voltage <= maxAcceptable ? '#27ae60' : '#e74c3c',
            thickness: 0.2
          },
          bgcolor: 'white',
          borderwidth: 2,
          bordercolor: '#2c3e50',
          steps: [
            { range: [300, minAcceptable], color: '#ffebee' },
            { range: [minAcceptable, maxAcceptable], color: '#e8f5e8' },
            { range: [maxAcceptable, 500], color: '#ffebee' }
          ],
          threshold: {
            line: { color: '#f39c12', width: 4 },
            thickness: 0.75,
            value: nominalVoltage
          }
        }
      }],
      layout: {
        width: 300,
        height: 250,
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

  const createFrequencyGauge = () => {
    if (!data || data.frequence_moyenne === null || data.frequence_moyenne === undefined) return null;

    const frequency = data.frequence_moyenne || 0;
    // Plage nominale pour 50Hz (±0.5Hz acceptable, ±1Hz limite)
    const nominalFreq = 50;
    const minAcceptable = 49.5;
    const maxAcceptable = 50.5;
    
    return {
      data: [{
        type: 'indicator',
        mode: 'gauge+number',
        value: frequency,
        domain: { x: [0, 1], y: [0, 1] },
        title: { 
          text: 'Fréquence AC Moyenne (Hz)',
          font: { size: 14, color: '#2c3e50' }
        },
        number: { suffix: ' Hz', font: { size: 20 } },
        gauge: {
          axis: { 
            range: [48, 52],
            tickwidth: 1,
            tickcolor: '#2c3e50',
            dtick: 0.5
          },
          bar: { 
            color: frequency >= minAcceptable && frequency <= maxAcceptable ? '#27ae60' : '#e74c3c',
            thickness: 0.2
          },
          bgcolor: 'white',
          borderwidth: 2,
          bordercolor: '#2c3e50',
          steps: [
            { range: [48, minAcceptable], color: '#ffebee' },
            { range: [minAcceptable, maxAcceptable], color: '#e8f5e8' },
            { range: [maxAcceptable, 52], color: '#ffebee' }
          ],
          threshold: {
            line: { color: '#f39c12', width: 4 },
            thickness: 0.75,
            value: nominalFreq
          }
        }
      }],
      layout: {
        width: 300,
        height: 250,
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

  const createQualityIndicators = () => {
    if (!data) return null;

    const voltage = data.voltage_moyen || 0;
    const frequency = data.frequence_moyenne || 0;
    
    // Évaluation de la qualité
    const voltageQuality = voltage >= 360 && voltage <= 440 ? 'Bonne' : 
                          voltage >= 320 && voltage <= 480 ? 'Acceptable' : 'Mauvaise';
    const frequencyQuality = frequency >= 49.5 && frequency <= 50.5 ? 'Bonne' : 
                           frequency >= 49 && frequency <= 51 ? 'Acceptable' : 'Mauvaise';

    const getQualityColor = (quality) => {
      switch (quality) {
        case 'Bonne': return '#27ae60';
        case 'Acceptable': return '#f39c12';
        case 'Mauvaise': return '#e74c3c';
        default: return '#95a5a6';
      }
    };

    return {
      data: [{
        type: 'bar',
        x: ['Tension', 'Fréquence'],
        y: [1, 1], // Valeur fixe pour l'affichage
        marker: {
          color: [getQualityColor(voltageQuality), getQualityColor(frequencyQuality)],
          opacity: 0.8
        },
        text: [voltageQuality, frequencyQuality],
        textposition: 'inside',
        textfont: { color: 'white', size: 14, family: 'Arial Black' },
        hovertemplate: '<b>%{x}</b><br>' +
                      'Qualité: %{text}<br>' +
                      '<extra></extra>',
        showlegend: false
      }],
      layout: {
        title: {
          text: 'Qualité des Paramètres Électriques',
          font: { size: 16, color: '#2c3e50' }
        },
        xaxis: {
          title: 'Paramètres'
        },
        yaxis: {
          title: 'Statut',
          showticklabels: false,
          range: [0, 1.2]
        },
        margin: { t: 50, r: 50, b: 80, l: 80 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)'
      },
      config: {
        displayModeBar: false,
        responsive: true
      }
    };
  };

  const voltageGauge = createVoltageGauge();
  const frequencyGauge = createFrequencyGauge();
  const qualityChart = createQualityIndicators();

  return (
    <div className="electrical-metrics-container">
      <h3 className="section-title">Métriques Électriques</h3>
      
      {/* Jauges de tension et fréquence */}
      <div className="gauges-row">
        <div className="gauge-wrapper">
          {voltageGauge ? (
            <Plot
              data={voltageGauge.data}
              layout={voltageGauge.layout}
              config={voltageGauge.config}
              style={{ width: '100%', height: '250px' }}
            />
          ) : (
            <div className="gauge-placeholder">
              <p>Données de tension indisponibles</p>
            </div>
          )}
        </div>
        
        <div className="gauge-wrapper">
          {frequencyGauge ? (
            <Plot
              data={frequencyGauge.data}
              layout={frequencyGauge.layout}
              config={frequencyGauge.config}
              style={{ width: '100%', height: '250px' }}
            />
          ) : (
            <div className="gauge-placeholder">
              <p>Données de fréquence indisponibles</p>
            </div>
          )}
        </div>
      </div>

      {/* Indicateurs de qualité */}
      <div className="chart-wrapper">
        {qualityChart ? (
          <Plot
            data={qualityChart.data}
            layout={qualityChart.layout}
            config={qualityChart.config}
            style={{ width: '100%', height: '300px' }}
          />
        ) : (
          <div className="chart-placeholder">
            <p>Impossible d'évaluer la qualité électrique</p>
          </div>
        )}
      </div>

      {/* Détails des métriques */}
      {data && (
        <div className="electrical-details">
          <h4>Détails des Métriques Électriques</h4>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Tension Moyenne:</span>
              <span className="detail-value">
                {data.voltage_moyen !== null && data.voltage_moyen !== undefined ? 
                  `${data.voltage_moyen.toFixed(2)} V` : 'N/A'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Fréquence Moyenne:</span>
              <span className="detail-value">
                {data.frequence_moyenne !== null && data.frequence_moyenne !== undefined ? 
                  `${data.frequence_moyenne.toFixed(3)} Hz` : 'N/A'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Écart Tension Nominale:</span>
              <span className="detail-value">
                {data.voltage_moyen !== null && data.voltage_moyen !== undefined ? 
                  `${((data.voltage_moyen - 400) / 400 * 100).toFixed(2)}%` : 'N/A'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Écart Fréquence Nominale:</span>
              <span className="detail-value">
                {data.frequence_moyenne !== null && data.frequence_moyenne !== undefined ? 
                  `${((data.frequence_moyenne - 50) / 50 * 100).toFixed(3)}%` : 'N/A'}
              </span>
            </div>
          </div>
          
          {/* Alertes de qualité */}
          <div className="quality-alerts">
            {data.voltage_moyen !== null && data.voltage_moyen !== undefined && 
             (data.voltage_moyen < 360 || data.voltage_moyen > 440) && (
              <div className="alert alert-warning">
                ⚠️ Tension hors plage nominale acceptable (360-440V)
              </div>
            )}
            {data.frequence_moyenne !== null && data.frequence_moyenne !== undefined && 
             (data.frequence_moyenne < 49.5 || data.frequence_moyenne > 50.5) && (
              <div className="alert alert-warning">
                ⚠️ Fréquence hors plage nominale acceptable (49.5-50.5Hz)
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ElectricalMetrics;