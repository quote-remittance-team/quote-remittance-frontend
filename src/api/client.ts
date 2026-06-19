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

// Request Interceptor (Attach Token Safely)
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);

    // Diagnostic log to catch token presence before transmission
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      console.warn(`🔒 Sending request to ${config.url} WITHOUT an accessToken in localStorage.`);
    }

    return config;
  },
  (error) => {
    console.error('❌ Request configuration error:', error);
    return Promise.reject(error);
  },
);

// Response Interceptor (Handle Errors & Protect Storage Context)
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<unknown>) => {
    if (!error.response) {
      console.error('🛑 Network/CORS Error: The server could not be reached or request was blocked by browser.');
      return Promise.reject(error);
    }

    const { status, config } = error.response;
    
    // 🚨 GIANT LOG WARNING: Pinpoints the exact URL and status breaking your flow
    console.error(`⚠️ Network Interceptor caught Error Status [${status}] on Route: [${config.method?.toUpperCase()}] ${config.url}`);

    if (status === 401) {
      console.error("❌ 401 Unauthorized detected! Token is invalid or expired. Purging session keys.");
      
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(USER_ID_KEY);
      navigateTo('/login');

      return Promise.reject(new Error('Unauthorized - Session Closed'));
    }

    if (status === 403) {
      console.warn(
        "🛡️ 403 Forbidden detected! Access denied or filter gate blocked request. " +
        "CRITICAL: We are NOT clearing localStorage so payment/checkout variables are preserved."
      );
      // Let the error flow safely to the page catch block without resetting the app state
    }

    return Promise.reject(error);
  },
);

export const remittanceService = {
  /**
   * Sends the Paystack transaction reference string to the Spring Boot backend
   * for payment validation and complete database table mapping insertion.
   * @param reference The raw trxref/reference token extracted from the callback URL
   */
  verifyPayment: async (reference: string) => {
  
    const response = await api.get(`/remittances/verify/${reference}`);
    return response.data; 
  }
};