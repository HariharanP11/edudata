// edudata-frontend/src/services/api.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10);

const apiClient: AxiosInstance = axios.create({ baseURL: API_BASE_URL, timeout: API_TIMEOUT, headers: { 'Content-Type': 'application/json' } });

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = (config.headers || {}) as InternalAxiosRequestConfig['headers'];
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  } catch (e) {}
  return config;
}, (err) => Promise.reject(err));

apiClient.interceptors.response.use((res: AxiosResponse) => res, (err) => {
  if (err?.response?.status === 401) {
    try { localStorage.removeItem('token'); localStorage.removeItem('user'); localStorage.removeItem('isAuthenticated'); } catch (e){}
    if (typeof window !== 'undefined') window.location.href = '/login';
  }
  return Promise.reject(err);
});

export const apiService = {
  get: async <T = any>(url: string, cfg?: AxiosRequestConfig): Promise<T> => (await apiClient.get(url, cfg)).data as T,
  post: async <T = any>(url: string, data?: any, cfg?: AxiosRequestConfig): Promise<T> => (await apiClient.post(url, data, cfg)).data as T,
  put: async <T = any>(url: string, data?: any, cfg?: AxiosRequestConfig): Promise<T> => (await apiClient.put(url, data, cfg)).data as T,
  delete: async <T = any>(url: string, cfg?: AxiosRequestConfig): Promise<T> => (await apiClient.delete(url, cfg)).data as T,
  patch: async <T = any>(url: string, data?: any, cfg?: AxiosRequestConfig): Promise<T> => (await apiClient.patch(url, data, cfg)).data as T,
};

export default apiClient;
