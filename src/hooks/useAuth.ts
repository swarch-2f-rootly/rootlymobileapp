import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../lib/api/authService';
import { LoginCredentials, RegisterData } from '../types/auth';

export const useAuth = () => {
  const { isAuthenticated, user, isLoading, login, logout } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await authService.login(credentials);

      // Transform API response to match expected AuthResponse format
      const transformedResponse = {
        user: response.user,
        tokens: {
          access_token: response.access_token,
          refresh_token: response.refresh_token,
          token_type: response.token_type,
          expires_in: response.expires_in,
        }
      };

      console.log('🔄 TRANSFORMED RESPONSE:', transformedResponse);
      await login(transformedResponse);
      return transformedResponse;
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await authService.register(data);

      // Transform API response to match expected AuthResponse format
      const transformedResponse = {
        user: response.user,
        tokens: {
          access_token: response.access_token,
          refresh_token: response.refresh_token,
          token_type: response.token_type,
          expires_in: response.expires_in,
        }
      };

      console.log('🔄 TRANSFORMED REGISTER RESPONSE:', transformedResponse);
      await login(transformedResponse);
      return transformedResponse;
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await logout();
    },
  });

  const profileQuery = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => user?.id ? authService.getProfile(user.id) : Promise.reject('No user ID'),
    enabled: isAuthenticated && !!user?.id,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      if (!user?.id) throw new Error('No user ID');
      return authService.updateProfile(user.id, data);
    },
    onSuccess: () => {
      // Invalidate and refetch profile data
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });

  return {
    // State
    isAuthenticated,
    user,
    isLoading,

    // Actions
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,

    // Loading states
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,

    // Errors
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    logoutError: logoutMutation.error,
    updateProfileError: updateProfileMutation.error,

    // Profile
    profile: profileQuery.data,
    isProfileLoading: profileQuery.isLoading,
  };
};

