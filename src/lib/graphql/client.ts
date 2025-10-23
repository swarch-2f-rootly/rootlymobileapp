import { ApolloClient, InMemoryCache, ApolloLink, Observable } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { print } from 'graphql';
import apiClient from '../api/client';

// PATH relativo para GraphQL (apiClient ya tiene baseURL configurado)
const GRAPHQL_PATH = '/api/v1/graphql';

console.log('🔧 [GraphQL] Path configurado:', GRAPHQL_PATH);

// Custom HTTP Link usando el MISMO apiClient que funciona para REST
const httpLink = new ApolloLink((operation) => {
  return new Observable((observer) => {
    // Construir el body EXACTAMENTE como en el curl
    const body = {
      query: print(operation.query),
      variables: operation.variables,
    };
    
    console.log('🌐 [GraphQL HTTP Link] ==========================================');
    console.log('Operation:', operation.operationName);
    console.log('Path:', GRAPHQL_PATH);
    console.log('Body (first 500 chars):', JSON.stringify(body).substring(0, 500) + '...');
    console.log('Usando apiClient con baseURL ya configurado');
    console.log('=================================================================');

    // Usar el MISMO apiClient que ya funciona para todas las peticiones REST
    // Pasar solo el PATH porque apiClient ya tiene baseURL
    apiClient.post(GRAPHQL_PATH, body)
      .then((response) => {
        console.log('📡 [GraphQL Response] ==========================================');
        console.log('Operation:', operation.operationName);
        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);
        console.log('Has Data:', !!response.data);
        console.log('Has Errors:', !!response.data?.errors);
        
        // Log de la respuesta completa
        const dataStr = JSON.stringify(response.data, null, 2);
        console.log('Response Data (length):', dataStr.length);
        console.log('Response Data (preview):', dataStr.substring(0, 1000));
        
        // Si hay datos de métricas, mostrarlos
        if (response.data?.data?.getMultiMetricReport) {
          const report = response.data.data.getMultiMetricReport;
          console.log('🎉 DATOS RECIBIDOS:');
          console.log('  - Total Controllers:', report.totalControllers);
          console.log('  - Total Metrics:', report.totalMetrics);
          console.log('  - Reports:', report.reports?.length || 0);
          if (report.reports?.length > 0) {
            console.log('  - Controller ID:', report.reports[0].controllerId);
            console.log('  - Data Points:', report.reports[0].dataPointsCount);
            console.log('  - Metrics Count:', report.reports[0].metrics?.length || 0);
          }
        }
        
        console.log('=================================================================');
        
        observer.next(response.data);
        observer.complete();
      })
      .catch((error) => {
        console.error('❌ [GraphQL Error] ==========================================');
        console.error('Operation:', operation.operationName);
        console.error('Message:', error.message);
        console.error('Code:', error.code);
        if (error.response) {
          console.error('Response Status:', error.response.status);
          console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
        } else {
          console.error('No response from server');
        }
        console.error('=================================================================');
        observer.error(error);
      });
  });
});

// Link para errores GraphQL
const errorLink = onError((errorResponse: any) => {
  const { graphQLErrors, networkError, operation } = errorResponse;
  
  if (graphQLErrors) {
    graphQLErrors.forEach((error: any) => {
      console.error('🔴 [GraphQL Error] ==========================================');
      console.error('Operation:', operation.operationName);
      console.error('Message:', error.message);
      console.error('Locations:', error.locations);
      console.error('Path:', error.path);
      console.error('=================================================================');
    });
  }

  if (networkError) {
    console.error('🔴 [GraphQL Network Error] ==========================================');
    console.error('Operation:', operation.operationName);
    console.error('Error:', networkError);
    console.error('Message:', networkError.message);
    console.error('=================================================================');
  }
});

// NO necesitamos authLink ni loggingLink porque apiClient YA tiene:
// - Request interceptor que agrega el token automáticamente
// - Response interceptor que maneja refresh token
// - Logs completos de todas las peticiones

export const apolloClient = new ApolloClient({
  link: errorLink.concat(httpLink),
  cache: new InMemoryCache(),
});

console.log('✅ [GraphQL] Apollo Client inicializado correctamente');

// Helper function to create query keys for React Query
export const queryKeys = {
  // Analytics queries
  analytics: () => ['graphql', 'analytics'] as const,
  supportedMetrics: () => ['graphql', 'analytics', 'supported-metrics'] as const,
  analyticsHealth: () => ['graphql', 'analytics', 'health'] as const,
  singleMetricReport: (metricName: string, controllerId: string, filters?: any) =>
    ['graphql', 'analytics', 'single-metric', metricName, controllerId, filters] as const,
  multiMetricReport: (controllers: string[], metrics: string[], filters?: any) =>
    ['graphql', 'analytics', 'multi-metric', controllers.sort().join(','), metrics.sort().join(','), filters] as const,
  trendAnalysis: (metricName: string, controllerId: string, startTime: string, endTime: string, interval: string) =>
    ['graphql', 'analytics', 'trend', metricName, controllerId, startTime, endTime, interval] as const,
};
