import { db } from '../db/index.js'
import { categories, locations } from '../db/schema'
import { eq } from 'drizzle-orm'

// ==========================================
// 1. SERVICES KATEGORI (CATEGORIES)
// ==========================================

export async function getCategories() {
  return await db.select().from(categories).orderBy(categories.name);
}

export async function getCategoryById(id: number) {
  const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return result[0] || null;
}

export async function findCategoryByName(name: string) {
  const result = await db.select().from(categories).where(eq(categories.name, name)).limit(1);
  return result[0] || null;
}

export async function createCategory(data: Omit<typeof categories.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>) {
  const result = await db.insert(categories).values(data).returning();
  return result[0];
}

export async function updateCategory(id: number, data: Partial<Omit<typeof categories.$inferInsert, 'id'>>) {
  const result = await db
    .update(categories)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(categories.id, id))
    .returning();
  return result[0] || null;
}

export async function deleteCategory(id: number) {
  const result = await db.delete(categories).where(eq(categories.id, id)).returning();
  return result[0] || null;
}

// ==========================================
// 2. SERVICES LOKASI (LOCATIONS)
// ==========================================

export async function getLocations() {
  return await db.select().from(locations).orderBy(locations.name);
}

export async function getLocationById(id: number) {
  const result = await db.select().from(locations).where(eq(locations.id, id)).limit(1);
  return result[0] || null;
}

export async function findLocationByName(name: string) {
  const result = await db.select().from(locations).where(eq(locations.name, name)).limit(1);
  return result[0] || null;
}

export async function createLocation(data: Omit<typeof locations.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>) {
  const result = await db.insert(locations).values(data).returning();
  return result[0];
}

export async function updateLocation(id: number, data: Partial<Omit<typeof locations.$inferInsert, 'id'>>) {
  const result = await db
    .update(locations)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(locations.id, id))
    .returning();
  return result[0] || null;
}

export async function deleteLocation(id: number) {
  const result = await db.delete(locations).where(eq(locations.id, id)).returning();
  return result[0] || null;
}
