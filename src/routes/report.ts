import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import {
  createReportController,
  getReportsController,
  getReportByIdController,
  updateReportStatusController,
  createFeedbackController
} from '../controllers/report'

const reportRouter = new Hono()

// Terapkan authMiddleware ke semua rute laporan (wajib login)
reportRouter.use('*', authMiddleware)

// Route: Membuat Laporan Kerusakan Baru (multipart/form-data)
reportRouter.post('/reports', createReportController)

// Route: Mengambil Daftar Semua Laporan
reportRouter.get('/reports', getReportsController)

// Route: Mengambil Detail Satu Laporan
reportRouter.get('/reports/:id', getReportByIdController)

// Route: Memperbarui Status Laporan (Khusus Admin / Teknisi)
reportRouter.put('/reports/:id/status', updateReportStatusController)

// Route: Mengirimkan Feedback (Khusus Reporter Asli)
reportRouter.post('/reports/:id/feedbacks', createFeedbackController)

export { reportRouter }
