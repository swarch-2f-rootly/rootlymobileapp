import { useAnalyticsHealth, useMultiMetricReport } from '../lib/api/analytics-hooks';
import { useMemo } from 'react';

// Re-export analytics hooks from REST API
export { useAnalyticsHealth, useMultiMetricReport };

// Hook para obtener métricas globales de todos los controladores
export const useGlobalMetrics = (period: 'day' | 'week' | 'month' = 'week') => {
  // Para métricas globales, necesitamos obtener datos de todos los controladores
  // Por ahora, usamos un input vacío que debería devolver datos globales
  // Esto puede necesitar ajuste según cómo funcione el backend
  const input = useMemo(() => ({
    controllers: [], // Empty array should return global metrics
    metrics: ['temperature', 'air_humidity', 'soil_humidity', 'light_intensity'],
    filters: {
      limit: 100,
      // Últimas horas según el período
      startTime: new Date(Date.now() - getPeriodHours(period) * 60 * 60 * 1000).toISOString(),
      endTime: new Date().toISOString(),
    }
  }), [period]);

  const { data: multiMetricData, isLoading, error } = useMultiMetricReport(input);

  // Transformar datos al formato esperado
  const globalMetrics = useMemo(() => {
    if (!multiMetricData?.getMultiMetricReport?.reports) {
      return {
        temperature: [],
        humidity: [],
        soilMoisture: [],
        lightLevel: [],
      };
    }

    // Combinar datos de todos los controladores
    const temperature: Array<{ time: string; value: number }> = [];
    const humidity: Array<{ time: string; value: number }> = [];
    const soilMoisture: Array<{ time: string; value: number }> = [];
    const lightLevel: Array<{ time: string; value: number }> = [];

    multiMetricData.getMultiMetricReport.reports.forEach(report => {
      report.metrics.forEach(metric => {
        const dataPoint = {
          time: metric.calculatedAt,
          value: metric.value,
        };

        switch (metric.metricName) {
          case 'temperature':
            temperature.push(dataPoint);
            break;
          case 'air_humidity':
            humidity.push(dataPoint);
            break;
          case 'soil_humidity':
            soilMoisture.push(dataPoint);
            break;
          case 'light_intensity':
            lightLevel.push(dataPoint);
            break;
        }
      });
    });

    return {
      temperature,
      humidity,
      soilMoisture,
      lightLevel,
    };
  }, [multiMetricData]);

  return {
    data: globalMetrics,
    isLoading,
    error,
  };
};

// Hook para métricas del sistema (usando health check por ahora)
export const useSystemMetrics = () => {
  const { data: healthData, isLoading, error } = useAnalyticsHealth();

  // Transform health data to system metrics
  const systemMetrics = useMemo(() => {
    if (!healthData?.getAnalyticsHealth) {
      return {
        totalPlants: 0,
        activeSensors: 0,
        totalReadings: 0,
        alertsToday: 0,
      };
    }

    // For now, return placeholder data since health doesn't provide these metrics
    // This would need to be implemented with a proper system metrics endpoint
    return {
      totalPlants: 0,
      activeSensors: 0,
      totalReadings: 0,
      alertsToday: 0,
    };
  }, [healthData]);

  return {
    data: systemMetrics,
    isLoading,
    error,
  };
};

// Hook para estado de sensores (placeholder - needs proper implementation)
export const useSensorHealth = () => {
  // This would need a proper REST API endpoint for sensor health
  // For now returning placeholder data
  return {
    data: [
      { name: 'Operativos', population: 0, color: '#22c55e', legendFontColor: '#22c55e' },
      { name: 'Mantenimiento', population: 0, color: '#f59e0b', legendFontColor: '#f59e0b' },
      { name: 'Fuera de línea', population: 0, color: '#ef4444', legendFontColor: '#ef4444' },
    ],
    isLoading: false,
    error: null,
  };
};

// Hook para alertas recientes (placeholder - needs proper implementation)
export const useRecentAlerts = () => {
  // This would need a proper REST API endpoint for recent alerts
  // For now returning empty array
  return {
    data: [],
    isLoading: false,
    error: null,
  };
};

// Helper function to get period hours
const getPeriodHours = (period: 'day' | 'week' | 'month'): number => {
  switch (period) {
    case 'day':
      return 24;
    case 'week':
      return 7 * 24;
    case 'month':
      return 30 * 24;
    default:
      return 7 * 24;
  }
};

// Helper functions to format chart data
export const formatGlobalChartData = (readings: Array<{ time: string; value: number }>) => {
  return readings.map(reading => ({
    time: new Date(reading.time).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
    }),
    value: reading.value,
  }));
};
