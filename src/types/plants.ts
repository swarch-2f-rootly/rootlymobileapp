export interface Plant {
  id: string;
  name: string;
  species: string;
  description: string | null;
  user_id: string;
  photo_filename: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlantCreate {
  name: string;
  species: string;
  description?: string;
  user_id: string;
}

export interface PlantUpdate {
  name: string;
  species: string;
  description?: string;
}

export interface PlantFormData {
  name: string;
  species: string;
  description: string;
}

