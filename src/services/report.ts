import { db } from '../db/index.js'
import { reports, users, categories, locations, reportFeedbacks } from '../db/schema.js'
import { eq, and } from 'drizzle-orm'

/**
 * Menyimpan laporan kerusakan baru.
 */
export async function createReport(data: Omit<typeof reports.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>) {
  const result = await db.insert(reports).values(data).returning();
  return result[0];
}

/**
 * Mengambil daftar laporan dengan filter (status, categoryId, locationId) beserta relasi datanya.
 */
export async function getReports(filters: { status?: any; categoryId?: number; locationId?: number }) {
  let query = db
    .select({
      id: reports.id,
      title: reports.title,
      description: reports.description,
      photoUrl: reports.photoUrl,
      status: reports.status,
      priority: reports.priority,
      notes: reports.notes,
      createdAt: reports.createdAt,
      updatedAt: reports.updatedAt,
      reporter: {
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      },
      category: {
        id: categories.id,
        name: categories.name,
        description: categories.description,
      },
      location: {
        id: locations.id,
        name: locations.name,
        description: locations.description,
      },
    })
    .from(reports)
    .innerJoin(users, eq(reports.userId, users.id))
    .innerJoin(categories, eq(reports.categoryId, categories.id))
    .innerJoin(locations, eq(reports.locationId, locations.id));

  const conditions = [];
  if (filters.status) {
    conditions.push(eq(reports.status, filters.status));
  }
  if (filters.categoryId) {
    conditions.push(eq(reports.categoryId, filters.categoryId));
  }
  if (filters.locationId) {
    conditions.push(eq(reports.locationId, filters.locationId));
  }

  if (conditions.length > 0) {
    return await query.where(and(...conditions)).orderBy(reports.createdAt);
  }

  return await query.orderBy(reports.createdAt);
}

/**
 * Mengambil satu detail laporan berdasarkan ID beserta feedback-nya.
 */
export async function getReportById(id: string) {
  const result = await db
    .select({
      id: reports.id,
      title: reports.title,
      description: reports.description,
      photoUrl: reports.photoUrl,
      status: reports.status,
      priority: reports.priority,
      notes: reports.notes,
      createdAt: reports.createdAt,
      updatedAt: reports.updatedAt,
      reporter: {
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      },
      category: {
        id: categories.id,
        name: categories.name,
        description: categories.description,
      },
      location: {
        id: locations.id,
        name: locations.name,
        description: locations.description,
      },
    })
    .from(reports)
    .innerJoin(users, eq(reports.userId, users.id))
    .innerJoin(categories, eq(reports.categoryId, categories.id))
    .innerJoin(locations, eq(reports.locationId, locations.id))
    .where(eq(reports.id, id))
    .limit(1);

  if (result.length === 0) return null;

  const report = result[0];

  // Ambil feedback terkait laporan ini
  const feedbacks = await db
    .select({
      id: reportFeedbacks.id,
      comment: reportFeedbacks.comment,
      rating: reportFeedbacks.rating,
      createdAt: reportFeedbacks.createdAt,
      user: {
        id: users.id,
        name: users.name,
        role: users.role,
      },
    })
    .from(reportFeedbacks)
    .innerJoin(users, eq(reportFeedbacks.userId, users.id))
    .where(eq(reportFeedbacks.reportId, id))
    .orderBy(reportFeedbacks.createdAt);

  return {
    ...report,
    feedbacks,
  };
}

/**
 * Mengubah status laporan (Khusus Admin / Teknisi).
 */
export async function updateReportStatus(id: string, status: any, notes?: string) {
  const result = await db
    .update(reports)
    .set({ status, notes, updatedAt: new Date() })
    .where(eq(reports.id, id))
    .returning();
  return result[0] || null;
}

/**
 * Mengubah prioritas laporan (Khusus Admin).
 */
export async function updateReportPriority(id: string, priority: 'low' | 'medium' | 'high') {
  const result = await db
    .update(reports)
    .set({ priority, updatedAt: new Date() })
    .where(eq(reports.id, id))
    .returning();
  return result[0] || null;
}

/**
 * Menyimpan data feedback baru.
 */
export async function createReportFeedback(data: Omit<typeof reportFeedbacks.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>) {
  const result = await db.insert(reportFeedbacks).values(data).returning();
  return result[0];
}
