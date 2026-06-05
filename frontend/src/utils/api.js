import axios from 'axios';

// Initialize configured Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach isolated admin Bearer tokens if present in localStorage
api.interceptors.request.use(
  (config) => {
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

// Response interceptor for clean error feedback handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
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
