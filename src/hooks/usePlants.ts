import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { plantsService } from '../lib/api/plantsService';
import { Plant, PlantCreate, PlantUpdate } from '../types/plants';

export const usePlants = () => {
  return useQuery({
    queryKey: ['plants'],
    queryFn: () => plantsService.getPlants(),
  });
};

export const usePlant = (id: string) => {
  return useQuery({
    queryKey: ['plants', id],
    queryFn: () => plantsService.getPlantById(id),
    enabled: !!id,
  });
};

export const useCreatePlant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PlantCreate) => plantsService.createPlant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plants'] });
    },
  });
};

export const useUpdatePlant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PlantUpdate }) =>
      plantsService.updatePlant(id, data),
    onSuccess: (updatedPlant) => {
      queryClient.invalidateQueries({ queryKey: ['plants'] });
      queryClient.setQueryData(['plants', updatedPlant.id], updatedPlant);
    },
  });
};

export const useDeletePlant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => plantsService.deletePlant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plants'] });
    },
  });
};

