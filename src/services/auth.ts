import { db } from '../db/index.js'
import { users } from '../db/schema.js'
import { eq, or } from 'drizzle-orm'
import { hash } from 'bcrypt-ts'

/**
 * Mencari user berdasarkan NIM/NIDN atau Email.
 */
export async function findUserByNimOrEmail(identifier: string) {
  const result = await db
    .select()
    .from(users)
    .where(
      or(
        eq(users.nimNidn, identifier),
        eq(users.email, identifier)
      )
    )
    .limit(1);

  return result[0] || null;
}

/**
 * Mendaftarkan user baru ke database (dengan hashing password yang disimpan di kolom pic).
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
    });

  return result[0];
}
