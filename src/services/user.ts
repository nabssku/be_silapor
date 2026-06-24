import { db } from '../db/index.js'
import { users } from '../db/schema.js'
import { eq, or, and, ne } from 'drizzle-orm'
import { hash } from 'bcrypt-ts'

/**
 * Mendapatkan daftar semua user (password hash diabaikan demi keamanan).
 */
export async function getUsers() {
  return await db
    .select({
      id: users.id,
      name: users.name,
      nimNidn: users.nimNidn,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .orderBy(users.name);
}

/**
 * Mendapatkan detail user berdasarkan ID.
 */
export async function getUserById(id: string) {
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      nimNidn: users.nimNidn,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return result[0] || null;
}

/**
 * Memeriksa apakah NIM/NIDN atau Email sudah dimiliki oleh user lain (selain user dengan id tertentu).
 * Digunakan untuk validasi keunikan saat proses update.
 */
export async function findUserByNimOrEmailExcept(id: string, identifier: string) {
  const result = await db
    .select()
    .from(users)
    .where(
      and(
        ne(users.id, id),
        or(
          eq(users.nimNidn, identifier),
          eq(users.email, identifier)
        )
      )
    )
    .limit(1);

  return result[0] || null;
}

/**
 * Membuat user baru dengan password yang di-hash.
 */
export async function createUser(data: Omit<typeof users.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>) {
  const saltRounds = 10;
  const hashedPassword = await hash(data.pic, saltRounds);

  const result = await db
    .insert(users)
    .values({
      name: data.name,
      nimNidn: data.nimNidn,
      email: data.email,
      pic: hashedPassword,
      role: data.role,
    })
    .returning({
      id: users.id,
      name: users.name,
      nimNidn: users.nimNidn,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });

  return result[0];
}

/**
 * Memperbarui data user berdasarkan ID. Password akan di-hash ulang jika dikirimkan.
 */
export async function updateUser(id: string, data: Partial<Omit<typeof users.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>>) {
  const updateData: any = {
    ...data,
    updatedAt: new Date(),
  };

  if (data.pic) {
    const saltRounds = 10;
    updateData.pic = await hash(data.pic, saltRounds);
  }

  const result = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      name: users.name,
      nimNidn: users.nimNidn,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });

  return result[0] || null;
}

/**
 * Menghapus user berdasarkan ID.
 */
export async function deleteUser(id: string) {
  const result = await db
    .delete(users)
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      name: users.name,
      nimNidn: users.nimNidn,
      email: users.email,
      role: users.role,
    });

  return result[0] || null;
}
