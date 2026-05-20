import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { navigateTo } from '../utils/navigation';

// Constants
export const ACCESS_TOKEN_KEY = 'accessToken';
export const USER_ID_KEY = 'userId';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Axios Instance
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor (Attach Token)
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor (Handle Errors)
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<unknown>) => {
    if (!error.response) {
      console.error('Network error');
      return Promise.reject(error);
    }

    const { status } = error.response;

    if (status === 401  || status === 403) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(USER_ID_KEY);

      // NOTE: Replace later with state-based logout if using Redux/Zustand
      navigateTo('/login');

      return Promise.reject(new Error('Unauthorized'));
    }

    return Promise.reject(error);
  },
);
