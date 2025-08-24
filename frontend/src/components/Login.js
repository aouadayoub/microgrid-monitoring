// src/components/Login.js - Enhanced Login Component
import React, { useState, useEffect } from 'react';
import { login } from '../utils/apiConfig';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Clear error when inputs change
  useEffect(() => {
    if (error) {
      setError('');
    }
  }, [username, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!username.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await login(username.trim(), password);
      
      if (result.success) {
        // Add a small delay for better UX
        setTimeout(() => {
          onLoginSuccess();
        }, 500);
      } else {
        setError(result.error || 'Nom d\'utilisateur ou mot de passe incorrect');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Une erreur s\'est produite. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <form onSubmit={handleSubmit} className="login-form">
          {/* Header */}
          <div className="login-header">
            <div className="login-icon">
              🔐
            </div>
            <h2>Connexion</h2>
            <p>Accédez à votre tableau de bord Microgrid</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {/* Form Fields */}
          <div className="form-fields">
            <div className="form-group">
              <label htmlFor="username">
                <span className="field-icon">👤</span>
                Nom d'utilisateur
              </label>
              <input
                id="username"
                type="text"
                placeholder="Entrez votre nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                autoComplete="username"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <span className="field-icon">🔑</span>
                Mot de passe
              </label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Entrez votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                  disabled={loading}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className={`login-btn ${loading ? 'loading' : ''}`}
            disabled={loading || !username.trim() || !password.trim()}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Connexion en cours...
              </>
            ) : (
              <>
                <span className="btn-icon">🚀</span>
                Se connecter
              </>
            )}
          </button>

          {/* Footer */}
          <div className="login-footer">
            <p>
              <span className="footer-icon">🔒</span>
              Connexion sécurisée
            </p>
          </div>
        </form>

        {/* Background Decoration */}
        <div className="login-decoration">
          <div className="decoration-circle circle-1"></div>
          <div className="decoration-circle circle-2"></div>
          <div className="decoration-circle circle-3"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;