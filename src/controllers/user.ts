import { Context } from 'hono'
import {
  getUsers,
  getUserById,
  findUserByNimOrEmailExcept,
  createUser,
  updateUser,
  deleteUser
} from '../services/user.js'
import { findUserByNimOrEmail } from '../services/auth.js'

/**
 * Controller untuk mengambil semua daftar user.
 */
export async function getAllUsersController(c: Context) {
  try {
    const list = await getUsers();
    return c.json({
      success: true,
      message: 'Berhasil mengambil daftar user',
      data: list,
    }, 200);
  } catch (error: any) {
    return c.json({
      success: false,
      message: 'Gagal mengambil daftar user',
      error: error.message,
    }, 500);
  }
}

/**
 * Controller untuk mengambil detail user berdasarkan ID.
 */
export async function getUserByIdController(c: Context) {
  try {
    const id = c.req.param('id');
    const user = await getUserById(id);
    if (!user) {
      return c.json({
        success: false,
        message: 'User tidak ditemukan',
      }, 404);
    }
    return c.json({
      success: true,
      message: 'Berhasil mengambil detail user',
      data: user,
    }, 200);
  } catch (error: any) {
    return c.json({
      success: false,
      message: 'Gagal mengambil detail user',
      error: error.message,
    }, 500);
  }
}

/**
 * Controller untuk membuat user baru.
 */
export async function createUserController(c: Context) {
  try {
    const body = (c.req.valid as any)('json');

    // Cek apakah NIM/NIDN atau Email sudah terdaftar
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

    const newUser = await createUser(body);
    return c.json({
      success: true,
      message: 'User berhasil dibuat',
      data: newUser,
    }, 201);
  } catch (error: any) {
    return c.json({
      success: false,
      message: 'Gagal membuat user',
      error: error.message,
    }, 500);
  }
}

/**
 * Controller untuk memperbarui data user.
 */
export async function updateUserController(c: Context) {
  try {
    const id = c.req.param('id');
    const body = (c.req.valid as any)('json');

    // Cek apakah user ada
    const user = await getUserById(id);
    if (!user) {
      return c.json({
        success: false,
        message: 'User tidak ditemukan',
      }, 404);
    }

    // Jika ingin mengubah NIM/NIDN, cek keunikan NIM/NIDN baru
    if (body.nimNidn) {
      const existing = await findUserByNimOrEmailExcept(id, body.nimNidn);
      if (existing) {
        return c.json({
          success: false,
          message: 'NIM/NIDN sudah digunakan oleh user lain',
        }, 400);
      }
    }

    // Jika ingin mengubah Email, cek keunikan Email baru
    if (body.email) {
      const existing = await findUserByNimOrEmailExcept(id, body.email);
      if (existing) {
        return c.json({
          success: false,
          message: 'Email sudah digunakan oleh user lain',
        }, 400);
      }
    }

    const updatedUser = await updateUser(id, body);
    return c.json({
      success: true,
      message: 'User berhasil diperbarui',
      data: updatedUser,
    }, 200);
  } catch (error: any) {
    return c.json({
      success: false,
      message: 'Gagal memperbarui data user',
      error: error.message,
    }, 500);
  }
}

/**
 * Controller untuk menghapus user.
 */
export async function deleteUserController(c: Context) {
  try {
    const id = c.req.param('id');

    // Cek apakah user ada
    const user = await getUserById(id);
    if (!user) {
      return c.json({
        success: false,
        message: 'User tidak ditemukan',
      }, 404);
    }

    const deleted = await deleteUser(id);
    return c.json({
      success: true,
      message: 'User berhasil dihapus',
      data: deleted,
    }, 200);
  } catch (error: any) {
    return c.json({
      success: false,
      message: 'Gagal menghapus user',
      error: error.message,
    }, 500);
  }
}
