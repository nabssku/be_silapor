import { Context } from 'hono'
import { findUserByNimOrEmail, createUser } from '../services/auth'
import { compare } from 'bcrypt-ts'
import { sign } from 'hono/jwt'

/**
 * Controller untuk menangani registrasi user baru.
 */
export async function registerController(c: Context) {
  try {
    const body = (c.req.valid as any)('json');

    // 1. Cek apakah NIM/NIDN atau Email sudah terdaftar
    const existingNim = await findUserByNimOrEmail(body.nimNidn);
    if (existingNim) {
      return c.json({
        success: false,
        message: 'NIM/NIDN sudah terdaftar di sistem',
      }, 400);
    }

    const existingEmail = await findUserByNimOrEmail(body.email);
    if (existingEmail) {
      return c.json({
        success: false,
        message: 'Email sudah terdaftar di sistem',
      }, 400);
    }

    // 2. Simpan user baru
    const newUser = await createUser({
      name: body.name,
      nimNidn: body.nimNidn,
      email: body.email,
      pic: body.pic,
      role: body.role,
    });

    return c.json({
      success: true,
      message: 'Registrasi berhasil',
      data: newUser,
    }, 201);
  } catch (error: any) {
    return c.json({
      success: false,
      message: 'Gagal melakukan registrasi',
      error: error.message,
    }, 500);
  }
}

/**
 * Controller untuk menangani login user.
 */
export async function loginController(c: Context) {
  try {
    const body = (c.req.valid as any)('json');

    // 1. Cari user berdasarkan NIM/NIDN atau Email
    const user = await findUserByNimOrEmail(body.identifier);
    if (!user) {
      return c.json({
        success: false,
        message: 'NIM/NIDN atau Email tidak terdaftar',
      }, 400);
    }

    // 2. Verifikasi password (menggunakan kolom pic)
    const isPasswordValid = await compare(body.pic, user.pic);
    if (!isPasswordValid) {
      return c.json({
        success: false,
        message: 'Password yang Anda masukkan salah',
      }, 400);
    }

    // 3. Generate JWT Token (masa aktif 24 jam)
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured in environment variables');
    }

    const payload = {
      id: user.id,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 Jam
    };

    const token = await sign(payload, jwtSecret);

    return c.json({
      success: true,
      message: 'Login berhasil',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          nimNidn: user.nimNidn,
          email: user.email,
          role: user.role,
        },
      },
    }, 200);
  } catch (error: any) {
    return c.json({
      success: false,
      message: 'Gagal melakukan login',
      error: error.message,
    }, 500);
  }
}
