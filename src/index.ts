import { Hono } from 'hono'
import { db } from './db'
import { sql } from 'drizzle-orm'

const app = new Hono()

app.get('/', (c) => {
  return c.json({
    message: 'Welcome to Silapor REST API!',
    status: 'Running'
  })
})

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

export default app
