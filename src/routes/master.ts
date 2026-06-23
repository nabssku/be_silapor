import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { authMiddleware, adminMiddleware } from '../middleware/auth'
import {
  createCategorySchema,
  updateCategorySchema,
  createLocationSchema,
  updateLocationSchema
} from '../validators/master'
import {
  getAllCategoriesController,
  getCategoryByIdController,
  createCategoryController,
  updateCategoryController,
  deleteCategoryController,
  getAllLocationsController,
  getLocationByIdController,
  createLocationController,
  updateLocationController,
  deleteLocationController
} from '../controllers/master'

const masterRouter = new Hono()

// Terapkan authMiddleware ke semua rute Categories & Locations (wajib login)
masterRouter.use('*', authMiddleware)

// ==========================================
// Rute Master Categories (Kategori)
// ==========================================
masterRouter.get('/categories', getAllCategoriesController)
masterRouter.get('/categories/:id', getCategoryByIdController)
masterRouter.post('/categories', adminMiddleware, zValidator('json', createCategorySchema), createCategoryController)
masterRouter.put('/categories/:id', adminMiddleware, zValidator('json', updateCategorySchema), updateCategoryController)
masterRouter.delete('/categories/:id', adminMiddleware, deleteCategoryController)

// ==========================================
// Rute Master Locations (Lokasi)
// ==========================================
masterRouter.get('/locations', getAllLocationsController)
masterRouter.get('/locations/:id', getLocationByIdController)
masterRouter.post('/locations', adminMiddleware, zValidator('json', createLocationSchema), createLocationController)
masterRouter.put('/locations/:id', adminMiddleware, zValidator('json', updateLocationSchema), updateLocationController)
masterRouter.delete('/locations/:id', adminMiddleware, deleteLocationController)

export { masterRouter }
