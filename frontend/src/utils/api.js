import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || '';
const baseURL = rawApiUrl 
  ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`) 
  : '/api';

// Initialize configured Axios instance
const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach isolated admin Bearer tokens if present in localStorage
api.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: Date.now() };
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for clean error feedback handling and response time logging
api.interceptors.response.use(
  (response) => {
    if (response.config?.metadata?.startTime) {
      const duration = Date.now() - response.config.metadata.startTime;
      console.log(`[API Response] ${response.config.method.toUpperCase()} ${response.config.url} took ${duration}ms`);
    }
    return response.data;
  },
  (error) => {
    if (error.config?.metadata?.startTime) {
      const duration = Date.now() - error.config.metadata.startTime;
      console.error(`[API Error] ${error.config.method.toUpperCase()} ${error.config.url} took ${duration}ms - Error: ${error.message}`);
    }
    const message = error.response?.data?.message || 'Something went wrong. Please try again.';
    const status = error.response?.status;

    // Suppress logging expected 401 Unauthorized codes (e.g. guest users / expired sessions)
    if (status !== 401) {
      console.error(`[API Client Error]:`, message);
    }
    
    return Promise.reject(new Error(message));
  }
);

export default api;
