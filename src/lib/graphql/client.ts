import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getApiUrl } from '../config/api';

// GraphQL endpoint - apunta al API Gateway
const GRAPHQL_ENDPOINT = `${getApiUrl()}/graphql/analytics`;

const httpLink = createHttpLink({
  uri: GRAPHQL_ENDPOINT,
});

const authLink = setContext((_, { headers }) => {
  // Obtener token del AsyncStorage directamente para evitar dependencia circular
  return new Promise((resolve) => {
    import('@react-native-async-storage/async-storage').then((AsyncStorage) => {
      AsyncStorage.default.getItem('auth-tokens').then((tokens) => {
        const parsedTokens = tokens ? JSON.parse(tokens) : null;
        const token = parsedTokens?.access_token;
        
        resolve({
          headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : "",
          }
        });
      });
    });
  });
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

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
