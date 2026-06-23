import { Hono } from 'hono'
import { db } from './db/index.js'
import { sql } from 'drizzle-orm'
import { swaggerUI } from '@hono/swagger-ui'
import { swaggerSpec } from './utils/swagger'
import { authRouter } from './routes/auth'
import { masterRouter } from './routes/master'
import { reportRouter } from './routes/report'

const app = new Hono()

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

// Serve Swagger UI Documentation
app.get('/swagger/json', (c) => {
  return c.json(swaggerSpec)
})
app.get('/swagger', swaggerUI({ url: '/swagger/json' }))

export default app
