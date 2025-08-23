import React, { useState } from 'react';

const FilterPanel = ({ filters, onChange, loading }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleInputChange = (field, value) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onChange(localFilters);
  };

  const handleResetFilters = () => {
    const emptyFilters = { startDate: '', endDate: '' };
    setLocalFilters(emptyFilters);
    onChange(emptyFilters);
  };

  const getPresetDateRange = (preset) => {
    const now = new Date();
    let startDate, endDate;
    
    switch (preset) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = now;
        break;
      case 'yesterday':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
        break;
      case 'last7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case 'last30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = now;
        break;
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        break;
      default:
        return;
    }

    const formatDate = (date) => {
      return date.toISOString().slice(0, 16); // Format pour datetime-local
    };

    const newFilters = {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate)
    };
    
    setLocalFilters(newFilters);
    onChange(newFilters);
  };

  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const hasActiveFilters = localFilters.startDate || localFilters.endDate;

  return (
    <div className={`filter-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="filter-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="filter-title">
          <span className="filter-icon">🔍</span>
          <h3>Filtres de Période</h3>
          {hasActiveFilters && !isExpanded && (
            <span className="active-filters-indicator">
              {localFilters.startDate && (
                <span className="filter-badge">
                  Début: {formatDateForDisplay(localFilters.startDate)}
                </span>
              )}
              {localFilters.endDate && (
                <span className="filter-badge">
                  Fin: {formatDateForDisplay(localFilters.endDate)}
                </span>
              )}
            </span>
          )}
        </div>
        <button className="expand-button" type="button">
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {isExpanded && (
        <div className="filter-content">
          {/* Boutons de plages prédéfinies */}
          <div className="preset-buttons">
            <h4>Plages Rapides</h4>
            <div className="preset-grid">
              <button 
                type="button"
                className="preset-button"
                onClick={() => getPresetDateRange('today')}
                disabled={loading}
              >
                Aujourd'hui
              </button>
              <button 
                type="button"
                className="preset-button"
                onClick={() => getPresetDateRange('yesterday')}
                disabled={loading}
              >
                Hier
              </button>
              <button 
                type="button"
                className="preset-button"
                onClick={() => getPresetDateRange('last7days')}
                disabled={loading}
              >
                7 derniers jours
              </button>
              <button 
                type="button"
                className="preset-button"
                onClick={() => getPresetDateRange('last30days')}
                disabled={loading}
              >
                30 derniers jours
              </button>
              <button 
                type="button"
                className="preset-button"
                onClick={() => getPresetDateRange('thisMonth')}
                disabled={loading}
              >
                Ce mois
              </button>
              <button 
                type="button"
                className="preset-button"
                onClick={() => getPresetDateRange('lastMonth')}
                disabled={loading}
              >
                Mois dernier
              </button>
            </div>
          </div>

          {/* Sélection manuelle des dates */}
          <div className="manual-date-selection">
            <h4>Sélection Manuelle</h4>
            <div className="date-inputs">
              <div className="date-input-group">
                <label htmlFor="start-date">Date de Début</label>
                <input
                  id="start-date"
                  type="datetime-local"
                  value={localFilters.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  disabled={loading}
                  className="date-input"
                />
              </div>
              
              <div className="date-input-group">
                <label htmlFor="end-date">Date de Fin</label>
                <input
                  id="end-date"
                  type="datetime-local"
                  value={localFilters.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  disabled={loading}
                  className="date-input"
                />
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="filter-actions">
            <button
              type="button"
              className="action-button apply-button"
              onClick={handleApplyFilters}
              disabled={loading}
            >
              {loading ? 'Application...' : 'Appliquer Filtres'}
            </button>
            
            <button
              type="button"
              className="action-button reset-button"
              onClick={handleResetFilters}
              disabled={loading}
            >
              Réinitialiser
            </button>
          </div>

          {/* Information sur les filtres actifs */}
          {hasActiveFilters && (
            <div className="active-filters-info">
              <h5>Filtres Actifs:</h5>
              <div className="filter-summary">
                {localFilters.startDate && (
                  <div className="filter-item">
                    <strong>Début:</strong> {formatDateForDisplay(localFilters.startDate)}
                  </div>
                )}
                {localFilters.endDate && (
                  <div className="filter-item">
                    <strong>Fin:</strong> {formatDateForDisplay(localFilters.endDate)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;