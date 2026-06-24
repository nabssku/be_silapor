import { Context } from 'hono'
import { getAdminSummary, getReporterSummary, getTeknisiSummary } from '../services/dashboard.js'

/**
 * Controller untuk mengambil data ringkasan dashboard berdasarkan role dari pengguna.
 */
export async function getDashboardSummaryController(c: Context) {
  try {
    const jwtPayload = c.get('jwtPayload') as { id: string; role: string } | undefined;
    if (!jwtPayload) {
      return c.json({
        success: false,
        message: 'Pengguna tidak terautentikasi',
      }, 401);
    }

    const { id, role } = jwtPayload;
    let summaryData;

    switch (role) {
      case 'admin':
        summaryData = await getAdminSummary();
        break;
      case 'teknisi':
        summaryData = await getTeknisiSummary();
        break;
      case 'mahasiswa':
      case 'dosen':
        summaryData = await getReporterSummary(id);
        break;
      default:
        return c.json({
          success: false,
          message: 'Role pengguna tidak dikenali atau tidak memiliki akses dashboard',
        }, 403);
    }

    return c.json({
      success: true,
      message: 'Berhasil mengambil ringkasan dashboard',
      data: summaryData,
    }, 200);

  } catch (error: any) {
    return c.json({
      success: false,
      message: 'Gagal mengambil ringkasan dashboard',
      error: error.message,
    }, 500);
  }
}
