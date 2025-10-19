import apiClient from './client';
import { Device, DeviceCreate, DeviceUpdate } from '../../types/devices';

export const devicesService = {
  async getDevices(): Promise<Device[]> {
    const response = await apiClient.get('/api/v1/devices');
    return response.data;
  },

  async getDeviceById(id: string): Promise<Device> {
    const response = await apiClient.get(`/api/v1/devices/${id}`);
    return response.data;
  },

  async createDevice(data: DeviceCreate): Promise<Device> {
    const response = await apiClient.post('/api/v1/devices', data);
    return response.data;
  },

  async updateDevice(id: string, data: DeviceUpdate): Promise<Device> {
    const response = await apiClient.put(`/api/v1/devices/${id}`, data);
    return response.data;
  },

  async deleteDevice(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/devices/${id}`);
  },
};

