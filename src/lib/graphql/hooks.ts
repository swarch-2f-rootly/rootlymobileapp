import { useMemo } from 'react';
import { useMultiMetricReport, useTrendAnalysis } from './analytics-queries';
import type { MultiMetricReportInput, TrendAnalysisInput } from './types';

// Hook personalizado para obtener datos de planta para gráficos
// Transforma los datos de GraphQL al formato esperado por PlantCharts
// controllerId: ID del microcontrolador (su nombre) asignado a la planta
export function usePlantChartData(controllerId: string) {
  // Memoizar el input para evitar recrearlo en cada render y causar requests infinitos
  const multiMetricInput: MultiMetricReportInput = useMemo(() => ({
    controllers: controllerId ? [controllerId] : [], // Usar el controllerId del microcontrolador
    metrics: ['temperature', 'air_humidity', 'soil_humidity', 'light_intensity'],
    filters: {
      limit: 100,
      // Últimas 24 horas
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date().toISOString(),
    }
  }), [controllerId]);

  // Solo ejecutar la query si hay controllerId
  const shouldExecuteQuery = !!controllerId && controllerId.length > 0;

  const { data: multiMetricData, isLoading, error } = useMultiMetricReport(multiMetricInput, {
    enabled: shouldExecuteQuery
  });

  // Transformar los datos al formato esperado por PlantCharts
  const chartData = useMemo(() => {
    if (!multiMetricData?.getMultiMetricReport?.reports?.[0]?.metrics) {
      return [];
    }

    const report = multiMetricData.getMultiMetricReport.reports[0];
    const metricsByTime: Record<string, {
      time: string;
      temperature: number | null;
      humidity: number | null;
      soilHumidity: number | null;
      lightLevel: number | null;
    }> = {};

    // Agrupar métricas por timestamp (última hora más reciente)
    report.metrics.forEach(metric => {
      const time = new Date(metric.calculatedAt).toLocaleTimeString('es-ES', {
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

      // Mapear nombres de métricas a los campos esperados
      switch (metric.metricName) {
        case 'temperature':
          metricsByTime[time].temperature = metric.value;
          break;
        case 'air_humidity':
          metricsByTime[time].humidity = metric.value;
          break;
        case 'soil_humidity':
          metricsByTime[time].soilHumidity = metric.value;
          break;
        case 'light_intensity':
          metricsByTime[time].lightLevel = metric.value;
          break;
      }
    });

    // Convertir a array y ordenar por tiempo
    const dataArray = Object.values(metricsByTime)
      .filter((entry) => entry.temperature !== null || entry.humidity !== null)
      .sort((a, b) => a.time.localeCompare(b.time))
      .slice(-20); // Últimos 20 puntos para el gráfico

    return dataArray;
  }, [multiMetricData]);

  // Calcular valores actuales (última medición)
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

  // Extraer todas las métricas sin procesar
  const allMetrics = useMemo(() => {
    if (!multiMetricData?.getMultiMetricReport?.reports?.[0]?.metrics) {
      return [];
    }
    return multiMetricData.getMultiMetricReport.reports[0].metrics;
  }, [multiMetricData]);

  // Función helper para obtener el promedio de una métrica específica
  const getMetricAverage = (metricType: string) => {
    const avgMetric = allMetrics.find(m =>
      m.metricName.includes(metricType) && m.metricName.includes('average')
    );
    return avgMetric?.value || null;
  };

  // Verificar si hay datos para cada tipo de métrica
  const hasTemperature = allMetrics.some(m => m.metricName.includes('temperature'));
  const hasHumidity = allMetrics.some(m => m.metricName.includes('air_humidity'));
  const hasSoilHumidity = allMetrics.some(m => m.metricName.includes('soil_humidity'));
  const hasLight = allMetrics.some(m => m.metricName.includes('light_intensity'));

  return {
    chartData,
    currentData,
    isLoading,
    error,
    hasData: chartData.length > 0,
    allMetrics, // Todas las métricas sin procesar
    getMetricAverage, // Función para obtener promedio
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
    interval: '1h', // Intervalo de 1 hora
  };

  const { data: trendData, isLoading, error } = useTrendAnalysis(trendInput);

  // Transformar datos de tendencia al formato de gráfico
  const trendChartData = useMemo(() => {
    if (!trendData?.getTrendAnalysis?.dataPoints) {
      return [];
    }

    return trendData.getTrendAnalysis.dataPoints.map(point => ({
      time: new Date(point.timestamp).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      value: point.value,
    }));
  }, [trendData]);

  return {
    trendData: trendData?.getTrendAnalysis,
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

// Hook para obtener la última medición
export function useLatestMeasurement(
  controllerId: string,
  enabled: boolean = true,
  pollInterval: number = 3000
) {
  const input = useMemo(() => ({
    controllers: controllerId ? [controllerId] : [],
    metrics: ['temperature', 'air_humidity', 'soil_humidity', 'light_intensity'],
    filters: {
      limit: 1, // Solo la última medición
      endTime: new Date().toISOString(),
    }
  }), [controllerId]);

  const { data, isLoading, error } = useMultiMetricReport(input, { enabled });

  // Procesar la última medición
  const latestMeasurement = useMemo(() => {
    if (!data?.getMultiMetricReport?.reports?.[0]?.metrics?.[0]) {
      return null;
    }

    const metric = data.getMultiMetricReport.reports[0].metrics[0];
    const ageMinutes = Math.floor((Date.now() - new Date(metric.calculatedAt).getTime()) / (1000 * 60));

    return {
      measurement: {
        metricName: metric.metricName,
        value: metric.value,
        unit: metric.unit,
        calculatedAt: metric.calculatedAt,
      },
      status: ageMinutes < 5 ? 'online' : 'delayed',
      dataAgeMinutes: ageMinutes,
    };
  }, [data]);

  return {
    data: latestMeasurement,
    isLoading,
    error,
  };
}
