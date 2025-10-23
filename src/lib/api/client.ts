import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { getApiUrl } from '../config/api';
import { useAuthStore } from '../../stores/authStore';
import { logApiRequest, logApiResponse, logApiError } from '../config/reactotron';

// Extend AxiosRequestConfig to include metadata
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: getApiUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and log requests
apiClient.interceptors.request.use(
  (config) => {
    const startTime = Date.now();
    config.metadata = { startTime };

    // Log request
    console.log('🌐 API REQUEST:', config.method?.toUpperCase(), `${config.baseURL}${config.url}`);
    console.log('📤 Request Data:', config.data);

    const { tokens } = useAuthStore.getState();
    console.log('🔑 TOKENS IN STORE:', tokens);
    console.log('🔑 ACCESS TOKEN:', tokens?.access_token ? 'EXISTS' : 'MISSING');

    if (tokens?.access_token) {
      // Try different authorization header formats
      const token = tokens.access_token;
      console.log('🔐 TOKEN LENGTH:', token.length);
      console.log('🔐 TOKEN START:', token.substring(0, 50));

      // Check if JWT is valid
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          console.log('🔐 JWT PAYLOAD:', payload);
          console.log('🔐 JWT EXP:', new Date(payload.exp * 1000));
          console.log('🔐 JWT NOW:', new Date());
          console.log('🔐 JWT VALID:', payload.exp * 1000 > Date.now());
        } else {
          console.log('🔐 JWT FORMAT INVALID - not 3 parts');
        }
      } catch (e) {
        console.log('🔐 JWT PARSE ERROR:', e);
      }

      // Try different header formats
      config.headers.authorization = `Bearer ${token}`;
      console.log('🔐 REQUEST HEADERS:', config.headers);
    } else {
      console.log('⚠️  NO AUTH TOKEN - REQUEST WILL FAIL');
    }

    logApiRequest(
      config.method?.toUpperCase() || 'UNKNOWN',
      `${config.baseURL}${config.url}`,
      config.data
    );
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and log responses
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const duration = Date.now() - (response.config.metadata?.startTime || 0);

    // Log successful response
    console.log('✅ API RESPONSE:', response.config.method?.toUpperCase(), `${response.config.baseURL}${response.config.url}`, `(${duration}ms)`);
    console.log('📥 Response Status:', response.status);
    console.log('📥 Response Headers:', response.headers);
    console.log('📥 Response Data:', response.data);

    logApiResponse(
      response.config.method?.toUpperCase() || 'UNKNOWN',
      `${response.config.baseURL}${response.config.url}`,
      response,
      duration
    );

    return response;
  },
  async (error: AxiosError) => {
    const duration = Date.now() - (error.config?.metadata?.startTime || 0);

    // Log error
    console.error('❌ API ERROR:', error.config?.method?.toUpperCase(), `${error.config?.baseURL}${error.config?.url}`, `(${duration}ms)`);
    console.error('🚨 Error Details:', error.response?.data || error.message);

    logApiError(
      error.config?.method?.toUpperCase() || 'UNKNOWN',
      `${error.config?.baseURL}${error.config?.url}`,
      error,
      duration
    );

    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        await useAuthStore.getState().refreshToken();

        // Retry the original request with new token
        const { tokens } = useAuthStore.getState();
        if (tokens?.access_token && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${tokens.access_token}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        await useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
