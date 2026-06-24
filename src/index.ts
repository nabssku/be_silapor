import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { db } from './db/index.js'
import { sql } from 'drizzle-orm'
import { swaggerUI } from '@hono/swagger-ui'
import { swaggerSpec } from './utils/swagger.js'
import { authRouter } from './routes/auth.js'
import { masterRouter } from './routes/master.js'
import { reportRouter } from './routes/report.js'
import { dashboardRouter } from './routes/dashboard.js'
import { userRouter } from './routes/user.js'

const app = new Hono()

// Configure CORS middleware
app.use(
  '*',
  cors({
    origin: (origin) => {
      const allowedOrigin = process.env.CORS_ORIGIN || '*'
      if (allowedOrigin === '*') {
        return origin
      }
      const allowedOrigins = allowedOrigin.split(',').map((o) => o.trim())
      return allowedOrigins.includes(origin) ? origin : allowedOrigins[0]
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  })
)

// Serve Health Check Endpoint
app.get('/', (c) => {
  return c.json({
    message: 'Welcome to Silapor REST API!',
    status: 'Running'
  })
})

// Serve Database Test Endpoint
app.get('/test-db', async (c) => {
  try {
    const result = await db.execute(sql`SELECT NOW() as now`);
    return c.json({
      success: true,
      message: 'Connection to Neon DB successful!',
      data: result
    })
  } catch (error: any) {
    return c.json({
      success: false,
      message: 'Failed to connect to Neon DB',
      error: error.message
    }, 500)
  }
})

// Register Auth Routes
app.route('/api/auth', authRouter)

// Register Master Data CRUD Routes (Categories & Locations)
app.route('/api', masterRouter)

// Register Core Feature Routes (Reports & Feedbacks)
app.route('/api', reportRouter)

// Register Dashboard Route
app.route('/api', dashboardRouter)

// Register User CRUD Routes (Admin Only)
app.route('/api', userRouter)

// Serve Swagger UI Documentation
app.get('/swagger/json', (c) => {
  return c.json(swaggerSpec)
})
app.get('/swagger', swaggerUI({ url: '/swagger/json' }))

export default app
