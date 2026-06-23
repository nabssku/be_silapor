import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(3, { message: 'Nama kategori minimal harus 3 karakter' }).max(100),
  description: z.string().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(3, { message: 'Nama kategori minimal harus 3 karakter' }).max(100).optional(),
  description: z.string().optional(),
});

export const createLocationSchema = z.object({
  name: z.string().min(3, { message: 'Nama lokasi minimal harus 3 karakter' }).max(100),
  description: z.string().optional(),
});

export const updateLocationSchema = z.object({
  name: z.string().min(3, { message: 'Nama lokasi minimal harus 3 karakter' }).max(100).optional(),
  description: z.string().optional(),
});
