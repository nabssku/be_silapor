import { drizzle } from 'drizzle-orm/neon-http';
import { neon, neonConfig } from '@neondatabase/serverless';

// Hubungkan langsung ke host database lewat HTTPS, melewati global routing proxy
// Ini menghindari timeout/error koneksi Undici (fetch) di beberapa lingkungan lokal.
neonConfig.fetchEndpoint = (host) => `https://${host}/sql`;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

const client = neon(process.env.DATABASE_URL);
export const db = drizzle({ client });


