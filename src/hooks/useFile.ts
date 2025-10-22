import { useMutation } from '@tanstack/react-query';
import { fileService } from '../lib/api/fileService';
import { useQueryClient } from '@tanstack/react-query';

export const useUploadProfilePhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, photoUri }: { userId: string; photoUri: string }) =>
      fileService.uploadProfilePhoto(userId, photoUri),
    onSuccess: (data, { userId }) => {
      // Invalidate and refetch profile data
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
      // Also invalidate auth user data if needed
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
};

export const useDeleteProfilePhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => fileService.deleteProfilePhoto(userId),
    onSuccess: (_, userId) => {
      // Invalidate and refetch profile data
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
      // Also invalidate auth user data if needed
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
};
