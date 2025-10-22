import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { devicesService } from '../lib/api/devicesService';
import { DeviceCreate, DeviceUpdate } from '../types/devices';

export const useDevices = () => {
  return useQuery({
    queryKey: ['devices'],
    queryFn: () => devicesService.getDevices(),
  });
};

export const useDevice = (id: string) => {
  return useQuery({
    queryKey: ['devices', id],
    queryFn: () => devicesService.getDeviceById(id),
    enabled: !!id,
  });
};

export const useCreateDevice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DeviceCreate) => devicesService.createDevice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
};

export const useUpdateDevice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DeviceUpdate }) =>
      devicesService.updateDevice(id, data),
    onSuccess: (updatedDevice) => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.setQueryData(['devices', updatedDevice.id], updatedDevice);
    },
  });
};

export const useDeleteDevice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => devicesService.deleteDevice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
};

