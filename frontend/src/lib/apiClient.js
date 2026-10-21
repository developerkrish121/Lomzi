import axios from 'axios';
import { env } from '@/config/env';

export const apiClient = axios.create({
  baseURL: env.VITE_API_URL,
  timeout: 10_000,
  withCredentials: true,
  headers: { Accept: 'application/json' },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('quickbasket:unauthorized'));
    }
    return Promise.reject(error);
  },
);
