import { Context } from 'hono'
import { uploadToCloudinary } from '../utils/cloudinary.js'
import {
  createReportSchema,
  updateReportStatusSchema,
  updateReportPrioritySchema,
  createFeedbackSchema
} from '../validators/report.js'
import {
  createReport,
  getReports,
  getReportById,
  updateReportStatus,
  updateReportPriority,
  createReportFeedback
} from '../services/report.js'

/**
 * Controller untuk membuat laporan baru (menerima multipart/form-data).
 */
export async function createReportController(c: Context) {
  try {
    const body = await c.req.parseBody();

    const title = body.title as string;
    const description = body.description as string;
    const categoryIdRaw = body.categoryId as string;
    const locationIdRaw = body.locationId as string;
    const photoFile = body.photo as File | undefined;
    const priority = body.priority as string | undefined;
    const notes = body.notes as string | undefined;

    // 1. Validasi field wajib
    const parsedData = createReportSchema.safeParse({
      title,
      description,
      categoryId: categoryIdRaw,
      locationId: locationIdRaw,
      priority,
      notes,
    });

    if (!parsedData.success) {
      return c.json({
        success: false,
        message: 'Validasi input laporan gagal',
        error: parsedData.error.format(),
      }, 400);
    }

    // 2. Validasi file foto
    if (!photoFile || !(photoFile instanceof File) || photoFile.size === 0) {
      return c.json({
        success: false,
        message: 'Foto bukti kerusakan wajib diunggah',
      }, 400);
    }

    // 3. Upload foto ke Cloudinary
    let photoUrl = '';
    try {
      photoUrl = await uploadToCloudinary(photoFile);
    } catch (uploadError: any) {
      return c.json({
        success: false,
        message: 'Gagal mengunggah foto ke Cloudinary',
        error: uploadError.message,
      }, 500);
    }

    // 4. Ambil User ID dari JWT payload
    const jwtPayload = c.get('jwtPayload') as { id: string; role: string } | undefined;
    if (!jwtPayload) {
      return c.json({
        success: false,
        message: 'Pengguna tidak terautentikasi',
      }, 401);
    }

    // 5. Simpan Laporan ke Database
    const newReport = await createReport({
      title: parsedData.data.title,
      description: parsedData.data.description,
      photoUrl,
      userId: jwtPayload.id,
      categoryId: parsedData.data.categoryId,
      locationId: parsedData.data.locationId,
      status: 'pending', // default status
      priority: parsedData.data.priority,
      notes: parsedData.data.notes || null,
    });

    return c.json({
      success: true,
      message: 'Laporan kerusakan berhasil dikirim',
      data: newReport,
    }, 201);
  } catch (error: any) {
    return c.json({
      success: false,
      message: 'Gagal membuat laporan kerusakan',
      error: error.message,
    }, 500);
  }
}

/**
 * Controller untuk mengambil semua daftar laporan dengan filter.
 */
export async function getReportsController(c: Context) {
  try {
    const status = c.req.query('status');
    const categoryIdRaw = c.req.query('categoryId');
    const locationIdRaw = c.req.query('locationId');

    const categoryId = categoryIdRaw ? parseInt(categoryIdRaw, 10) : undefined;
    const locationId = locationIdRaw ? parseInt(locationIdRaw, 10) : undefined;

    const list = await getReports({
      status,
      categoryId: isNaN(categoryId as any) ? undefined : categoryId,
      locationId: isNaN(locationId as any) ? undefined : locationId,
    });

    return c.json({
      success: true,
      message: 'Berhasil mengambil daftar laporan',
      data: list,
    }, 200);
  } catch (error: any) {
    return c.json({
      success: false,
      message: 'Gagal mengambil daftar laporan',
      error: error.message,
    }, 500);
  }
}

/**
 * Controller untuk mengambil detail laporan berdasarkan ID.
 */
export async function getReportByIdController(c: Context) {
  try {
    const id = c.req.param('id');
    if (!id) {
      return c.json({
        success: false,
        message: 'Format ID tidak valid',
      }, 400);
    }

    const report = await getReportById(id);
    if (!report) {
      return c.json({
        success: false,
        message: 'Laporan tidak ditemukan',
      }, 404);
    }

    return c.json({
      success: true,
      message: 'Berhasil mengambil detail laporan',
      data: report,
    }, 200);
  } catch (error: any) {
    return c.json({
      success: false,
      message: 'Gagal mengambil detail laporan',
      error: error.message,
    }, 500);
  }
}

/**
 * Controller untuk memperbarui status laporan (Hanya Admin / Teknisi).
 */
