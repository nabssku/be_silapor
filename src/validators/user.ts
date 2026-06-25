import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(3, { message: 'Nama minimal harus 3 karakter' }).max(255),
  nimNidn: z.string().min(3, { message: 'NIM/NIDN minimal harus 3 karakter' }).max(50),
  email: z.string().email({ message: 'Format email tidak valid' }).max(255),
  pic: z.string().min(6, { message: 'Password minimal harus 6 karakter' }),
  role: z.enum(['mahasiswa', 'dosen', 'admin', 'teknisi'], {
    message: 'Role harus berupa mahasiswa, dosen, admin, atau teknisi',
  }),
  noTelp: z.string()
    .regex(/^08[0-9]+$/, { message: 'Nomor telepon harus diawali dengan 08 dan hanya berisi angka' })
    .min(10, { message: 'Nomor telepon minimal 10 karakter' })
    .max(15, { message: 'Nomor telepon maksimal 15 karakter' })
    .optional()
    .nullable(),
});

export const updateUserSchema = z.object({
  name: z.string().min(3, { message: 'Nama minimal harus 3 karakter' }).max(255).optional(),
  nimNidn: z.string().min(3, { message: 'NIM/NIDN minimal harus 3 karakter' }).max(50).optional(),
  email: z.string().email({ message: 'Format email tidak valid' }).max(255).optional(),
  pic: z.string().min(6, { message: 'Password minimal harus 6 karakter' }).optional(),
  role: z.enum(['mahasiswa', 'dosen', 'admin', 'teknisi'], {
    message: 'Role harus berupa mahasiswa, dosen, admin, atau teknisi',
  }).optional(),
  noTelp: z.string()
    .regex(/^08[0-9]+$/, { message: 'Nomor telepon harus diawali dengan 08 dan hanya berisi angka' })
    .min(10, { message: 'Nomor telepon minimal 10 karakter' })
    .max(15, { message: 'Nomor telepon maksimal 15 karakter' })
    .optional()
    .nullable(),
});
