import axios, { AxiosInstance } from 'axios';
import { getAnalyticsServiceUrl } from '../config/api';
import { useAuthStore } from '../../stores/authStore';
import { logApiRequest, logApiResponse, logApiError } from '../config/reactotron';
import type {
  AnalyticsHealth,
  MultiMetricReportInput,
  MultiMetricReportResponse,
  TrendAnalysisInput,
  TrendAnalysis,
  LatestMeasurement,
  AnalyticsReport,
  AnalyticsMetric,
} from './analytics-types';

// Extend AxiosRequestConfig to include metadata
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
}

// Cliente axios específico para Analytics (apunta directo al servicio, no al API Gateway)
const analyticsClient: AxiosInstance = axios.create({
  baseURL: getAnalyticsServiceUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor para analytics (igual que el general pero con baseURL diferente)
analyticsClient.interceptors.request.use(
  (config) => {
    const startTime = Date.now();
    config.metadata = { startTime };

    // Log request
    console.log('🌐 [Analytics] API REQUEST:', config.method?.toUpperCase(), `${config.baseURL}${config.url}`);
    console.log('📤 [Analytics] Request Data:', config.data);

    const { tokens } = useAuthStore.getState();
    console.log('🔑 [Analytics] TOKENS IN STORE:', tokens);
    console.log('🔑 [Analytics] ACCESS TOKEN:', tokens?.access_token ? 'EXISTS' : 'MISSING');

    if (tokens?.access_token) {
      config.headers.Authorization = `Bearer ${tokens.access_token}`;
      console.log('🔐 [Analytics] Authorization header set');
    } else {
      console.log('⚠️ [Analytics] No access token available');
    }

    logApiRequest(config.method?.toUpperCase() || 'GET', `${config.baseURL}${config.url}`, config.data);
    return config;
  },
  (error) => {
    logApiError(error.config?.method?.toUpperCase() || 'GET', `${error.config?.baseURL}${error.config?.url}`, error, 0);
    return Promise.reject(error);
  }
);

// Response interceptor para analytics
analyticsClient.interceptors.response.use(
  (response) => {
    const duration = Date.now() - (response.config.metadata?.startTime || 0);
    console.log('✅ [Analytics] API RESPONSE:', response.status, `${response.config.baseURL}${response.config.url}`, `(${duration}ms)`);
    logApiResponse(response.config.method?.toUpperCase() || 'GET', `${response.config.baseURL}${response.config.url}`, response, duration);
    return response;
  },
  (error) => {
    const duration = Date.now() - (error.config?.metadata?.startTime || 0);

    // Debug detallado del error
    console.error('❌ [Analytics] API ERROR DEBUG ==================');
    console.error('Error object:', error);
    console.error('Error has response:', !!error.response);
    console.error('Error has request:', !!error.request);
    console.error('Error has config:', !!error.config);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);

    if (error.response) {
      console.error('Error Response Status:', error.response.status);
      console.error('Error Response Data:', error.response.data);
      console.error('Error Response Headers:', error.response.headers);
    } else if (error.request) {
      console.error('Error Request (no response received):', error.request);
      console.error('This usually means network failure or service not running');
    } else {
      console.error('Error Config:', error.config);
      console.error('This usually means request configuration issue');
    }
    console.error('=================================================');

    console.error('❌ [Analytics] API ERROR:', error.response?.status || 'NETWORK', `${error.config?.baseURL}${error.config?.url}`, `(${duration}ms)`);
    console.error('❌ [Analytics] Error details:', error.message);
    logApiError(error.config?.method?.toUpperCase() || 'GET', `${error.config?.baseURL}${error.config?.url}`, error, duration);
    return Promise.reject(error);
  }
);

const ANALYTICS_BASE = '/api/v1/analytics';

console.log('🔧 [Analytics REST] Base URL:', ANALYTICS_BASE);
console.log('🔧 [Analytics REST] Analytics Service URL:', getAnalyticsServiceUrl());
console.log('🔧 [Analytics REST] Full URL:', getAnalyticsServiceUrl() + ANALYTICS_BASE);

// Función de diagnóstico para probar conectividad
export const testAnalyticsConnectivity = async () => {
  console.log('🔬 [Analytics] DIAGNOSTIC TEST ==================');

  // Test 1: Probar endpoint de analytics health directo
  try {
    console.log('🧪 Test 1: Analytics health endpoint (direct to service)');
    const healthResponse = await analyticsClient.get(`${ANALYTICS_BASE}/health`);
    console.log('✅ Test 1 PASSED - Analytics health works directly');
    console.log('Response status:', healthResponse.status);
    console.log('Response data:', healthResponse.data);
  } catch (error: any) {
    console.error('❌ Test 1 FAILED - Analytics health failed:', error.message);
    console.log('This suggests analytics service is not running or not accessible on port 8000');

    // Debug detallado
    console.error('Full error object:', error);
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received - network issue');
    } else {
      console.error('Request config issue');
    }

    throw error;
  }

  console.log('🎉 [Analytics] All diagnostic tests PASSED');
  console.log('==========================================================');
};

