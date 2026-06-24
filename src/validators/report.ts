import { z } from 'zod';

export const createReportSchema = z.object({
  title: z.string().min(3, { message: 'Judul laporan minimal harus 3 karakter' }).max(255),
  description: z.string().min(5, { message: 'Deskripsi laporan minimal harus 5 karakter' }),
  categoryId: z.union([
    z.number().int(),
    z.string().regex(/^\d+$/, { message: 'Category ID harus berupa angka' }).transform(Number)
  ]),
  locationId: z.union([
    z.number().int(),
    z.string().regex(/^\d+$/, { message: 'Location ID harus berupa angka' }).transform(Number)
  ]),
  notes: z.string().optional(),
});

export const updateReportStatusSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'resolved', 'rejected'], {
    message: 'Status harus berupa pending, in_progress, resolved, atau rejected',
  }),
  notes: z.string().optional(),
});

export const createFeedbackSchema = z.object({
  comment: z.string().min(3, { message: 'Komentar minimal harus 3 karakter' }),
  rating: z.union([
    z.number().int().min(1).max(5),
    z.string().regex(/^[1-5]$/, { message: 'Rating harus berkisar antara 1 s.d. 5' }).transform(Number)
  ]),
});
