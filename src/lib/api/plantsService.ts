import apiClient from './client';
import { Plant, PlantCreate, PlantUpdate } from '../../types/plants';

// Types for metrics
export interface SensorReading {
  time: string;
  value: number;
}

export interface CurrentMetrics {
  temperature: number;
  humidity: number;
  soilMoisture: number;
  lightLevel: number;
}

export interface PlantAlert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
}

export const plantsService = {
  async getPlants(): Promise<Plant[]> {
    const response = await apiClient.get('/api/v1/plants');
    return response.data;
  },

  async getPlantById(id: string): Promise<Plant> {
    const response = await apiClient.get(`/api/v1/plants/${id}`);
    return response.data;
  },

  async createPlant(data: PlantCreate): Promise<Plant> {
    const response = await apiClient.post('/api/v1/plants', data);
    return response.data;
  },

  async updatePlant(id: string, data: PlantUpdate): Promise<Plant> {
    const response = await apiClient.put(`/api/v1/plants/${id}`, data);
    return response.data;
  },

  async deletePlant(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/plants/${id}`);
  },

  // Metrics and monitoring endpoints
  async getPlantMetrics(plantId: string, hours: number = 24): Promise<{
    temperature: SensorReading[];
    humidity: SensorReading[];
    soilMoisture: SensorReading[];
    lightLevel: SensorReading[];
  }> {
    const response = await apiClient.get(`/api/v1/plants/${plantId}/metrics`, {
      params: { hours }
    });
    return response.data;
  },

  async getPlantCurrentMetrics(plantId: string): Promise<CurrentMetrics> {
    const response = await apiClient.get(`/api/v1/plants/${plantId}/current-metrics`);
    return response.data;
  },

  async getPlantAlerts(plantId: string): Promise<PlantAlert[]> {
    const response = await apiClient.get(`/api/v1/plants/${plantId}/alerts`);
    return response.data;
  },

  // Photo upload endpoint
  async uploadPlantPhoto(plantId: string, photoUri: string): Promise<any> {
    // Create FormData for multipart upload
    const formData = new FormData();

    // Get file info from URI
    const filename = photoUri.split('/').pop() || 'photo.jpg';
    const fileType = filename.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

    // For React Native, we need to create a file object from the URI
    formData.append('file', {
      uri: photoUri,
      name: filename,
      type: fileType,
    } as any);

    const response = await apiClient.post(`/api/v1/plants/${plantId}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};

