import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { registerSchema, loginSchema, loginInfokhsSchema } from '../validators/auth.js'
import { registerController, loginController, loginInfokhsController } from '../controllers/auth.js'

const authRouter = new Hono()

// Route: Registrasi User Baru
authRouter.post('/register', zValidator('json', registerSchema), registerController)

// Route: Login User
authRouter.post('/login', zValidator('json', loginSchema), loginController)

// Route: Login User via InfoKHS (API UMM)
authRouter.post('/infokhs', zValidator('json', loginInfokhsSchema), loginInfokhsController)

export { authRouter }
