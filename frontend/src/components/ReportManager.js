// src/components/ReportManager.js
import React, { useState, useEffect } from 'react';
import {
  getReportConfigurations,
  createReportConfiguration,
  updateReportConfiguration,
  deleteReportConfiguration,
  startReportGeneration,
  getGeneratedReports,
  downloadReport,
  deleteGeneratedReport
} from '../utils/apiConfig';
import './ReportManager.css';

const ReportManager = () => {
  const [configurations, setConfigurations] = useState([]);
  const [generatedReports, setGeneratedReports] = useState([]);
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [configForm, setConfigForm] = useState({
    name: '',
    description: '',
    report_type: 'kpi',
    format: 'pdf',
    include_charts: true,
    date_range: 'last_7_days',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [configs, reports] = await Promise.all([
        getReportConfigurations(),
        getGeneratedReports()
      ]);
      setConfigurations(configs.results);;
      setGeneratedReports(reports.results);;
    } catch (err) {
      setError("Failed to fetch data. Please check your connection.");
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfigSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingConfig) {
        await updateReportConfiguration(editingConfig.id, configForm);
      } else {
        await createReportConfiguration(configForm);
      }
      setShowConfigForm(false);
      setEditingConfig(null);
      setConfigForm({
        name: '',
        description: '',
        report_type: 'kpi',
        format: 'pdf',
        include_charts: true,
        date_range: 'last_7_days',
        start_date: '',
        end_date: ''
      });
      fetchData();
    } catch (err) {
      setError("Failed to save configuration.");
      console.error("Error saving configuration:", err);
    }
  };

  const handleEditConfig = (config) => {
    setEditingConfig(config);
    setConfigForm({
      name: config.name,
      description: config.description,
      report_type: config.report_type,
      format: config.format,
      include_charts: config.include_charts,
      date_range: config.date_range,
      start_date: config.start_date || '',
      end_date: config.end_date || ''
    });
    setShowConfigForm(true);
  };

  const handleGenerateReport = async (configId) => {
    try {
      await startReportGeneration(configId);
      // Refresh reports after a short delay to see the new pending report
      setTimeout(fetchData, 1000);
    } catch (err) {
      setError("Failed to generate report.");
      console.error("Error generating report:", err);
    }
  };

  const handleDownloadReport = async (report) => {
    try {
      const fileBlob = await downloadReport(report.id);
      const url = window.URL.createObjectURL(new Blob([fileBlob]));
      const link = document.createElement('a');
      link.href = url;
      
      // Create a proper file name with extension
      const extension = report.configuration.format === 'md' ? 'md' : report.configuration.format;
      link.setAttribute('download', `${report.configuration.name}.${extension}`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download report.");
      console.error("Error downloading report:", err);
    }
  };

  const handleDeleteReport = async (reportId) => {
    try {
      await deleteGeneratedReport(reportId);
      fetchData();
    } catch (err) {
      setError("Failed to delete report.");
      console.error("Error deleting report:", err);
    }
  };

  const handleDeleteConfig = async (configId) => {
    try {
      await deleteReportConfiguration(configId);
      fetchData();
    } catch (err) {
      setError("Failed to delete configuration.");
      console.error("Error deleting configuration:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="report-manager">
        <div className="loading-state">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="report-manager">
      <div className="report-header">
        <h1>Gestion des Rapports</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowConfigForm(true)}
        >
          + Nouvelle Configuration
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Configuration Form Modal */}
      {showConfigForm && (
        <div className="config-form-overlay">
          <div className="config-form">
            <h3>{editingConfig ? 'Modifier' : 'Nouvelle'} Configuration</h3>
            <form onSubmit={handleConfigSubmit}>
              <div className="form-group">
                <label>Nom du rapport</label>
                <input
                  type="text"
                  value={configForm.name}
                  onChange={(e) => setConfigForm({...configForm, name: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={configForm.description}
                  onChange={(e) => setConfigForm({...configForm, description: e.target.value})}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Type de rapport</label>
                <select
                  value={configForm.report_type}
                  onChange={(e) => setConfigForm({...configForm, report_type: e.target.value})}
                >
                  <option value="kpi">Résumé des KPI</option>
                  <option value="electrical">Métriques Électriques</option>
                  <option value="production">Analyse de Production</option>
                  <option value="consumption">Analyse de Consommation</option>
                  <option value="comprehensive">Rapport Complet</option>
                </select>
              </div>

              <div className="form-group">
                <label>Format</label>
                <select
                  value={configForm.format}
                  onChange={(e) => setConfigForm({...configForm, format: e.target.value})}
                >
                  <option value="pdf">PDF</option>
                  <option value="md">Markdown</option>
                  <option value="csv">CSV</option>
                </select>
              </div>

              <div className="form-group">
                <label>Période</label>
                <select
                  value={configForm.date_range}
                  onChange={(e) => setConfigForm({...configForm, date_range: e.target.value})}
                >
                  <option value="today">Aujourd'hui</option>
                  <option value="yesterday">Hier</option>
                  <option value="last_7_days">7 derniers jours</option>
                  <option value="last_30_days">30 derniers jours</option>
                  <option value="this_month">Ce mois</option>
                  <option value="custom">Personnalisée</option>
                </select>
              </div>

              {configForm.date_range === 'custom' && (
                <div className="date-inputs">
                  <div className="form-group">
                    <label>Date de début</label>
                    <input
                      type="date"
                      value={configForm.start_date}
                      onChange={(e) => setConfigForm({...configForm, start_date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Date de fin</label>
                    <input
                      type="date"
                      value={configForm.end_date}
                      onChange={(e) => setConfigForm({...configForm, end_date: e.target.value})}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={configForm.include_charts}
                    onChange={(e) => setConfigForm({...configForm, include_charts: e.target.checked})}
                  />
                  Inclure les graphiques
                </label>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowConfigForm(false);
                    setEditingConfig(null);
                  }}
                >
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingConfig ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="report-sections">
        {/* Configurations Section */}
        <section>
          <h2>Configurations de Rapport</h2>
          {configurations.length === 0 ? (
            <div className="no-reports-message">
              <p>Aucune configuration de rapport. ✨</p>
              <p>Créez votre première configuration pour commencer.</p>
            </div>
          ) : (
            <div className="configs-grid">
              {configurations.map((config) => (
                <div key={config.id} className="config-card">
                  <div className="config-header">
                    <h4>{config.name}</h4>
                    <div className="config-actions">
                      <button
                        className="btn-icon"
                        onClick={() => handleEditConfig(config)}
                        title="Modifier"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => handleDeleteConfig(config.id)}
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  {config.description && (
                    <p className="config-desc">{config.description}</p>
                  )}
                  
                  <div className="config-details">
                    <span>Type: {config.get_report_type_display || config.report_type}</span>
                    <span>Format: {config.format.toUpperCase()}</span>
                    <span>Période: {config.date_range}</span>
                    <span>Graphiques: {config.include_charts ? 'Oui' : 'Non'}</span>
                  </div>
                  
                  <button
                    className="btn btn-success generate-btn"
                    onClick={() => handleGenerateReport(config.id)}
                  >
                    Générer le rapport
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Generated Reports Section */}
        <section>
          <h2>Rapports Générés</h2>
          {generatedReports.length === 0 ? (
            <div className="no-reports-message">
              <p>Aucun rapport généré. ✨</p>
              <p>Générez un rapport pour le voir apparaître ici.</p>
            </div>
          ) : (
            <div className="reports-table">
              <table>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Type</th>
                    <th>Format</th>
                    <th>Statut</th>
                    <th>Date de génération</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {generatedReports.map((report) => (
                    <tr key={report.id}>
                      <td>{report.configuration.name}</td>
                      <td>{report.configuration.report_type}</td>
                      <td>{report.configuration.format.toUpperCase()}</td>
                      <td>
                        <span className={`status-badge status-${report.status}`}>
                          {report.status}
                        </span>
                      </td>
                      <td>{new Date(report.generated_at).toLocaleString()}</td>
                      <td>
                        {report.status === 'completed' ? (
                          <>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleDownloadReport(report)}
                            >
                              Télécharger
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleDeleteReport(report.id)}
                            >
                              Supprimer
                            </button>
                          </>
                        ) : report.status === 'failed' ? (
                          <span className="error-text">
                            {report.error_message || 'Erreur lors de la génération'}
                          </span>
                        ) : (
                          <span>En cours...</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ReportManager;