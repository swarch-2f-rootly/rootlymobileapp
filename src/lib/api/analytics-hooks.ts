import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getSupportedMetrics,
  getAnalyticsHealth,
  getLatestMeasurement,
  getSingleMetricReport,
  getMultiMetricReport,
  getTrendAnalysis,
} from './analytics';
import type { MultiMetricReportInput, TrendAnalysisInput } from './analytics-types';

// React Hooks que integran con TanStack Query usando REST HTTP

export function useSupportedMetrics() {
  return useQuery({
    queryKey: ['analytics', 'supported-metrics'],
    queryFn: getSupportedMetrics,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function useAnalyticsHealth() {
  return useQuery({
    queryKey: ['analytics', 'health'],
    queryFn: async () => {
      console.log('🏥 [useAnalyticsHealth] Starting health check...');
      const result = await getAnalyticsHealth();
      console.log('🏥 [useAnalyticsHealth] Health check completed:', result);
      return result;
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
    queryFn: () => getSingleMetricReport(metricName, {
      controller_id: controllerId,
      start_time: filters?.startTime,
      end_time: filters?.endTime,
      limit: filters?.limit,
    }),
    enabled: !!metricName && !!controllerId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

export function useMultiMetricReport(input: MultiMetricReportInput, options?: { enabled?: boolean }) {
  const queryKey = [
    'analytics',
    'multi-metric',
    input.controllers?.sort().join(','),
    input.metrics?.sort().join(','),
    input.filters
  ].filter(Boolean);

  const enabled = (input.controllers?.length > 0 && input.metrics?.length > 0) && (options?.enabled !== false);

  console.log('🔍 [useMultiMetricReport] Hook ejecutado', {
    enabled,
    controllersCount: input.controllers?.length || 0,
    controllers: input.controllers,
    metrics: input.metrics,
    filters: input.filters,
  });

  return useQuery({
    queryKey,
    queryFn: async () => {
      console.log('⚡ [useMultiMetricReport] Ejecutando REST API...');
      
      try {
        const result = await getMultiMetricReport(input);
        
        console.log('✅ [useMultiMetricReport] Success ==================');
        console.log('Controller ID:', result.controller_id);
        console.log('Metrics Count:', result.metrics.length);
        console.log('Data Points:', result.data_points_count);
        console.log('==========================================================');
        
        return result;
      } catch (error) {
        console.error('❌ [useMultiMetricReport] Failed:', error);
        // Return empty data structure matching the actual API response format
        return {
          controller_id: '',
          metrics: [],
          generated_at: new Date().toISOString(),
          data_points_count: 0,
          filters_applied: {
            start_time: null,
            end_time: null,
            limit: null,
          }
        };
      }
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useTrendAnalysis(input: TrendAnalysisInput) {
  const queryKey = [
    'analytics',
    'trend',
    input.metricName,
    input.controllerId,
    input.startTime,
    input.endTime,
    input.interval
  ].filter(Boolean);

  const enabled = !!input.metricName && !!input.controllerId && !!input.startTime && !!input.endTime;

  console.log('🔍 [useTrendAnalysis] Hook ejecutado', {
    enabled,
    metricName: input.metricName,
    controllerId: input.controllerId,
  });

  return useQuery({
    queryKey,
    queryFn: async () => {
      console.log('⚡ [useTrendAnalysis] Ejecutando REST API...');
      
      try {
        const result = await getTrendAnalysis(input);
        
        console.log('✅ [useTrendAnalysis] Success:', {
          dataPoints: result.dataPoints?.length || 0,
        });
        
        return result;
      } catch (error) {
        console.error('❌ [useTrendAnalysis] Failed:', error);
        throw error;
      }
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook personalizado para obtener datos de planta para gráficos
export function usePlantChartData(controllerId: string) {
  const multiMetricInput: MultiMetricReportInput = useMemo(() => {
    const input = {
      controllers: controllerId ? [controllerId] : [],
      metrics: ['temperature', 'air_humidity', 'soil_humidity', 'light_intensity'],
      filters: {
        limit: 100,
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date().toISOString(),
      }
    };
    
    console.log('🏗️ [usePlantChartData] Input construido:', {
      controllerId,
      hasControllerId: !!controllerId,
    });
    
    return input;
  }, [controllerId]);

  const shouldExecuteQuery = !!controllerId && controllerId.length > 0;

  const { data: multiMetricData, isLoading, error } = useMultiMetricReport(multiMetricInput, {
    enabled: shouldExecuteQuery
  });
  
  console.log('📊 [usePlantChartData] Resultado:', {
    hasData: !!multiMetricData,
    isLoading,
    hasError: !!error,
    metricsCount: multiMetricData?.metrics?.length || 0,
  });

  // Transformar los datos al formato esperado para gráficos
  const chartData = useMemo(() => {
    if (!multiMetricData?.metrics || multiMetricData.metrics.length === 0) {
      return [];
    }

    // Agrupar métricas por tiempo (using calculated_at)
    const metricsByTime: Record<string, {
      time: string;
      temperature: number | null;
      humidity: number | null;
      soilHumidity: number | null;
      lightLevel: number | null;
    }> = {};

    multiMetricData.metrics.forEach(metric => {
      const time = new Date(metric.calculated_at).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });

      if (!metricsByTime[time]) {
        metricsByTime[time] = {
          time,
          temperature: null,
          humidity: null,
          soilHumidity: null,
          lightLevel: null,
        };
      }

      // Mapear métricas por su nombre
      if (metric.metric_name.includes('temperature_average')) {
        metricsByTime[time].temperature = metric.value;
      } else if (metric.metric_name.includes('air_humidity_average')) {
        metricsByTime[time].humidity = metric.value;
      } else if (metric.metric_name.includes('soil_humidity_average')) {
        metricsByTime[time].soilHumidity = metric.value;
      } else if (metric.metric_name.includes('light_intensity_average')) {
        metricsByTime[time].lightLevel = metric.value;
      }
    });

    const dataArray = Object.values(metricsByTime)
      .filter((entry) => entry.temperature !== null || entry.humidity !== null)
      .sort((a, b) => a.time.localeCompare(b.time))
      .slice(-20);

    return dataArray;
  }, [multiMetricData]);

  const currentData = useMemo(() => {
    if (!chartData.length) {
      return {
        temperature: 0,
        airHumidity: 0,
        soilHumidity: 0,
        lightLevel: 0,
      };
    }

    const latest = chartData[chartData.length - 1];
    return {
      temperature: latest.temperature || 0,
      airHumidity: latest.humidity || 0,
      soilHumidity: latest.soilHumidity || 0,
      lightLevel: latest.lightLevel || 0,
    };
  }, [chartData]);

  const allMetrics = useMemo(() => {
    if (!multiMetricData?.metrics) {
      return [];
    }
    return multiMetricData.metrics;
  }, [multiMetricData]);

  const getMetricAverage = (metricType: string) => {
    const avgMetric = allMetrics.find(m =>
      m.metric_name.includes(metricType) && m.metric_name.includes('average')
    );
    return avgMetric?.value || null;
  };

  const hasTemperature = allMetrics.some(m => m.metric_name.includes('temperature'));
  const hasHumidity = allMetrics.some(m => m.metric_name.includes('air_humidity'));
  const hasSoilHumidity = allMetrics.some(m => m.metric_name.includes('soil_humidity'));
  const hasLight = allMetrics.some(m => m.metric_name.includes('light_intensity'));

  return {
    chartData,
    currentData,
    isLoading,
    error,
    hasData: chartData.length > 0,
    allMetrics,
    getMetricAverage,
    hasTemperature,
    hasHumidity,
    hasSoilHumidity,
    hasLight,
  };
}

// Hook para análisis de tendencias de una métrica específica
export function usePlantMetricTrend(
  plantId: string,
  metricName: string,
  hours: number = 24
) {
  const trendInput: TrendAnalysisInput = {
    metricName,
    controllerId: plantId,
    startTime: new Date(Date.now() - hours * 60 * 60 * 1000).toISOString(),
    endTime: new Date().toISOString(),
    interval: '1h',
  };

  const { data: trendData, isLoading, error } = useTrendAnalysis(trendInput);

  const trendChartData = useMemo(() => {
    if (!trendData?.dataPoints) {
      return [];
    }

    return trendData.dataPoints.map(point => ({
      time: new Date(point.timestamp).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      value: point.value,
    }));
  }, [trendData]);

  return {
    trendData,
    chartData: trendChartData,
    isLoading,
    error,
    hasData: trendChartData.length > 0,
  };
}

// Hook para monitoreo en tiempo real
export function useRealtimeMonitoring(
  controllerId: string,
  metrics: string[] = ['temperature', 'air_humidity', 'soil_humidity', 'light_intensity'],
  enabled: boolean = true,
  hours: number = 24
) {
  const input = useMemo(() => ({
    controllers: controllerId ? [controllerId] : [],
    metrics,
    filters: {
      limit: 50,
      startTime: new Date(Date.now() - hours * 60 * 60 * 1000).toISOString(),
      endTime: new Date().toISOString(),
    }
  }), [controllerId, metrics, hours]);

  return useMultiMetricReport(input, { enabled });
}

// Hook para obtener la última medición usando REST endpoint específico
export function useLatestMeasurement(
  controllerId: string,
  enabled: boolean = true,
  pollInterval: number = 3000
) {
  return useQuery({
    queryKey: ['analytics', 'latest', controllerId],
    queryFn: () => getLatestMeasurement(controllerId),
    enabled: enabled && !!controllerId,
    staleTime: 0, // Siempre fresh para tiempo real
    refetchInterval: pollInterval,
    refetchOnWindowFocus: true,
  });
}

