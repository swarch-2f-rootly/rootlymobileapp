import { getApiUrl, getPlantServiceUrl } from '../lib/config/api';
import { useAuthStore } from '../stores/authStore';

/**
 * Get plant photo URL for a specific plant ID
 * @param plantId The plant ID
 * @returns The full URL to the plant photo endpoint
 */
export const getPlantPhotoUrl = (plantId: string): string => {
  // Bypass gateway for binary image stream to avoid JSON wrapping issues
  return `${getPlantServiceUrl()}/api/v1/plants/${plantId}/photo`;
};

/**
 * Get the full URL for a plant's photo with fallback
 * @param plant The plant object with id and photo_filename
 * @returns The full URL to the plant photo or a fallback image URL
 */
export const getPlantImageUrl = (plant: { id: string; photo_filename?: string | null }): string => {
  if (plant.photo_filename) {
    // Use the actual plant photo directly from the Plant service
    return getPlantPhotoUrl(plant.id);
  }

  // Fallback to default image
  return 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80';
};

/**
 * Get auth headers for image requests
 * @returns Headers object with Authorization token
 */
export const getImageHeaders = (): Record<string, string> => {
  const { tokens } = useAuthStore.getState();
  if (tokens?.access_token) {
    return {
      Authorization: `Bearer ${tokens.access_token}`,
    };
  }
  return {};
};
