import apiClient from './client';
import { User } from '../../types/auth';

export class FileService {
  /**
   * Upload a profile photo for a user
   */
  async uploadProfilePhoto(userId: string, photoUri: string): Promise<User> {
    const formData = new FormData();
    const filename = photoUri.split('/').pop() || 'photo.jpg';
    const fileType = filename.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

    formData.append('file', {
      uri: photoUri,
      name: filename,
      type: fileType,
    } as any); // 'as any' is used due to React Native's Blob/File API differences

    const response = await apiClient.post(`/api/v1/users/${userId}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Delete a user's profile photo
   */
  async deleteProfilePhoto(userId: string): Promise<void> {
    await apiClient.delete(`/api/v1/users/${userId}/photo`);
  }

  /**
   * Get profile photo metadata
   */
  async getProfilePhotoMetadata(userId: string): Promise<any> {
    const response = await apiClient.get(`/api/v1/users/${userId}/photo/metadata`);
    return response.data;
  }

  /**
   * Get a user's profile photo
   */
  async getProfilePhoto(userId: string): Promise<any> {
    const response = await apiClient.get(`/api/v1/users/${userId}/photo`);
    return response.data;
  }
}

export const fileService = new FileService();
