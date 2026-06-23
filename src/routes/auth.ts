import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { registerSchema, loginSchema } from '../validators/auth'
import { registerController, loginController } from '../controllers/auth'

const authRouter = new Hono()

// Route: Registrasi User Baru
authRouter.post('/register', zValidator('json', registerSchema), registerController)

// Route: Login User
authRouter.post('/login', zValidator('json', loginSchema), loginController)

export { authRouter }
