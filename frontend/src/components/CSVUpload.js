// src/components/CSVUpload.js
import React, { useState, useRef } from 'react';
import { uploadCSV, checkTaskStatus } from '../utils/apiConfig';
import './CSVUpload.css';

const CSVUpload = () => {
  const [file, setFile] = useState(null);
  const [delimiter, setDelimiter] = useState(',');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [taskStatus, setTaskStatus] = useState(null);
  const [processingResults, setProcessingResults] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setUploadStatus(null);
        setProcessingResults(null);
        setTaskStatus(null);
      } else {
        setUploadStatus({ type: 'error', message: 'Veuillez sélectionner un fichier CSV valide.' });
        setFile(null);
      }
    }
  };

  const pollTaskStatus = async (taskId) => {
    const maxPolls = 60;
    let pollCount = 0;

    const poll = async () => {
      try {
        pollCount++;
        const response = await checkTaskStatus(taskId);
        setTaskStatus(response);

        if (response.status === 'SUCCESS' && response.result) {
          setUploadProgress(100);
          setProcessingResults(response.result);
          setUploadStatus({ type: 'success', message: '✅ Traitement terminé avec succès!' });
          setUploading(false);
          return;
        }

        if (response.status === 'FAILURE') {
          setUploadStatus({
            type: 'error',
            message: `❌ Erreur lors du traitement: ${response.result?.error || 'Erreur inconnue'}`
          });
          setUploading(false);
          return;
        }

        if (['PENDING', 'STARTED'].includes(response.status)) {
          if (pollCount < maxPolls) {
            const progressEstimate = Math.min(50 + pollCount * 2, 90);
            setUploadProgress(progressEstimate);
            setTimeout(poll, 5000);
          } else {
            setUploadStatus({
              type: 'warning',
              message: '⏳ Le traitement prend plus de temps que prévu. Vérifiez plus tard.'
            });
            setUploading(false);
          }
        }
      } catch (error) {
        console.error('Error polling task status:', error);
        setUploadStatus({
          type: 'error',
          message: `❌ Erreur lors de la vérification du statut de la tâche: ${error.message}`
        });
        setUploading(false);
      }
    };

    await poll();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setUploadStatus({ type: 'error', message: 'Veuillez sélectionner un fichier CSV.' });
      return;
    }

    setUploading(true);
    setUploadProgress(10);
    setUploadStatus({ type: 'info', message: '📤 Upload en cours...' });

    try {
      const uploadResponse = await uploadCSV(file, delimiter);
      setUploadProgress(50);
      setUploadStatus({ type: 'info', message: '⚙️ Traitement en cours...' });

      if (uploadResponse.task_id) {
        await pollTaskStatus(uploadResponse.task_id);
      } else {
        setUploadStatus({ type: 'error', message: 'Aucun ID de tâche reçu du serveur.' });
        setUploading(false);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus({ type: 'error', message: `❌ Erreur d'upload: ${error.message}` });
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleReset = () => {
    setFile(null);
    setDelimiter(',');
    setUploading(false);
    setUploadStatus(null);
    setUploadProgress(0);
    setTaskStatus(null);
    setProcessingResults(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (type) => {
    switch (type) {
      case 'success': return '#27ae60';
      case 'error': return '#e74c3c';
      case 'warning': return '#f39c12';
      case 'info': return '#3498db';
      default: return '#95a5a6';
    }
  };

  return (
    <div className="csv-upload-container">
      <div className="upload-header">
        <h2>📊 Import de Données CSV</h2>
        <p className="upload-description">
          Importez vos données de microgrid au format CSV pour analyse et visualisation
        </p>
      </div>

      <div className="upload-card">
        <form onSubmit={handleSubmit} className="csv-upload-form">
          <div className="form-section">
            <h3>📁 Sélection du fichier</h3>
            <div className="file-input-wrapper">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={uploading}
                className="file-input"
                id="csv-file"
              />
              <label htmlFor="csv-file" className={`file-label ${uploading ? 'disabled' : ''}`}>
                {file ? (
                  <div className="file-selected">
                    <span className="file-icon">📄</span>
                    <div className="file-details">
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">{formatFileSize(file.size)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="file-placeholder">
                    <span className="upload-icon">⬆️</span>
                    <span>Cliquez pour sélectionner un fichier CSV</span>
                    <small>ou glissez-déposez votre fichier ici</small>
                  </div>
                )}
              </label>
            </div>

            {file && (
              <button 
                type="button" 
                onClick={handleReset}
                className="clear-file-btn"
                disabled={uploading}
              >
                🗑️ Changer de fichier
              </button>
            )}
          </div>

          <div className="form-section">
            <h3>⚙️ Configuration</h3>
            <div className="form-group">
              <label htmlFor="delimiter">Délimiteur CSV</label>
              <select
                id="delimiter"
                value={delimiter}
                onChange={(e) => setDelimiter(e.target.value)}
                disabled={uploading}
                className="delimiter-select"
              >
                <option value=",">Virgule (,)</option>
                <option value=";">Point-virgule (;)</option>
                <option value="\t">Tabulation</option>
                <option value="|">Pipe (|)</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={!file || uploading}
              className={`upload-btn ${uploading ? 'uploading' : ''}`}
            >
              {uploading ? (
                <>
                  <span className="spinner"></span>
                  Traitement...
                </>
              ) : '🚀 Lancer l\'import'}
            </button>

            {!uploading && (file || uploadStatus) && (
              <button type="button" onClick={handleReset} className="reset-btn">
                🔄 Réinitialiser
              </button>
            )}
          </div>
        </form>

        {uploading && (
          <div className="progress-section">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
            </div>
            <div className="progress-text">
              {uploadProgress}% - {uploadProgress < 50 ? 'Upload' : 'Traitement'}
            </div>
          </div>
        )}

        {uploadStatus && (
          <div className={`upload-status ${uploadStatus.type}`} style={{ borderLeftColor: getStatusColor(uploadStatus.type) }}>
            <div className="status-message">{uploadStatus.message}</div>
            {taskStatus && (
              <div className="task-details">
                <small>Statut de la tâche: <strong>{taskStatus.status}</strong>{taskStatus.task_id && ` (ID: ${taskStatus.task_id})`}</small>
              </div>
            )}
          </div>
        )}

        {processingResults && (
          <div className="results-section">
            <h3>📈 Résultats du traitement</h3>
            <div className="results-grid">
              <div className="result-card success">
                <span className="result-label">✅ Lignes importées</span>
                <span className="result-value">{processingResults.imported_rows || 0}</span>
              </div>
              <div className="result-card warning">
                <span className="result-label">⚠️ Lignes ignorées</span>
                <span className="result-value">{processingResults.skipped_rows || 0}</span>
              </div>
              <div className="result-card info">
                <span className="result-label">📊 Total traité</span>
                <span className="result-value">{processingResults.total_rows || 0}</span>
              </div>
            </div>

            {processingResults.imported_rows > 0 && (
              <div className="success-actions">
                <p className="success-text">🎉 Import réussi! Vous pouvez maintenant visualiser vos données dans le dashboard.</p>
                <a href="/" className="dashboard-link">📊 Aller au Dashboard</a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CSVUpload;
