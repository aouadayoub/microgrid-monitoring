// src/utils/apiConfig.js

import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

// Token management
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
            refresh: refreshToken
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

// Authentication functions
export const login = async (username, password) => {
  try {
    const response = await apiClient.post('/token/', {
      username,
      password
    });
    
    const { access, refresh } = response.data;
    setTokens(access, refresh);
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Login error:', error);
    return { 
      success: false, 
      error: error.response?.data?.detail || 'Erreur de connexion' 
    };
  }
};

export const logout = () => {
  clearTokens();
};

// KPI Data fetching
export const fetchKPIs = async (startDate = '', endDate = '') => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const url = `/metrics/${params.toString() ? `?${params.toString()}` : ''}`;
    console.log('Fetching KPIs from:', url);
    
    const response = await apiClient.get(url);
    console.log('KPI response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    throw new Error(error.response?.data?.error || 'Erreur lors du chargement des KPIs');
  }
};

// Time series data fetching
export const fetchTimeSeriesData = async (startDate = '', endDate = '', limit = 1000) => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('timestamp__gte', startDate);
    if (endDate) params.append('timestamp__lte', endDate);
    params.append('limit', limit.toString());
    params.append('ordering', 'timestamp');
    
    const url = `/ingestion/data/?${params.toString()}`;
    console.log('Fetching time series from:', url);
    
    const response = await apiClient.get(url);
    console.log('Time series response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching time series data:', error);
    throw new Error('Erreur lors du chargement des données temporelles');
  }
};

// CSV Upload functions
export const uploadCSV = async (file, delimiter = ',') => {
  try {
    const formData = new FormData();
    formData.append('csv_file', file);
    formData.append('delimiter', delimiter);
    
    console.log('Uploading CSV:', file.name);
    
    const response = await apiClient.post('/ingestion/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 60000 // 60 seconds timeout
    });
    
    console.log('Upload response:', response.data);
    return response.data;
  } catch (error) {
    console.error('CSV upload error:', error);
    throw new Error(error.response?.data?.error || 'Erreur lors de l\'upload du fichier CSV');
  }
};

// Task status checking - Enhanced error handling
export const checkTaskStatus = async (taskId) => {
  try {
    console.log('Checking task status for:', taskId);
    
    const response = await apiClient.get(`/ingestion/tasks/${taskId}/`);
    console.log('Task status response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error checking task status:', error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error data:', error.response.data);
      console.error('Error status:', error.response.status);
      console.error('Error headers:', error.response.headers);
      throw new Error(error.response.data.error || 'Erreur lors de la vérification du statut de la tâche');
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error request:', error.request);
      throw new Error('Aucune réponse du serveur. Vérifiez votre connexion.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
      throw new Error('Erreur lors de la requête.');
    }
  }
};

// Data management functions
export const deleteData = async (startDate = '', endDate = '') => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const url = `/ingestion/data/bulk-delete/${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await apiClient.delete(url);
    return response.data;
  } catch (error) {
    console.error('Error deleting data:', error);
    throw new Error(error.response?.data?.error || 'Erreur lors de la suppression des données');
  }
};

export default apiClient;