import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(3, { message: 'Nama minimal harus 3 karakter' }).max(255),
  nimNidn: z.string().min(3, { message: 'NIM/NIDN minimal harus 3 karakter' }).max(50),
  email: z.string().email({ message: 'Format email tidak valid' }).max(255),
  pic: z.string().min(6, { message: 'Password minimal harus 6 karakter' }),
  role: z.enum(['mahasiswa', 'dosen', 'admin', 'teknisi'], {
    message: 'Role harus berupa mahasiswa, dosen, admin, atau teknisi',
  }),
});

export const loginSchema = z.object({
  identifier: z.string().min(3, { message: 'NIM/NIDN atau Email minimal harus 3 karakter' }),
  pic: z.string().min(6, { message: 'Password minimal harus 6 karakter' }),
});

export const loginInfokhsSchema = z.object({
  identifier: z.string().min(3, { message: 'NIM minimal harus 3 karakter' }),
  pic: z.string().min(6, { message: 'Password minimal harus 6 karakter' }),
});

