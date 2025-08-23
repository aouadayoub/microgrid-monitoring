// src/components/Login.js
import React, { useState } from 'react';
import { login } from '../utils/apiConfig';

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      onLoginSuccess();
    } catch (err) {
      setError('Nom d’utilisateur ou mot de passe incorrect');
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Connexion</h2>
        <input type="text" placeholder="Nom d’utilisateur" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Se connecter</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default Login;
