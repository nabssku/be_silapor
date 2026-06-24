import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { authMiddleware, adminMiddleware } from '../middleware/auth.js'
import { createUserSchema, updateUserSchema } from '../validators/user.js'
import {
  getAllUsersController,
  getUserByIdController,
  createUserController,
  updateUserController,
  deleteUserController
} from '../controllers/user.js'

const userRouter = new Hono()

// Terapkan authMiddleware & adminMiddleware ke semua rute User (Wajib Login & Khusus Admin)
userRouter.use('*', authMiddleware, adminMiddleware)

// Rute CRUD User
userRouter.get('/users', getAllUsersController)
userRouter.get('/users/:id', getUserByIdController)
userRouter.post('/users', zValidator('json', createUserSchema), createUserController)
userRouter.put('/users/:id', zValidator('json', updateUserSchema), updateUserController)
userRouter.delete('/users/:id', deleteUserController)

export { userRouter }
