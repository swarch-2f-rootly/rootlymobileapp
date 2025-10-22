import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { plantsService, SensorReading } from '../lib/api/plantsService';

export const usePlantMetrics = (plantId: string, hours: number = 24) => {
  return useQuery({
    queryKey: ['plant-metrics', plantId, hours],
    queryFn: () => plantsService.getPlantMetrics(plantId, hours),
    enabled: !!plantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const usePlantCurrentMetrics = (plantId: string) => {
  return useQuery({
    queryKey: ['plant-current-metrics', plantId],
    queryFn: () => plantsService.getPlantCurrentMetrics(plantId),
    enabled: !!plantId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

export const usePlantAlerts = (plantId: string) => {
  return useQuery({
    queryKey: ['plant-alerts', plantId],
    queryFn: () => plantsService.getPlantAlerts(plantId),
    enabled: !!plantId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
};

// Hook for uploading plant photos
export const useUploadPlantPhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ plantId, photoUri }: { plantId: string; photoUri: string }) =>
      plantsService.uploadPlantPhoto(plantId, photoUri),
    onSuccess: (data, variables) => {
      // Invalidate and refetch plant data to get updated photo
      queryClient.invalidateQueries({ queryKey: ['plant', variables.plantId] });
      queryClient.invalidateQueries({ queryKey: ['plants'] });
      console.log('Plant photo uploaded successfully');
    },
    onError: (error) => {
      console.error('Error uploading plant photo:', error);
    },
  });
};

// Helper functions to format chart data
export const formatChartData = (readings: SensorReading[]) => {
  return readings.map(reading => ({
    time: new Date(reading.time).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    value: reading.value,
  }));
};

export const formatHumidityChartData = (readings: SensorReading[]) => {
  return readings.map(reading => ({
    time: new Date(reading.time).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    value: reading.value,
  }));
};

export const formatSoilMoistureChartData = (readings: SensorReading[]) => {
  return readings.map(reading => ({
    time: new Date(reading.time).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    value: reading.value,
  }));
};
