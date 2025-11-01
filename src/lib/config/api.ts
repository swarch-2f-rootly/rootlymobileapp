// Centralized API configuration for React Native
// Note: For Android emulator, use 10.0.2.2 instead of localhost
// For physical devices, use your computer's local IP address (e.g., 192.168.x.x)

// Access env from globalThis to avoid Node types in RN
const ENV: Record<string, string | undefined> = (globalThis as any) || {};

export const API_CONFIG = {
  // API Gateway URL - single point of entry for all services
  // For Android emulator, use 10.0.2.2 to access host machine
  GATEWAY_URL: (ENV as any).API_GATEWAY_URL || 'http://10.156.62.6:8080',
  // Direct Plant Management Service URL (used for binary/image endpoints)
  PLANT_SERVICE_URL: (ENV as any).PLANT_SERVICE_URL || deriveServiceUrlFromGatewayPort('http://10.156.62.6:8080', 8003),
} as const;

// Helper function to get the API Gateway URL
export const getApiUrl = () => {
  return API_CONFIG.GATEWAY_URL;
};

// Helper to get Plant service base URL (bypasses gateway for images)
export const getPlantServiceUrl = () => {
  return API_CONFIG.PLANT_SERVICE_URL;
};

// Helper to get Analytics service base URL (bypasses gateway)
export const getAnalyticsServiceUrl = () => {
  return API_CONFIG.GATEWAY_URL;
};

// GraphQL endpoint - YA NO SE USA (migrado a REST HTTP)
// export const GRAPHQL_ENDPOINT = `${API_CONFIG.GATEWAY_URL}/api/v1/graphql`;

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

// Local helpers
function deriveServiceUrlFromGatewayPort(gatewayUrl: string, port: number): string {
  try {
    // Parse minimally to avoid depending on URL typings
    const match = gatewayUrl.match(/^(https?:)\/\/(.*?)(?::(\d+))?(\/|$)/i);
    if (!match) return `http://10.0.2.2:${port}`;
    const protocol = match[1];
    const host = match[2];
    return `${protocol}//${host}:${port}`;
  } catch {
    return `http://10.0.2.2:${port}`;
  }
}