export async function updateReportStatusController(c: Context) {
  try {
    const id = c.req.param('id');
    if (!id) {
      return c.json({
        success: false,
        message: 'Format ID tidak valid',
      }, 400);
    }

    // Ambil JWT payload untuk role check
    const jwtPayload = c.get('jwtPayload') as { id: string; role: string } | undefined;
    if (!jwtPayload || (jwtPayload.role !== 'admin' && jwtPayload.role !== 'teknisi')) {
      return c.json({
        success: false,
        message: 'Akses ditolak: Hanya admin atau teknisi yang diperbolehkan mengubah status',
      }, 403);
    }

    const body = await c.req.json();
    const parsed = updateReportStatusSchema.safeParse(body);

    if (!parsed.success) {
      return c.json({
        success: false,
        message: 'Validasi status gagal',
        error: parsed.error.format(),
      }, 400);
    }

    const updated = await updateReportStatus(id, parsed.data.status, parsed.data.notes);
    if (!updated) {
      return c.json({
        success: false,
        message: 'Laporan tidak ditemukan',
      }, 404);
    }

    return c.json({
      success: true,
      message: 'Status laporan berhasil diperbarui',
      data: updated,
    }, 200);
  } catch (error: any) {
    return c.json({
      success: false,
      message: 'Gagal memperbarui status laporan',
      error: error.message,
    }, 500);
  }
}

/**
 * Controller untuk memperbarui prioritas laporan (Hanya Admin).
 */
export async function updateReportPriorityController(c: Context) {
  try {
    const id = c.req.param('id');
    if (!id) {
      return c.json({
        success: false,
        message: 'Format ID tidak valid',
      }, 400);
    }

    // Ambil JWT payload untuk role check
    const jwtPayload = c.get('jwtPayload') as { id: string; role: string } | undefined;
    if (!jwtPayload || jwtPayload.role !== 'admin') {
      return c.json({
        success: false,
        message: 'Akses ditolak: Hanya admin yang diperbolehkan mengubah prioritas',
      }, 403);
    }

    const body = await c.req.json();
    const parsed = updateReportPrioritySchema.safeParse(body);

    if (!parsed.success) {
      return c.json({
        success: false,
        message: 'Validasi prioritas gagal',
        error: parsed.error.format(),
      }, 400);
    }

    const updated = await updateReportPriority(id, parsed.data.priority);
    if (!updated) {
      return c.json({
        success: false,
        message: 'Laporan tidak ditemukan',
      }, 404);
    }

    return c.json({
      success: true,
      message: 'Prioritas laporan berhasil diperbarui',
      data: updated,
    }, 200);
  } catch (error: any) {
    return c.json({
      success: false,
      message: 'Gagal memperbarui prioritas laporan',
      error: error.message,
    }, 500);
  }
}

/**
 * Controller untuk memberikan umpan balik / feedback (Hanya oleh Pelapor Asli dan status 'resolved').
 */
export async function createFeedbackController(c: Context) {
  try {
    const id = c.req.param('id');
    if (!id) {
      return c.json({
        success: false,
        message: 'Format ID tidak valid',
      }, 400);
    }

    const jwtPayload = c.get('jwtPayload') as { id: string; role: string } | undefined;
    if (!jwtPayload) {
      return c.json({
        success: false,
        message: 'Pengguna tidak terautentikasi',
      }, 401);
    }

    // 1. Cek keberadaan laporan
    const report = await getReportById(id);
    if (!report) {
      return c.json({
        success: false,
        message: 'Laporan tidak ditemukan',
      }, 404);
    }

    // 2. Hanya pelapor asli yang dapat memberi feedback
    if (report.reporter.id !== jwtPayload.id) {
      return c.json({
        success: false,
        message: 'Akses ditolak: Hanya pelapor asli yang diperbolehkan memberikan feedback',
      }, 403);
    }

    // 3. Hanya laporan berstatus 'resolved' yang bisa diberi feedback
    if (report.status !== 'resolved') {
      return c.json({
        success: false,
        message: 'Feedback hanya dapat diberikan untuk laporan yang berstatus selesai (resolved)',
      }, 400);
    }

    const body = await c.req.json();
    const parsed = createFeedbackSchema.safeParse(body);

    if (!parsed.success) {
      return c.json({
        success: false,
        message: 'Validasi feedback gagal',
        error: parsed.error.format(),
      }, 400);
    }

    // 4. Simpan Feedback
    const newFeedback = await createReportFeedback({
      reportId: id,
      userId: jwtPayload.id,
      comment: parsed.data.comment,
      rating: parsed.data.rating,
    });

    return c.json({
      success: true,
      message: 'Feedback berhasil dikirim. Terima kasih!',
      data: newFeedback,
    }, 201);
  } catch (error: any) {
    return c.json({
      success: false,
      message: 'Gagal mengirimkan feedback',
      error: error.message,
    }, 500);
  }
}
