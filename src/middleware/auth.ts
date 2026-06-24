import { Context, Next } from 'hono'
import { jwt } from 'hono/jwt'

/**
 * Middleware untuk memvalidasi token JWT.
 */
export const authMiddleware = (c: Context, next: Next) => {
  if (c.req.method === 'OPTIONS') {
    return next();
  }
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured in environment variables');
  }
  return jwt({ secret: jwtSecret, alg: 'HS256' })(c, next);
};

/**
 * Middleware untuk membatasi akses khusus untuk role 'admin'.
 */
export const adminMiddleware = async (c: Context, next: Next) => {
  if (c.req.method === 'OPTIONS') {
    return next();
  }
  const payload = c.get('jwtPayload') as { id: string; role: string } | undefined;
  if (!payload || payload.role !== 'admin') {
    return c.json({
      success: false,
      message: 'Akses ditolak: Hanya administrator yang diperbolehkan',
    }, 403);
  }
  await next();
};

