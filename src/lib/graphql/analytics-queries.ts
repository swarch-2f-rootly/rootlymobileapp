import { gql } from '@apollo/client';
import { useQuery } from '@tanstack/react-query';
import { apolloClient } from './client';

// GraphQL Queries para Analytics (iguales al frontend web)
export const GET_SUPPORTED_METRICS = gql`
  query GetSupportedMetrics {
    getSupportedMetrics
  }
`;

export const GET_ANALYTICS_HEALTH = gql`
  query GetAnalyticsHealth {
    getAnalyticsHealth {
      status
      service
      influxdb
      influxdbUrl
      timestamp
    }
  }
`;

export const GET_SINGLE_METRIC_REPORT = gql`
  query GetSingleMetricReport(
    $metricName: String!
    $controllerId: String!
    $filters: AnalyticsFilterInput
  ) {
    getSingleMetricReport(
      metricName: $metricName
      controllerId: $controllerId
      filters: $filters
    ) {
      controllerId
      generatedAt
      dataPointsCount
      metrics {
        metricName
        value
        unit
        calculatedAt
        controllerId
        description
      }
    }
  }
`;

export const GET_MULTI_METRIC_REPORT = gql`
  query GetMultiMetricReport($input: MultiMetricReportInput!) {
    getMultiMetricReport(input: $input) {
      generatedAt
      totalControllers
      totalMetrics
      reports {
        controllerId
        dataPointsCount
        generatedAt
        metrics {
          metricName
          value
          unit
          calculatedAt
          controllerId
          description
        }
      }
    }
  }
`;

export const GET_TREND_ANALYSIS = gql`
  query GetTrendAnalysis($input: TrendAnalysisInput!) {
    getTrendAnalysis(input: $input) {
      metricName
      controllerId
      interval
      generatedAt
      totalPoints
      averageValue
      minValue
      maxValue
      dataPoints {
        timestamp
        value
        interval
      }
    }
  }
`;

// React Hooks que integran con TanStack Query
export function useSupportedMetrics() {
  return useQuery({
    queryKey: ['analytics', 'supported-metrics'],
    queryFn: async () => {
      const result = await apolloClient.query({
        query: GET_SUPPORTED_METRICS,
      });
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function useAnalyticsHealth() {
  return useQuery({
    queryKey: ['analytics', 'health'],
    queryFn: async () => {
      try {
        const result = await apolloClient.query({
          query: GET_ANALYTICS_HEALTH,
        });
        return result.data;
      } catch (error) {
        console.warn('GraphQL query failed, returning empty data:', error);
        // Return empty data instead of throwing to prevent app crashes
        return { getAnalyticsHealth: { status: 'unknown', service: 'unknown', influxdb: 'unknown', influxdbUrl: '', timestamp: new Date().toISOString() } };
      }
    },
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 60 * 1000, // Refetch cada minuto
  });
}

export function useSingleMetricReport(
  metricName: string,
  controllerId: string,
  filters?: any
) {
  const queryKey = ['analytics', 'single-metric', metricName, controllerId, filters].filter(Boolean);

  return useQuery({
    queryKey,
    queryFn: async () => {
      const result = await apolloClient.query({
        query: GET_SINGLE_METRIC_REPORT,
        variables: { metricName, controllerId, filters },
      });
      return result.data;
    },
    enabled: !!metricName && !!controllerId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

export function useMultiMetricReport(input: any, options?: { enabled?: boolean }) {
  const queryKey = [
    'analytics',
    'multi-metric',
    input.controllers?.sort().join(','),
    input.metrics?.sort().join(','),
    input.filters
  ].filter(Boolean);

  const enabled = (input.controllers?.length >= 0 && input.metrics?.length > 0) && (options?.enabled !== false);

  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const result = await apolloClient.query({
          query: GET_MULTI_METRIC_REPORT,
          variables: { input },
        });
        return result.data;
      } catch (error) {
        console.warn('GraphQL multi metric query failed, returning empty data:', error);
        // Return empty data instead of throwing to prevent app crashes
        return { getMultiMetricReport: { generatedAt: new Date().toISOString(), totalControllers: 0, totalMetrics: 0, reports: [] } };
      }
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: false, // NO refetch automático
    refetchOnWindowFocus: false, // NO refetch al enfocar ventana
    refetchOnReconnect: false, // NO refetch al reconectar
  });
}

export function useTrendAnalysis(input: any) {
  const queryKey = [
    'analytics',
    'trend',
    input.metricName,
    input.controllerId,
    input.startTime,
    input.endTime,
    input.interval
  ].filter(Boolean);

  return useQuery({
    queryKey,
    queryFn: async () => {
      const result = await apolloClient.query({
        query: GET_TREND_ANALYSIS,
        variables: { input },
      });
      return result.data;
    },
    enabled: !!input.metricName && !!input.controllerId && !!input.startTime && !!input.endTime,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
