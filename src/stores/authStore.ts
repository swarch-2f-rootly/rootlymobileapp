import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthTokens, AuthResponse } from '../types/auth';
import { getApiUrl } from '../lib/config/api';

interface AuthState {
  // State
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  tokens: AuthTokens | null;

  // Actions
  login: (authData: AuthResponse) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateUser: (user: User) => void;
  checkAuthStatus: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      user: null,
      isLoading: true,
      tokens: null,

      // Actions
      login: async (authData: AuthResponse) => {
        console.log('🔐 LOGIN DATA RECEIVED:', authData);
        console.log('🔐 LOGIN USER:', authData.user);
        console.log('🔐 LOGIN TOKENS:', authData.tokens);

        set({
          isAuthenticated: true,
          user: authData.user,
          tokens: authData.tokens,
          isLoading: false,
        });

        // Verify tokens were saved correctly
        const currentState = get();
        console.log('🔐 LOGIN COMPLETE - STATE UPDATED');
        console.log('🔐 CURRENT STATE TOKENS:', currentState.tokens);
        console.log('🔐 CURRENT STATE USER:', currentState.user);
        console.log('🔐 CURRENT STATE AUTH:', currentState.isAuthenticated);
      },

      logout: async () => {
        const { tokens } = get();

        // Clear local state first
        set({
          isAuthenticated: false,
          user: null,
          tokens: null,
          isLoading: false,
        });

        // If we have a refresh token, try to revoke it on the server
        if (tokens?.refresh_token) {
          try {
            const API_BASE_URL = getApiUrl();
            await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ refresh_token: tokens.refresh_token }),
            });
          } catch (error) {
            // Server logout failed, but local logout is complete
            console.warn('Server logout failed, but local logout was successful:', error);
          }
        }
      },

      refreshToken: async () => {
        const { tokens } = get();
        if (!tokens?.refresh_token) {
          throw new Error('No refresh token available');
        }

        try {
          const API_BASE_URL = getApiUrl();
          const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh_token: tokens.refresh_token }),
          });

          if (!response.ok) {
            throw new Error('Token refresh failed');
          }

          const newTokens: AuthTokens = await response.json();
          set({ tokens: newTokens });
        } catch (error) {
          // If refresh fails, logout
          await get().logout();
          throw error;
        }
      },

      updateUser: (user: User) => {
        set({ user });
      },

      checkAuthStatus: async () => {
        try {
          const { tokens, user } = get();

          if (tokens && user) {
            // Check if token is still valid (simple check)
            const now = Date.now();
            const tokenExpiry = tokens.expires_in * 1000; // Convert to milliseconds
            const tokenCreated = new Date(user.updated_at).getTime();

            if (now - tokenCreated < tokenExpiry) {
              set({
                isAuthenticated: true,
                isLoading: false,
              });
              return;
            } else {
              // Token expired, try to refresh
              try {
                await get().refreshToken();
                set({
                  isAuthenticated: true,
                  isLoading: false,
                });
                return;
              } catch {
                // Refresh failed, clear auth
              }
            }
          }

          // No valid auth found
          set({
            isAuthenticated: false,
            user: null,
            tokens: null,
            isLoading: false,
          });
        } catch (error) {
          console.error('Error checking auth status:', error);
          set({
            isAuthenticated: false,
            user: null,
            tokens: null,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
      }),
    }
  )
);