/**
 * GET /api/v1/analytics/metrics
 * Obtiene la lista de métricas soportadas
 */
export const getSupportedMetrics = async (): Promise<string[]> => {
  console.log('📡 [Analytics] GET /metrics');
  const response = await analyticsClient.get<string[]>(`${ANALYTICS_BASE}/metrics`);
  console.log('✅ [Analytics] Metrics:', response.data.length, 'métricas');
  return response.data;
};

/**
 * GET /api/v1/analytics/health
 * Health check del servicio de analytics
 */
export const getAnalyticsHealth = async (): Promise<AnalyticsHealth> => {
  console.log('📡 [Analytics] GET /health ==================');
  const fullUrl = `${ANALYTICS_BASE}/health`;
  console.log('URL:', fullUrl);
  console.log('Full URL:', analyticsClient.defaults.baseURL + fullUrl);
  console.log('==========================================================');

  try {
    const response = await analyticsClient.get(fullUrl);
    console.log('✅ [Analytics] Health success - raw response:', response);
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);

    // Asegurarse de que response.data existe y es un objeto
    if (!response.data) {
      console.warn('Response data is empty, using fallback');
      return {
        status: 'unknown',
        service: 'analytics',
        influxdb: 'unknown',
        influxdbUrl: '',
        timestamp: new Date().toISOString()
      };
    }

    return response.data;
  } catch (error: any) {
    console.error('❌ [Analytics] Health failed ==================');
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No Response Received - Request Details:', error.request);
      console.error('Request URL:', error.config?.url);
      console.error('Request Base URL:', error.config?.baseURL);
      console.error('Full Request URL:', error.config?.baseURL + error.config?.url);
    }
    console.error('=========================================================');

    // En caso de error, devolver datos por defecto en lugar de lanzar error
    console.warn('Returning fallback health data due to error');
    return {
      status: 'error',
      service: 'analytics',
      influxdb: 'unknown',
      influxdbUrl: '',
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * GET /api/v1/analytics/latest/{controller_id}
 * Obtiene la medición más reciente de un controlador (últimos 10 minutos)
 */
export const getLatestMeasurement = async (
  controllerId: string
): Promise<LatestMeasurement> => {
  console.log('📡 [Analytics] GET /latest/' + controllerId);
  const response = await analyticsClient.get<LatestMeasurement>(
    `${ANALYTICS_BASE}/latest/${controllerId}`
  );
  console.log('✅ [Analytics] Latest measurement:', response.data);
  return response.data;
};

/**
 * GET /api/v1/analytics/report/{metric_name}
 * Genera reporte de una métrica específica
 */
export const getSingleMetricReport = async (
  metricName: string,
  params: {
    controller_id: string;
    start_time?: string;
    end_time?: string;
    limit?: number;
  }
): Promise<AnalyticsReport> => {
  console.log('📡 [Analytics] GET /report/' + metricName, params);
  const response = await analyticsClient.get<AnalyticsReport>(
    `${ANALYTICS_BASE}/report/${metricName}`,
    { params }
  );
  console.log('✅ [Analytics] Report:', response.data.metrics.length, 'metrics');
  return response.data;
};

/**
 * POST /api/v1/analytics/multi-report
 * Genera reportes para múltiples métricas
 */
export const getMultiMetricReport = async (
  input: MultiMetricReportInput
): Promise<MultiMetricReportResponse> => {
  // Transformar input a formato REST API
  const body = {
    controller_id: input.controllers[0], // API REST solo acepta un controller
    metrics: input.metrics,
    start_time: input.filters?.startTime,
    end_time: input.filters?.endTime,
    limit: input.filters?.limit,
  };

  const fullUrl = `${ANALYTICS_BASE}/multi-report`;
  console.log('📡 [Analytics] POST /multi-report ==================');
  console.log('URL:', fullUrl);
  console.log('Full URL:', analyticsClient.defaults.baseURL + fullUrl);
  console.log('Body:', JSON.stringify(body, null, 2));
  console.log('==========================================================');

  try {
    const response = await analyticsClient.post<MultiMetricReportResponse>(
      fullUrl,
      body
    );

    console.log('✅ [Analytics] Multi-report success ==================');
    console.log('Status:', response.status);
    console.log('Controller:', response.data.controller_id);
    console.log('Metrics Count:', response.data.metrics.length);
    console.log('Generated At:', response.data.generated_at);
    console.log('Data Points Count:', response.data.data_points_count);
    console.log('==========================================================');

    return response.data;
  } catch (error: any) {
    console.error('❌ [Analytics] Multi-report failed ==================');
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    console.error('Error Name:', error.name);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Status Text:', error.response.statusText);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No Response Received - Request Details:', error.request);
      console.error('Request URL:', error.config?.url);
      console.error('Request Base URL:', error.config?.baseURL);
      console.error('Full Request URL:', error.config?.baseURL + error.config?.url);

      console.log('🔍 [Analytics] Comparing with working request...');
      console.log('Working request would be:', `${analyticsClient.defaults.baseURL}${ANALYTICS_BASE}/health`);
      console.log('Failing request is:', `${error.config?.baseURL}${error.config?.url}`);
    } else {
      console.error('Error Config:', error.config);
    }
    console.error('=========================================================');
    throw error;
  }
};

