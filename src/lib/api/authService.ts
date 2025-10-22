import apiClient from './client';
import { LoginCredentials, RegisterData, AuthResponse, User } from '../../types/auth';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post('/api/v1/auth/login', credentials);
    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post('/api/v1/auth/register', data);
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/api/v1/auth/logout');
  },

  async refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    const response = await apiClient.post('/api/v1/auth/refresh', { refresh_token: refreshToken });
    return response.data;
  },

  async getProfile(userId: string): Promise<User> {
    const response = await apiClient.get(`/api/v1/users/${userId}`);
    return response.data;
  },

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    const response = await apiClient.put(`/api/v1/users/${userId}`, data);
    return response.data;
  },
};

