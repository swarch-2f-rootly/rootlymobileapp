// Centralized API configuration for React Native
// Note: For Android emulator, use 10.0.2.2 instead of localhost
// For physical devices, use your computer's local IP address (e.g., 192.168.x.x)
export const API_CONFIG = {
  // API Gateway URL - single point of entry for all services
  // For Android emulator, use the host machine's actual IP address
  // This ensures the server recognizes requests as coming from the same origin
  GATEWAY_URL: __DEV__
    ? 'http://192.168.1.10:8080'  // Host machine IP - Android emulator
    : (process.env.API_GATEWAY_URL || 'http://localhost:8080'),
} as const;

// Helper function to get the API Gateway URL
export const getApiUrl = () => {
  return API_CONFIG.GATEWAY_URL;
};

// GraphQL endpoint
export const GRAPHQL_ENDPOINT = `${API_CONFIG.GATEWAY_URL}/graphql`;

// API endpoints relative to gateway
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH: '/api/v1/auth/refresh',
    PROFILE: '/api/v1/auth/profile',
  },
  PLANTS: {
    LIST: '/api/v1/plants',
    DETAIL: '/api/v1/plants',
    CREATE: '/api/v1/plants',
    UPDATE: '/api/v1/plants',
    DELETE: '/api/v1/plants',
  },
  DEVICES: {
    LIST: '/api/v1/devices',
    DETAIL: '/api/v1/devices',
    CREATE: '/api/v1/devices',
    UPDATE: '/api/v1/devices',
    DELETE: '/api/v1/devices',
  },
} as const;