/**
 * GET /api/v1/analytics/trends/{metric_name}
 * Análisis de tendencias con datos históricos agregados
 */
export const getTrendAnalysis = async (
  input: TrendAnalysisInput
): Promise<TrendAnalysis> => {
  const params = {
    controller_id: input.controllerId,
    start_time: input.startTime,
    end_time: input.endTime,
    interval: input.interval,
  };

  console.log('📡 [Analytics] GET /trends/' + input.metricName, params);

  const response = await analyticsClient.get<TrendAnalysis>(
    `${ANALYTICS_BASE}/trends/${input.metricName}`,
    { params }
  );

  console.log('✅ [Analytics] Trend analysis:', response.data.dataPoints.length, 'points');
  return response.data;
};

/**
 * GET /api/v1/analytics/historical
 * Consulta datos históricos con filtros avanzados
 */
export const getHistoricalData = async (params: {
  start_time: string;
  end_time: string;
  controller_id?: string;
  sensor_id?: string;
  parameter?: string;
  limit?: number;
}): Promise<any> => {
  console.log('📡 [Analytics] GET /historical', params);
  const response = await analyticsClient.get(`${ANALYTICS_BASE}/historical`, { params });
  console.log('✅ [Analytics] Historical data:', response.data);
  return response.data;
};

/**
 * GET /api/v1/analytics/historical/averages
 * Consulta datos históricos promediados por intervalos
 */
export const getHistoricalAverages = async (params: {
  average_interval: number;
  start_time: string;
  end_time: string;
  controller_id?: string;
  sensor_id?: string;
  parameter?: string;
}): Promise<any> => {
  console.log('📡 [Analytics] GET /historical/averages', params);
  const response = await analyticsClient.get(`${ANALYTICS_BASE}/historical/averages`, { params });
  console.log('✅ [Analytics] Historical averages:', response.data);
  return response.data;
};

console.log('✅ [Analytics REST] Servicio inicializado correctamente');

