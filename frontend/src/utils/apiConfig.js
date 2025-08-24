// src/utils/apiConfig.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

// --- Token management ---
export const getToken = () => localStorage.getItem('accessToken');
export const getRefreshToken = () => localStorage.getItem('refreshToken');

export const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem('accessToken', accessToken);
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
};

export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

// --- Axios instance ---
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: refreshToken,
          });

          const newAccessToken = response.data.access;
          setTokens(newAccessToken, refreshToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          clearTokens();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        clearTokens();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// --- Authentication functions ---
export const login = async (username, password) => {
  try {
    const response = await apiClient.post('/token/', { username, password });
    const { access, refresh } = response.data;
    setTokens(access, refresh);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error.response?.data?.detail || 'Erreur de connexion',
    };
  }
};

export const logout = () => clearTokens();

// --- Dashboard Data fetching ---
export const fetchKPIs = async (startDate = '', endDate = '') => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const url = `/metrics/${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    throw new Error(error.response?.data?.error || 'Erreur lors du chargement des KPIs');
  }
};

// --- Time series data fetching ---
export const fetchTimeSeriesData = async (startDate = '', endDate = '', limit = 1000) => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('timestamp__gte', startDate);
    if (endDate) params.append('timestamp__lte', endDate);
    params.append('limit', limit.toString());
    params.append('ordering', 'timestamp');

    const response = await apiClient.get(`/ingestion/data/?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching time series data:', error);
    throw new Error('Erreur lors du chargement des données temporelles');
  }
};

// --- CSV Upload ---
export const uploadCSV = async (file, delimiter = ',') => {
  try {
    const formData = new FormData();
    formData.append('csv_file', file);
    formData.append('delimiter', delimiter);

    const response = await apiClient.post('/ingestion/upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
    return response.data;
  } catch (error) {
    console.error('CSV upload error:', error);
    throw new Error(error.response?.data?.error || "Erreur lors de l'upload du fichier CSV");
  }
};

// --- Task Status ---
export const checkTaskStatus = async (taskId) => {
  try {
    const response = await apiClient.get(`/ingestion/tasks/${taskId}/`);
    return response.data;
  } catch (error) {
    console.error('Error checking task status:', error);
    if (error.response) {
      throw new Error(error.response.data.error || 'Erreur lors de la vérification du statut de la tâche');
    } else if (error.request) {
      throw new Error('Aucune réponse du serveur. Vérifiez votre connexion.');
    } else {
      throw new Error('Erreur lors de la requête.');
    }
  }
};

// --- Data management ---
export const deleteData = async (startDate = '', endDate = '') => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const response = await apiClient.delete(`/ingestion/data/bulk-delete/${params.toString() ? `?${params.toString()}` : ''}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting data:', error);
    throw new Error(error.response?.data?.error || 'Erreur lors de la suppression des données');
  }
};

// --- Report Management APIs ---
export const getReportConfigurations = async () => {
  try {
    const response = await apiClient.get('/configurations/');
    return response.data;
  } catch (error) {
    console.error('Error fetching report configurations:', error);
    throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des configurations');
  }
};

export const createReportConfiguration = async (configData) => {
  try {
    const response = await apiClient.post('/configurations/', configData);
    return response.data;
  } catch (error) {
    console.error('Error creating report configuration:', error);
    throw new Error(error.response?.data?.error || 'Erreur lors de la création de la configuration');
  }
};

export const updateReportConfiguration = async (configId, configData) => {
  try {
    const response = await apiClient.put(`/configurations/${configId}/`, configData);
    return response.data;
  } catch (error) {
    console.error('Error updating report configuration:', error);
    throw new Error(error.response?.data?.error || 'Erreur lors de la mise à jour de la configuration');
  }
};

export const deleteReportConfiguration = async (configId) => {
  try {
    await apiClient.delete(`/configurations/${configId}/`);
  } catch (error) {
    console.error('Error deleting report configuration:', error);
    throw new Error(error.response?.data?.error || 'Erreur lors de la suppression de la configuration');
  }
};

export const startReportGeneration = async (configId) => {
  try {
    const response = await apiClient.post('/generate/', { config_id: configId });
    return response.data;
  } catch (error) {
    console.error('Error starting report generation:', error);
    throw new Error(error.response?.data?.error || 'Erreur lors du démarrage de la génération du rapport');
  }
};

export const getGeneratedReports = async () => {
  try {
    const response = await apiClient.get('/reports/generated/');
    return response.data;
  } catch (error) {
    console.error('Error fetching generated reports:', error);
    throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des rapports générés');
  }
};

export const getGeneratedReport = async (reportId) => {
  try {
    const response = await apiClient.get(`/reports/${reportId}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching generated report:', error);
    throw new Error(error.response?.data?.error || 'Erreur lors de la récupération du rapport');
  }
};

export const deleteGeneratedReport = async (reportId) => {
  try {
    await apiClient.delete(`/reports/${reportId}/`);
  } catch (error) {
    console.error('Error deleting generated report:', error);
    throw new Error(error.response?.data?.error || 'Erreur lors de la suppression du rapport');
  }
};

// Updated download function to match your URL pattern
export const downloadReport = async (reportId, report_type, format_type) => {
  try {
    const response = await apiClient.get(
      `/download/${report_type}/${format_type}/?report_id=${reportId}`, 
      {
        responseType: 'blob',
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};