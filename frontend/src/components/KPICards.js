import React from 'react';

const KPICards = ({ data }) => {
  if (!data) {
    return (
      <div className="kpi-cards-loading">
        <p>Chargement des KPIs...</p>
      </div>
    );
  }

  // Configuration des KPIs avec seuils et couleurs
  const getKPIConfig = (kpiType, value) => {
    const configs = {
      autonomie: {
        icon: '🔋',
        title: 'Taux d\'Autonomie',
        unit: '%',
        description: 'Couverture de la consommation par la production locale',
        getColor: (val) => val >= 90 ? '#27ae60' : val >= 70 ? '#f39c12' : '#e74c3c',
        getStatus: (val) => val >= 90 ? 'excellent' : val >= 70 ? 'bon' : 'critique'
      },
      consommation_totale: {
        icon: '⚡',
        title: 'Consommation Totale',
        unit: 'kWh',
        description: 'Énergie totale consommée par le microgrid',
        getColor: () => '#3498db',
        getStatus: () => 'info'
      },
      production_totale: {
        icon: '🏭',
        title: 'Production Totale',
        unit: 'kWh',
        description: 'Énergie totale produite par toutes les sources',
        getColor: () => '#27ae60',
        getStatus: () => 'success'
      },
      pertes: {
        icon: '📉',
        title: 'Pertes/Déficit',
        unit: 'kWh',
        description: 'Consommation non couverte par la production',
        getColor: (val) => val < 5 ? '#27ae60' : val < 15 ? '#f39c12' : '#e74c3c',
        getStatus: (val) => val < 5 ? 'bon' : val < 15 ? 'moyen' : 'critique'
      },
      ratio_renewables: {
        icon: '🌱',
        title: 'Sources Renouvelables',
        unit: '%',
        description: 'Part de la production renouvelable (Battery + PV)',
        getColor: (val) => val >= 80 ? '#27ae60' : val >= 50 ? '#f39c12' : '#e74c3c',
        getStatus: (val) => val >= 80 ? 'excellent' : val >= 50 ? 'bon' : 'faible'
      }
    };
    
    return configs[kpiType] || {
      icon: '📊',
      title: kpiType,
      unit: '',
      description: '',
      getColor: () => '#95a5a6',
      getStatus: () => 'neutral'
    };
  };

  // Formatage des valeurs
  const formatValue = (value, decimals = 2) => {
    if (value === null || value === undefined) return 'N/A';
    return typeof value === 'number' ? value.toFixed(decimals) : value;
  };

  // Calcul du pourcentage pour les barres de statut
  const getStatusPercentage = (kpiType, value) => {
    switch (kpiType) {
      case 'autonomie':
        return Math.min(value, 100);
      case 'ratio_renewables':
        return Math.min(value, 100);
      case 'pertes':
        return Math.min(value / 20 * 100, 100); // 20 kWh = 100%
      default:
        return 50; // Valeur par défaut
    }
  };

  // KPIs principaux à afficher
  const mainKPIs = [
    'consommation_totale',
    'production_totale',
    'autonomie',
    'pertes',
    'ratio_renewables'
  ];

  return (
    <div className="kpi-cards-container">
      <h2 className="section-title">Indicateurs Clés de Performance</h2>
      
      <div className="kpi-cards-grid">
        {mainKPIs.map((kpiKey) => {
          const value = data[kpiKey];
          const config = getKPIConfig(kpiKey, value);
          const statusPercentage = getStatusPercentage(kpiKey, value);
          
          return (
            <div key={kpiKey} className="kpi-card">
              <div className="kpi-card-header">
                <span className="kpi-icon">{config.icon}</span>
                <h3 className="kpi-title">{config.title}</h3>
              </div>
              
              <div className="kpi-value-container">
                <span 
                  className="kpi-value" 
                  style={{ color: config.getColor(value) }}
                >
                  {formatValue(value)}
                </span>
                {config.unit && (
                  <span className="kpi-unit">{config.unit}</span>
                )}
              </div>
              
              <p className="kpi-description">{config.description}</p>
              
              {(kpiKey === 'autonomie' || kpiKey === 'ratio_renewables' || kpiKey === 'pertes') && (
                <div className="kpi-status-bar">
                  <div 
                    className="kpi-status-fill"
                    style={{ 
                      width: `${statusPercentage}%`,
                      backgroundColor: config.getColor(value)
                    }}
                  />
                </div>
              )}
              
              <div className="kpi-status">
                <span 
                  className={`kpi-status-badge ${config.getStatus(value)}`}
                  style={{ backgroundColor: config.getColor(value) }}
                >
                  {config.getStatus(value).toUpperCase()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Métriques secondaires */}
      <div className="kpi-secondary-row">
        <div className="kpi-mini-card">
          <span className="kpi-mini-label">Pic Consommation</span>
          <span className="kpi-mini-value">
            {formatValue(data.pic_consommation)} kW
          </span>
        </div>
        
        <div className="kpi-mini-card">
          <span className="kpi-mini-label">Pic Production</span>
          <span className="kpi-mini-value">
            {formatValue(data.pic_production)} kW
          </span>
        </div>
        
        <div className="kpi-mini-card">
          <span className="kpi-mini-label">Tension Moyenne</span>
          <span className="kpi-mini-value">
            {formatValue(data.voltage_moyen)} V
          </span>
        </div>
        
        <div className="kpi-mini-card">
          <span className="kpi-mini-label">Fréquence Moyenne</span>
          <span className="kpi-mini-value">
            {formatValue(data.frequence_moyenne, 3)} Hz
          </span>
        </div>
      </div>

      {/* Production par source */}
      <div className="production-breakdown">
        <h3>Répartition de la Production</h3>
        <div className="production-sources">
          <div className="source-item">
            <span className="source-icon">🔋</span>
            <span className="source-label">Battery</span>
            <span className="source-value">
              {formatValue(data.production_battery)} kWh
            </span>
          </div>
          
          <div className="source-item">
            <span className="source-icon">☀️</span>
            <span className="source-label">Photovoltaïque</span>
            <span className="source-value">
              {formatValue(data.production_pv)} kWh
            </span>
          </div>
          
          <div className="source-item">
            <span className="source-icon">⛽</span>
            <span className="source-label">Fuel Cell</span>
            <span className="source-value">
              {formatValue(data.production_fc)} kWh
            </span>
          </div>
        </div>
      </div>

      {/* Alertes basées sur les seuils */}
      <div className="kpi-alerts">
        {data.autonomie < 70 && (
          <div className="alert alert-warning">
            ⚠️ Taux d'autonomie faible ({data.autonomie.toFixed(1)}%)
          </div>
        )}
        
        {data.pertes > 15 && (
          <div className="alert alert-danger">
            🚨 Déficit énergétique élevé ({data.pertes.toFixed(2)} kWh)
          </div>
        )}
        
        {data.ratio_renewables < 50 && (
          <div className="alert alert-info">
            ℹ️ Faible part d'énergies renouvelables ({data.ratio_renewables.toFixed(1)}%)
          </div>
        )}
        
        {data.voltage_moyen && (data.voltage_moyen < 360 || data.voltage_moyen > 440) && (
          <div className="alert alert-warning">
            ⚡ Tension hors plage nominale ({data.voltage_moyen.toFixed(2)}V)
          </div>
        )}
        
        {data.frequence_moyenne && (data.frequence_moyenne < 49.5 || data.frequence_moyenne > 50.5) && (
          <div className="alert alert-warning">
            📊 Fréquence hors plage nominale ({data.frequence_moyenne.toFixed(3)}Hz)
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICards;