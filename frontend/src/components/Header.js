// src/components/Header.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = ({ onLogout }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogoutClick = () => {
    if (onLogout) onLogout();
  };

  const formatTime = (date) =>
    date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

  return (
    <header className="app-header">
      <div className="header-container">
        <Link to="/" className="logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">Microgrid Monitoring</span>
        </Link>

        <nav className="navigation">
          <Link to="/" className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">📊</span>
            Dashboard
          </Link>
          <Link to="/upload" className={location.pathname === '/upload' ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">📤</span>
            Upload CSV
          </Link>
          <Link to="/reports" className={location.pathname === '/reports' ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">📋</span>
            Reports
          </Link>
        </nav>

        <div className="header-controls">
          <div className="time-display">
            <span className="current-time">{formatTime(currentTime)}</span>
          </div>
          
          <button 
            className="logout-button"
            onClick={handleLogoutClick}
            title="Se déconnecter"
          >
            <span className="logout-icon">🚪</span>
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;