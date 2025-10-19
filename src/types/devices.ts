export type DeviceCategory = 'microcontroller' | 'sensor';

export interface Device {
  id: string;
  name: string;
  description: string | null;
  version: string | null;
  category: DeviceCategory;
  created_at: string;
  updated_at: string;
}

export interface DeviceCreate {
  name: string;
  description?: string;
  version?: string;
  category: DeviceCategory;
}

export interface DeviceUpdate {
  name: string;
  description?: string;
  version?: string;
  category?: DeviceCategory;
}

export interface DeviceFormData {
  name: string;
  description: string;
  version: string;
  category: DeviceCategory;
}

