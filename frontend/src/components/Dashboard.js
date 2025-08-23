// src/components/Dashboard.js
import React, { useState, useCallback, useEffect } from 'react';
import { 
  KPICards, 
  ProductionChart, 
  ConsumptionChart, 
  PowerDistributionChart, 
  ElectricalMetrics, 
  FilterPanel 
} from './index';
import { useDashboardData } from '../hooks/useDashboardData';
import './Dashboard.css';

const Dashboard = () => {
  const [filters, setFilters] = useState({ startDate: '', endDate: '' });
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);

  const {
    kpiData,
    timeSeriesData,
    loading,
    error,
    lastUpdate,
    refreshData,
    clearError,
    dataStats
  } = useDashboardData(filters, isAutoRefresh ? 60000 : null);

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
    clearError();
  }, [clearError]);

  const handleRefresh = useCallback(() => {
    clearError();
    refreshData();
  }, [refreshData, clearError]);

  const handleToggleAutoRefresh = useCallback((enabled, intervalSeconds = 60) => {
    setIsAutoRefresh(enabled);
    setRefreshInterval(enabled ? intervalSeconds * 1000 : null);
  }, []);

  const handleRetry = useCallback(() => {
    clearError();
    refreshData();
  }, [refreshData, clearError]);

  useEffect(() => {
    console.log('Dashboard state:', { kpiData, timeSeriesData, loading, error, dataStats });
  }, [kpiData, timeSeriesData, loading, error, dataStats]);

  if (error && !kpiData) {
    return (
      <div className="dashboard">
        <div className="error-message">
          <h2>❌ Erreur de chargement</h2>
          <p>{error}</p>
          <button onClick={handleRetry} className="retry-btn">🔄 Réessayer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>⚡ Microgrid Monitoring</h1>
          <p>Tableau de bord énergétique en temps réel</p>
        </div>
        <div className="dashboard-controls">
          <button
            className={`control-btn refresh-btn ${loading ? 'loading' : ''}`}
            onClick={handleRefresh}
            disabled={loading}
            title="Actualiser les données"
          >
            <span className={`refresh-icon ${loading ? 'spinning' : ''}`}>🔄</span>
            {loading ? 'Chargement...' : 'Actualiser'}
          </button>
          <button
            className={`control-btn auto-refresh-btn ${isAutoRefresh ? 'active' : ''}`}
            onClick={() => handleToggleAutoRefresh(!isAutoRefresh, 60)}
            title={isAutoRefresh ? 'Désactiver le rafraîchissement automatique' : 'Activer le rafraîchissement automatique'}
          >
            <span className="auto-icon">{isAutoRefresh ? '⏸️' : '▶️'}</span>
            {isAutoRefresh ? 'Auto: ON' : 'Auto: OFF'}
          </button>
        </div>
      </div>

      {/* Status */}
      {lastUpdate && (
        <div className="status-info">
          <small>
            Dernière mise à jour: {lastUpdate.toLocaleString('fr-FR')}
            {dataStats.hasTimeSeries && ` • ${dataStats.timeSeriesCount} points de données`}
          </small>
        </div>
      )}

      {/* Error Banner */}
      {error && kpiData && (
        <div className="error-banner">
          ⚠️ {error} (Affichage des dernières données disponibles)
          <button onClick={clearError} className="close-error">✕</button>
        </div>
      )}

      {/* Filters */}
      <FilterPanel filters={filters} onChange={handleFiltersChange} loading={loading} />

      {/* Content */}
      <div className="dashboard-content">
        {kpiData && <div className="kpi-section"><KPICards data={kpiData} /></div>}

        <div className="charts-grid">
          <div className="chart-section">
            <h2>📊 Production d'Énergie</h2>
            <ProductionChart data={kpiData} timeSeriesData={timeSeriesData} />
          </div>
          <div className="chart-section">
            <h2>⚡ Consommation d'Énergie</h2>
            <ConsumptionChart data={kpiData} timeSeriesData={timeSeriesData} />
          </div>
          <div className="chart-section">
            <h2>🔄 Distribution de Puissance</h2>
            <PowerDistributionChart data={kpiData} />
          </div>
          <div className="chart-section">
            <h2>⚡ Métriques Électriques</h2>
            <ElectricalMetrics data={kpiData} />
          </div>
        </div>

        {/* Data Quality */}
        {dataStats && (
          <div className="data-quality-info">
            <h3>📈 Qualité des Données</h3>
            <div className="quality-metrics">
              <div className="quality-item">
                <span className="quality-label">KPIs disponibles:</span>
                <span className={`quality-status ${dataStats.hasKPIs ? 'good' : 'error'}`}>
                  {dataStats.hasKPIs ? '✅ Oui' : '❌ Non'}
                </span>
              </div>
              <div className="quality-item">
                <span className="quality-label">Données temporelles:</span>
                <span className={`quality-status ${dataStats.hasTimeSeries ? 'good' : 'warning'}`}>
                  {dataStats.hasTimeSeries ? `✅ ${dataStats.timeSeriesCount} points` : '⚠️ Aucune'}
                </span>
              </div>
              {dataStats.lastUpdateTime && (
                <div className="quality-item">
                  <span className="quality-label">Dernière actualisation:</span>
                  <span className="quality-time">{dataStats.lastUpdateTime.toLocaleString('fr-FR')}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading & No Data */}
        {loading && !kpiData && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Chargement des données du microgrid...</p>
          </div>
        )}
        {!loading && !kpiData && !error && (
          <div className="no-data-state">
            <h3>📊 Aucune donnée disponible</h3>
            <p>Aucune donnée n'a été trouvée pour la période sélectionnée.</p>
            <button onClick={handleRefresh} className="control-btn refresh-btn">🔄 Réessayer</button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="dashboard-footer">
        <p>Microgrid Monitoring System • Données actualisées {isAutoRefresh ? 'automatiquement' : 'manuellement'}</p>
      </div>
    </div>
  );
};

export default Dashboard;
