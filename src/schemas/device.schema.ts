import { z } from 'zod';

// UUID schema
const uuidSchema = z.string().uuid();

// Device Category Schema
export const DeviceCategorySchema = z.enum(['microcontroller', 'sensor']);

// Device Create Schema
export const DeviceCreateSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  version: z.string().optional(),
  category: DeviceCategorySchema,
  user_id: uuidSchema,
});

// Device Update Schema
export const DeviceUpdateSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  version: z.string().optional(),
  category: DeviceCategorySchema.optional(),
});

// Device Response Schema
export const DeviceResponseSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  version: z.string().nullable(),
  category: DeviceCategorySchema,
  id: uuidSchema,
  created_at: z.string().transform((val) => {
    try {
      const date = new Date(val);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      return date.toISOString();
    } catch {
      if (typeof val === 'string' && val.length > 10) {
        return val;
      }
      throw new Error('Invalid date format');
    }
  }),
  updated_at: z.string().transform((val) => {
    try {
      const date = new Date(val);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      return date.toISOString();
    } catch {
      if (typeof val === 'string' && val.length > 10) {
        return val;
      }
      throw new Error('Invalid date format');
    }
  }),
});

// Infer types from schemas
export type DeviceCreateType = z.infer<typeof DeviceCreateSchema>;
export type DeviceUpdateType = z.infer<typeof DeviceUpdateSchema>;
export type DeviceResponseType = z.infer<typeof DeviceResponseSchema>;
export type DeviceCategoryType = z.infer<typeof DeviceCategorySchema>;


