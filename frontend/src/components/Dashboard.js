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
import Header from './Header';
import './Dashboard.css';

const Dashboard = () => {
  const [filters, setFilters] = useState({ startDate: '', endDate: '' });
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

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

  useEffect(() => {
    if (isAutoRefresh) {
      const intervalId = setInterval(() => {
        refreshData();
      }, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [isAutoRefresh, refreshInterval, refreshData]);

  // Main rendering logic
  if (loading && !kpiData) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Chargement des données du microgrid...</p>
        </div>
      </div>
    );
  }

  if (!kpiData) {
    return (
      <div className="dashboard-container">
        <div className="no-data-state fade-in">
          <h3>📊 Aucune donnée disponible</h3>
          <p>Aucune donnée n'a été trouvée pour la période sélectionnée.</p>
          <a href="/upload" className="cta-btn">
            Importer un fichier CSV
          </a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="dashboard-container">
      {/* Dashboard Header */}
      <div className="dashboard-header fade-in">
        <h2>Tableau de Bord Microgrid</h2>
        <p>Aperçu des performances énergétiques</p>
      </div>

      <div className="dashboard-content">
        {/* Filters and Controls */}
        <FilterPanel 
          filters={filters} 
          onChange={handleFiltersChange} 
          loading={loading} 
          onRefresh={handleRefresh}
          onToggleAutoRefresh={handleToggleAutoRefresh}
          isAutoRefresh={isAutoRefresh}
        />

        {/* Dashboard Navigation Tabs */}
        <div className="dashboard-tabs">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Vue d'ensemble
          </button>
          <button 
            className={`tab-button ${activeTab === 'production' ? 'active' : ''}`}
            onClick={() => setActiveTab('production')}
          >
            Production
          </button>
          <button 
            className={`tab-button ${activeTab === 'consumption' ? 'active' : ''}`}
            onClick={() => setActiveTab('consumption')}
          >
            Consommation
          </button>
          <button 
            className={`tab-button ${activeTab === 'electrical' ? 'active' : ''}`}
            onClick={() => setActiveTab('electrical')}
          >
            Métriques Électriques
          </button>
        </div>

        {/* Dashboard Sections */}
        {activeTab === 'overview' && (
          <div className="dashboard-grid">
            {/* KPI Section */}
            <div className="kpi-section fade-in">
              {kpiData && (
                <>
                  <div className="kpi-card">
                    <h3>Production Totale</h3>
                    <p>{kpiData.production_totale ? kpiData.production_totale.toFixed(2) : '0.00'} kWh</p>
                  </div>
                  <div className="kpi-card">
                    <h3>Consommation Totale</h3>
                    <p>{kpiData.consommation_totale ? kpiData.consommation_totale.toFixed(2) : '0.00'} kWh</p>
                  </div>
                  <div className="kpi-card">
                    <h3>Taux d'Autonomie</h3>
                    <p>{kpiData.autonomie ? kpiData.autonomie.toFixed(1) : '0.0'}%</p>
                  </div>
                  <div className="kpi-card">
                    <h3>Sources Renouvelables</h3>
                    <p>{kpiData.ratio_renewables ? kpiData.ratio_renewables.toFixed(1) : '0.0'}%</p>
                  </div>
                </>
              )}
            </div>

            {/* Production Chart */}
            <div className="dashboard-card fade-in">
              <h3>Répartition de la Production</h3>
              <ProductionChart data={kpiData} timeSeriesData={timeSeriesData} />
            </div>

            {/* Consumption Chart */}
            <div className="dashboard-card fade-in">
              <h3>Analyse Consommation</h3>
              <ConsumptionChart data={kpiData} timeSeriesData={timeSeriesData} />
            </div>

            {/* Power Distribution Chart */}
            <div className="dashboard-card fade-in">
              <h3>Distribution de Puissance</h3>
              <PowerDistributionChart data={kpiData} />
            </div>
          </div>
        )}

        {activeTab === 'production' && (
          <div className="dashboard-grid">
            <div className="dashboard-card full-width">
              <h3>Détails de la Production</h3>
              <ProductionChart data={kpiData} timeSeriesData={timeSeriesData} />
            </div>
            
            <div className="dashboard-card">
              <h3>Production par Source</h3>
              <PowerDistributionChart data={kpiData} />
            </div>
            
            <div className="dashboard-card">
              <h3>Performances de Production</h3>
              <div className="performance-metrics">
                <div className="metric">
                  <span className="metric-label">Efficacité Globale</span>
                  <span className="metric-value">
                    {kpiData.autonomie ? kpiData.autonomie.toFixed(1) : '0.0'}%
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">Pic de Production</span>
                  <span className="metric-value">
                    {kpiData.pic_production ? kpiData.pic_production.toFixed(2) : '0.00'} kW
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">Facteur de Charge</span>
                  <span className="metric-value">
                    {kpiData.pic_production > 0 ? 
                      ((kpiData.production_totale || 0) / (kpiData.pic_production * 24) * 100).toFixed(1) : 
                      '0.0'}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'consumption' && (
          <div className="dashboard-grid">
            <div className="dashboard-card full-width">
              <h3>Détails de la Consommation</h3>
              <ConsumptionChart data={kpiData} timeSeriesData={timeSeriesData} />
            </div>
            
            <div className="dashboard-card">
              <h3>Bilan Énergétique</h3>
              <div className="energy-balance">
                <div className="balance-item">
                  <span className="balance-label">Production Totale</span>
                  <span className="balance-value positive">
                    +{kpiData.production_totale ? kpiData.production_totale.toFixed(2) : '0.00'} kWh
                  </span>
                </div>
                <div className="balance-item">
                  <span className="balance-label">Consommation Totale</span>
                  <span className="balance-value negative">
                    -{kpiData.consommation_totale ? kpiData.consommation_totale.toFixed(2) : '0.00'} kWh
                  </span>
                </div>
                <div className="balance-divider"></div>
                <div className="balance-item total">
                  <span className="balance-label">Bilan Net</span>
                  <span className={`balance-value ${(kpiData.production_totale - kpiData.consommation_totale) >= 0 ? 'positive' : 'negative'}`}>
                    {(kpiData.production_totale - kpiData.consommation_totale).toFixed(2)} kWh
                  </span>
                </div>
              </div>
            </div>
            
            <div className="dashboard-card">
              <h3>Efficacité Énergétique</h3>
              <div className="efficiency-metrics">
                <div className="efficiency-item">
                  <span className="efficiency-label">Autonomie</span>
                  <div className="efficiency-bar">
                    <div 
                      className="efficiency-fill"
                      style={{ width: `${kpiData.autonomie || 0}%` }}
                    ></div>
                  </div>
                  <span className="efficiency-value">{kpiData.autonomie ? kpiData.autonomie.toFixed(1) : '0.0'}%</span>
                </div>
                <div className="efficiency-item">
                  <span className="efficiency-label">Renouvelable</span>
                  <div className="efficiency-bar">
                    <div 
                      className="efficiency-fill renewable"
                      style={{ width: `${kpiData.ratio_renewables || 0}%` }}
                    ></div>
                  </div>
                  <span className="efficiency-value">{kpiData.ratio_renewables ? kpiData.ratio_renewables.toFixed(1) : '0.0'}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'electrical' && (
          <div className="dashboard-grid">
            <div className="dashboard-card full-width">
              <h3>Métriques Électriques Détaillées</h3>
              <ElectricalMetrics data={kpiData} />
            </div>
            
            <div className="dashboard-card">
              <h3>Qualité du Courant</h3>
              <div className="quality-metrics">
                <div className="quality-item">
                  <span className="quality-label">Tension Moyenne</span>
                  <span className="quality-value">
                    {kpiData.voltage_moyen ? kpiData.voltage_moyen.toFixed(1) : 'N/A'} V
                  </span>
                  <div className={`quality-status ${kpiData.voltage_moyen >= 360 && kpiData.voltage_moyen <= 440 ? 'good' : 'warning'}`}>
                    {kpiData.voltage_moyen >= 360 && kpiData.voltage_moyen <= 440 ? '✓ Bon' : '⚠ Hors plage'}
                  </div>
                </div>
                <div className="quality-item">
                  <span className="quality-label">Fréquence Moyenne</span>
                  <span className="quality-value">
                    {kpiData.frequence_moyenne ? kpiData.frequence_moyenne.toFixed(3) : 'N/A'} Hz
                  </span>
                  <div className={`quality-status ${kpiData.frequence_moyenne >= 49.5 && kpiData.frequence_moyenne <= 50.5 ? 'good' : 'warning'}`}>
                    {kpiData.frequence_moyenne >= 49.5 && kpiData.frequence_moyenne <= 50.5 ? '✓ Bon' : '⚠ Hors plage'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Bar */}
        <div className="dashboard-status-bar">
          <div className="status-item">
            <span className="status-label">Dernière mise à jour:</span>
            <span className="status-value">{lastUpdate ? new Date(lastUpdate).toLocaleTimeString('fr-FR') : 'N/A'}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Auto-rafraîchissement:</span>
            <span className={`status-value ${isAutoRefresh ? 'active' : 'inactive'}`}>
              {isAutoRefresh ? 'Activé (60s)' : 'Désactivé'}
            </span>
          </div>
          {error && (
            <div className="status-item error">
              <span className="status-label">Erreur:</span>
              <span className="status-value">{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;