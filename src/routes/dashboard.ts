import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth.js'
import { getDashboardSummaryController } from '../controllers/dashboard.js'

const dashboardRouter = new Hono()

// Route: Mengambil ringkasan dashboard (Wajib Login, info disesuaikan dengan role)
dashboardRouter.get('/dashboard', authMiddleware, getDashboardSummaryController)

export { dashboardRouter }
