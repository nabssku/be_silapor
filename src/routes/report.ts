import { Hono } from 'hono'
import { authMiddleware, adminMiddleware } from '../middleware/auth.js'
import {
  createReportController,
  getReportsController,
  getReportByIdController,
  updateReportStatusController,
  updateReportPriorityController,
  createFeedbackController
} from '../controllers/report.js'

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

// Route: Memperbarui Prioritas Laporan (Khusus Admin)
reportRouter.put('/reports/:id/priority', adminMiddleware, updateReportPriorityController)

// Route: Mengirimkan Feedback (Khusus Reporter Asli)
reportRouter.post('/reports/:id/feedbacks', createFeedbackController)

export { reportRouter }
