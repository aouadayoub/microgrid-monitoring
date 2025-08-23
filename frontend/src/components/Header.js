import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = ({ onRefresh, onToggleAutoRefresh, isAutoRefresh, loading, onLogout }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!loading) {
      setLastUpdate(new Date());
    }
  }, [loading]);

  const handleRefreshClick = () => {
    if (onRefresh) onRefresh();
  };

  const handleAutoRefreshToggle = () => {
    if (onToggleAutoRefresh) onToggleAutoRefresh(!isAutoRefresh, 60);
  };

  const handleLogout = () => {
    if (onLogout) onLogout();
  };

  const formatTime = (date) => {
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getTimeSinceUpdate = () => {
    const diffInSeconds = Math.floor((currentTime - lastUpdate) / 1000);
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}min`;
    } else {
      return `${Math.floor(diffInSeconds / 3600)}h ${Math.floor((diffInSeconds % 3600) / 60)}min`;
    }
  };

  // Only show controls on the dashboard page
  const isDashboard = location.pathname === '/';

  return (
    <header className="dashboard-header">
      <nav className="nav">
        <Link to="/" className="logo">⚡ Microgrid Monitoring</Link>
        <div className="nav-center">
          <div className="nav-links">
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Dashboard</Link>
            <Link to="/upload" className={location.pathname === '/upload' ? 'active' : ''}>Upload CSV</Link>
          </div>
        </div>
        <div className="nav-right">
          <span className="current-time">{formatTime(currentTime)}</span>
          <button 
            className="logout-btn"
            onClick={handleLogout}
            title="Se déconnecter"
          >
            🚪 Logout
          </button>
        </div>
      </nav>
      
      {isDashboard && (
        <>
          <div className="header-content">
            <div className="header-left">
              <div className="logo-section">
                <span className="logo-icon">⚡</span>
                <div className="title-section">
                  <h1 className="main-title">Microgrid Monitoring</h1>
                  <p className="subtitle">Tableau de bord énergétique en temps réel</p>
                </div>
              </div>
            </div>
            <div className="header-right">
              <div className="time-info">
                <div className="current-time">
                  <span className="time-label">Maintenant:</span>
                  <span className="time-value">{formatTime(currentTime)}</span>
                </div>
                <div className="last-update">
                  <span className="update-label">Dernière MAJ:</span>
                  <span className="update-value">
                    {formatTime(lastUpdate)} ({getTimeSinceUpdate()})
                  </span>
                </div>
              </div>
              {(onRefresh || onToggleAutoRefresh) && (
                <div className="header-controls">
                  <button
                    className={`control-button refresh-button ${loading ? 'loading' : ''}`}
                    onClick={handleRefreshClick}
                    disabled={loading}
                    title="Actualiser les données"
                  >
                    <span className={`refresh-icon ${loading ? 'spinning' : ''}`}>🔄</span>
                    {loading ? 'Chargement...' : 'Actualiser'}
                  </button>
                  <button
                    className={`control-button auto-refresh-button ${isAutoRefresh ? 'active' : ''}`}
                    onClick={handleAutoRefreshToggle}
                    title={isAutoRefresh ? 'Désactiver le rafraîchissement automatique' : 'Activer le rafraîchissement automatique'}
                  >
                    <span className="auto-icon">{isAutoRefresh ? '⏸️' : '▶️'}</span>
                    {isAutoRefresh ? 'Auto: ON' : 'Auto: OFF'}
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="status-bar">
            <div className="status-indicators">
              <div className="status-item">
                <span className="status-dot connection-status"></span>
                <span className="status-text">Connexion API</span>
              </div>
              {isAutoRefresh && (
                <div className="status-item">
                  <span className="status-dot auto-refresh-status active"></span>
                  <span className="status-text">Rafraîchissement automatique (60s)</span>
                </div>
              )}
              {loading && (
                <div className="status-item">
                  <span className="status-dot loading-status pulsing"></span>
                  <span className="status-text">Chargement des données...</span>
                </div>
              )}
            </div>
            <div className="performance-indicator">
              <span className="performance-label">Dernière réponse:</span>
              <span className="performance-value">
                {loading ? 'En cours...' : `${getTimeSinceUpdate()} ago`}
              </span>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;