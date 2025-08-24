// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CSVUpload from './components/CSVUpload';
import ReportManager from './components/ReportManager';
import Header from './components/Header';
import { logout, getToken } from './utils/apiConfig';

import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken());
  
  useEffect(() => {
    // Check token validity on mount
    const token = getToken();
    setIsAuthenticated(!!token);
  }, []);

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Main App Layout for authenticated users
const AppLayout = ({ children, onLogout }) => (
  <>
    <Header onLogout={onLogout} />
    <main className="main-content">
      {children}
    </main>
  </>
);

const App = () => {
  const [loading, setLoading] = useState(true);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Check authentication on app load
  useEffect(() => {
    // Small delay to show loading state
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  // Handle successful login
  const handleLoginSuccess = () => {
    setForceUpdate(prev => prev + 1); // Force re-render to update auth state
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setForceUpdate(prev => prev + 1); // Force re-render
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <div className="loading-text">
          <h2>Microgrid Dashboard</h2>
          <p>Initialisation en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App" key={forceUpdate}>
        <Routes>
          {/* Login Route */}
          <Route 
            path="/login" 
            element={
              getToken() ? 
                <Navigate to="/" replace /> : 
                <Login onLoginSuccess={handleLoginSuccess} />
            } 
          />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout onLogout={handleLogout}>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/upload" element={
            <ProtectedRoute>
              <AppLayout onLogout={handleLogout}>
                <CSVUpload />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/reports" element={
            <ProtectedRoute>
              <AppLayout onLogout={handleLogout}>
                <ReportManager />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          {/* Fallback routes */}
          <Route path="*" element={
            getToken() ? 
              <Navigate to="/" replace /> : 
              <Navigate to="/login" replace />
          } />
        </Routes>
      </div>
    </Router>
  );
};

export default App;