import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';

// Diperlukan agar WebSocket berjalan di lingkungan Node.js (seperti saat running local dev server)
(async () => {
  if (typeof globalThis.WebSocket === 'undefined') {
    const ws = await import('ws');
    neonConfig.webSocketConstructor = ws.default || ws;
  }
})();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool });
