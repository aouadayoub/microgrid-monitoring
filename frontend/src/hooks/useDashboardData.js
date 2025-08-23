import { useState, useEffect, useCallback } from 'react';
import { fetchKPIs, fetchTimeSeriesData } from '../utils/apiConfig';

/**
 * Hook personnalisé pour gérer les données du dashboard
 * @param {Object} filters - Filtres de date
 * @param {number} refreshInterval - Intervalle de rafraîchissement en millisecondes
 * @returns {Object} État des données et fonctions de contrôle
 */
export const useDashboardData = (filters = {}, refreshInterval = null) => {
  const [kpiData, setKpiData] = useState(null);
  const [timeSeriesData, setTimeSeriesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Fonction pour charger les KPIs
  const loadKPIs = useCallback(async (startDate = '', endDate = '') => {
    try {
      setError(null);
      const data = await fetchKPIs(startDate, endDate);
      setKpiData(data);
      setLastUpdate(new Date());
      return data;
    } catch (err) {
      setError(`Erreur lors du chargement des KPIs: ${err.message}`);
      console.error('Erreur KPIs:', err);
      throw err;
    }
  }, []);

  // Fonction pour charger les données temporelles
  const loadTimeSeriesData = useCallback(async (startDate = '', endDate = '') => {
    try {
      const data = await fetchTimeSeriesData(startDate, endDate, 1000);
      setTimeSeriesData(data);
      return data;
    } catch (err) {
      console.warn('Erreur lors du chargement des données temporelles:', err);
      // Ne pas considérer cela comme une erreur bloquante
      setTimeSeriesData(null);
    }
  }, []);

  // Fonction pour charger toutes les données
  const loadAllData = useCallback(async (startDate = '', endDate = '') => {
    setLoading(true);
    setError(null);
    
    try {
      // Charger les KPIs (prioritaire)
      await loadKPIs(startDate, endDate);
      
      // Charger les données temporelles (optionnel)
      await loadTimeSeriesData(startDate, endDate);
      
    } catch (err) {
      // L'erreur est déjà gérée dans loadKPIs
    } finally {
      setLoading(false);
    }
  }, [loadKPIs, loadTimeSeriesData]);

  // Fonction de rafraîchissement manuel
  const refreshData = useCallback(() => {
    return loadAllData(filters.startDate, filters.endDate);
  }, [loadAllData, filters.startDate, filters.endDate]);

  // Effet pour le chargement initial et les changements de filtres
  useEffect(() => {
    loadAllData(filters.startDate, filters.endDate);
  }, [filters.startDate, filters.endDate]); // eslint-disable-line react-hooks/exhaustive-deps

  // Effet pour le rafraîchissement automatique
  useEffect(() => {
    if (!refreshInterval) return;

    const interval = setInterval(() => {
      console.log('Rafraîchissement automatique des données...');
      loadAllData(filters.startDate, filters.endDate);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, filters.startDate, filters.endDate, loadAllData]);

  // Statistiques sur les données
  const dataStats = {
    hasKPIs: !!kpiData,
    hasTimeSeries: !!timeSeriesData,
    timeSeriesCount: timeSeriesData?.results?.length || 0,
    lastUpdateTime: lastUpdate,
    timeSinceUpdate: lastUpdate ? Date.now() - lastUpdate.getTime() : null
  };

  // Validation des données KPI
  const validateKPIData = useCallback((data) => {
    if (!data) return false;
    
    const requiredFields = [
      'consommation_totale',
      'production_totale',
      'autonomie'
    ];
    
    return requiredFields.every(field => 
      data.hasOwnProperty(field) && data[field] !== null
    );
  }, []);

  // État de validation
  const isDataValid = kpiData ? validateKPIData(kpiData) : false;

  return {
    // Données
    kpiData,
    timeSeriesData,
    
    // États
    loading,
    error,
    lastUpdate,
    
    // Fonctions
    refreshData,
    loadKPIs,
    loadTimeSeriesData,
    
    // Métadonnées
    dataStats,
    isDataValid,
    
    // Utilitaires
    clearError: () => setError(null),
    setManualError: setError
  };
};

export default useDashboardData;