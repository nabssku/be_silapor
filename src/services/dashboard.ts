import { db } from '../db/index.js'
import { reports, users, categories, locations, reportFeedbacks } from '../db/schema.js'
import { eq, count, avg, desc, or } from 'drizzle-orm'

/**
 * Mendapatkan ringkasan dashboard untuk Admin.
 * Menampilkan statistik sistem, statistik pengguna, ringkasan feedback, dan laporan terbaru.
 */
export async function getAdminSummary() {
  // Jalankan semua query database secara paralel untuk mengurangi latensi
  const [
    reportStats,
    userStats,
    categoryCountResult,
    locationCountResult,
    avgFeedbackResult,
    recentReports
  ] = await Promise.all([
    // 1. Hitung jumlah laporan berdasarkan status
    db
      .select({
        status: reports.status,
        count: count(),
      })
      .from(reports)
      .groupBy(reports.status),

    // 2. Hitung jumlah pengguna berdasarkan role
    db
      .select({
        role: users.role,
        count: count(),
      })
      .from(users)
      .groupBy(users.role),

    // 3. Hitung fasilitas
    db.select({ count: count() }).from(categories),
    db.select({ count: count() }).from(locations),

    // 4. Hitung rata-rata feedback rating
    db
      .select({
        avgRating: avg(reportFeedbacks.rating),
      })
      .from(reportFeedbacks),

    // 5. Ambil 5 laporan terbaru sistem
    db
      .select({
        id: reports.id,
        title: reports.title,
        status: reports.status,
        createdAt: reports.createdAt,
        reporterName: users.name,
      })
      .from(reports)
      .innerJoin(users, eq(reports.userId, users.id))
      .orderBy(desc(reports.createdAt))
      .limit(5)
  ]);

  const reportsCount = {
    total: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
    rejected: 0,
  };

  for (const row of reportStats) {
    const status = row.status;
    const cnt = Number(row.count);
    if (status in reportsCount) {
      reportsCount[status as keyof typeof reportsCount] = cnt;
      reportsCount.total += cnt;
    }
  }

  const usersCount = {
    total: 0,
    mahasiswa: 0,
    dosen: 0,
    admin: 0,
    teknisi: 0,
  };

  for (const row of userStats) {
    const role = row.role;
    const cnt = Number(row.count);
    if (role in usersCount) {
      usersCount[role as keyof typeof usersCount] = cnt;
      usersCount.total += cnt;
    }
  }

  const totalCategories = Number(categoryCountResult[0]?.count || 0);
  const totalLocations = Number(locationCountResult[0]?.count || 0);

  const averageRating = avgFeedbackResult[0]?.avgRating
    ? parseFloat(parseFloat(avgFeedbackResult[0].avgRating).toFixed(2))
    : 0;

  return {
    role: 'admin',
    reports: reportsCount,
    users: usersCount,
    facilities: {
      totalCategories,
      totalLocations,
    },
    feedbacks: {
      averageRating,
    },
    recentReports,
  };
}

/**
 * Mendapatkan ringkasan dashboard untuk Mahasiswa / Dosen (Reporter).
 * Hanya menampilkan statistik laporan milik mereka sendiri dan aktivitas terbaru mereka.
 */
export async function getReporterSummary(userId: string) {
  // 1. Hitung jumlah laporan milik user tersebut berdasarkan status
  const reportStats = await db
    .select({
      status: reports.status,
      count: count(),
    })
    .from(reports)
    .where(eq(reports.userId, userId))
    .groupBy(reports.status);

  const reportsCount = {
    total: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
    rejected: 0,
  };

  for (const row of reportStats) {
    const status = row.status;
    const cnt = Number(row.count);
    if (status in reportsCount) {
      reportsCount[status as keyof typeof reportsCount] = cnt;
      reportsCount.total += cnt;
    }
  }

  // 2. Ambil 5 laporan terbaru milik user tersebut
  const recentReports = await db
    .select({
      id: reports.id,
      title: reports.title,
      status: reports.status,
      createdAt: reports.createdAt,
    })
    .from(reports)
    .where(eq(reports.userId, userId))
    .orderBy(desc(reports.createdAt))
    .limit(5);

  return {
    role: 'reporter',
    reports: reportsCount,
    recentReports,
  };
}

/**
 * Mendapatkan ringkasan dashboard untuk Teknisi.
 * Menampilkan statistik laporan sistem dan 5 laporan aktif terbaru yang perlu ditangani.
 */
export async function getTeknisiSummary() {
  // 1. Hitung jumlah laporan sistem berdasarkan status
  const reportStats = await db
    .select({
      status: reports.status,
      count: count(),
    })
    .from(reports)
    .groupBy(reports.status);

  const reportsCount = {
    total: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
    rejected: 0,
  };

  for (const row of reportStats) {
    const status = row.status;
    const cnt = Number(row.count);
    if (status in reportsCount) {
      reportsCount[status as keyof typeof reportsCount] = cnt;
      reportsCount.total += cnt;
    }
  }

  // 2. Ambil 5 laporan aktif terbaru (pending atau in_progress) yang perlu ditangani
  const activeReports = await db
    .select({
      id: reports.id,
      title: reports.title,
      status: reports.status,
      createdAt: reports.createdAt,
      reporterName: users.name,
    })
    .from(reports)
    .innerJoin(users, eq(reports.userId, users.id))
    .where(
      or(
        eq(reports.status, 'pending'),
        eq(reports.status, 'in_progress')
      )
    )
    .orderBy(desc(reports.createdAt))
    .limit(5);

  return {
    role: 'teknisi',
    reports: reportsCount,
    activeReports,
  };
}
