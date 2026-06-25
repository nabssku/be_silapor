import { Context } from 'hono'
import { findUserByNimOrEmail, createUser } from '../services/auth.js'
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

/**
 * Controller untuk menangani login user via API UMM (InfoKHS).
 */
export async function loginInfokhsController(c: Context) {
  try {
    const body = (c.req.valid as any)('json');
    const { nim: inputNim, pic: inputPic } = body;

    // 0. Dapatkan token dinamis untuk x-signature dari API UMM
    const tokenResponse = await fetch('https://apiv2.umm.ac.id/v2/user/gettoken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'myumm',
        password: 'myummstudentstartfrom2022',
      }),
    });

    if (!tokenResponse.ok) {
      return c.json({
        success: false,
        message: 'Gagal mendapatkan token keamanan UMM',
        error: `HTTP error! status: ${tokenResponse.status}`
      }, 400);
    }

    const tokenResult = (await tokenResponse.json()) as any;
    if (tokenResult.status !== 1 || !tokenResult.data?.token) {
      return c.json({
        success: false,
        message: tokenResult.message || 'Gagal mendapatkan token keamanan UMM',
      }, 400);
    }

    const xSignature = tokenResult.data.token;

    // Format timestamp secara dinamis (YYYY-MM-DD HH:mm:ss)
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formattedTimestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    // 1. Kirim request POST ke API UMM (apiv2.umm.ac.id)
    const response = await fetch('https://apiv2.umm.ac.id/v2/mahasiswa/login', {
      method: 'POST',
      headers: {
        'x-signature': xSignature,
        'Content-Type': 'application/json',
        'Connection': 'keep-alive',
        'x-timestamp': formattedTimestamp,
        'x-userkey': 'e48e16475b1073b6b79bf4503bf046a4',
        'Accept': 'application/json',
        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'User-Agent': 'myUMMStudents/5 CFNetwork/3860.600.12 Darwin/25.5.0'
      },
      body: JSON.stringify({
        xuser: inputNim,
        xpassword: inputPic,
        device_model: 2,
        device_id: 'iPhone12,1',
        nama_device: 'iPhone',
        uniq_id: 'B850BA89-CC1E-4135-927A-67CBBDF573C2'
      })
    });

    if (!response.ok) {
      return c.json({
        success: false,
        message: 'Gagal menghubungi server UMM',
        error: `HTTP error! status: ${response.status}`
      }, 400);
    }

    const result = (await response.json()) as any;

    // 2. Validasi response dari API UMM
    if (result.status !== 1 || result.kode !== '000') {
      return c.json({
        success: false,
        message: result.message || 'Login via InfoKHS gagal',
      }, 401);
    }

    const { nim, nama, fakultas } = result.data;

    // 2.5. Ambil biodata lengkap dari API UMM
    let biodata: any = null;
    try {
      const biodataRes = await fetch(`https://apiv2.umm.ac.id/v1/mahasiswa/biodata/58fe1d8e3395cd9e6df82d959bcde17f/${nim}`);
      if (biodataRes.ok) {
        const biodataJson = (await biodataRes.json()) as any;
        if (biodataJson.status === 1 && biodataJson.data && biodataJson.data.length > 0) {
          const records = biodataJson.data[0];
          const innerRecords = records ? records[''] : null;
          if (innerRecords && innerRecords.length > 0) {
            biodata = innerRecords[0];
          }
        }
      }
    } catch (e) {
      console.error('Gagal mengambil biodata dari UMM:', e);
    }

    // 3. Cek apakah user sudah terdaftar di sistem lokal
    let userId: string;
    let userRole: 'mahasiswa' | 'dosen' | 'admin' | 'teknisi';
    let userNim: string;
    let userName: string;

    const existingUser = await findUserByNimOrEmail(nim);
    if (!existingUser) {
      // Auto-register user baru jika belum terdaftar
      const userEmail = biodata?.email || `${nim}@student.umm.ac.id`;
      const newUser = await createUser({
        name: nama,
        nimNidn: nim,
        email: userEmail,
        pic: inputPic,
        role: 'mahasiswa',
      });
      userId = newUser.id;
      userRole = newUser.role;
      userNim = newUser.nimNidn;
      userName = newUser.name;
    } else {
      userId = existingUser.id;
      userRole = existingUser.role;
      userNim = existingUser.nimNidn;
      userName = existingUser.name;
    }

    // 4. Generate JWT Token (masa aktif 24 jam)
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured in environment variables');
    }

    const payload = {
      id: userId,
      role: userRole,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 Jam
    };

    const token = await sign(payload, jwtSecret);

    return c.json({
      success: true,
      message: 'Login berhasil',
      data: {
        nim: userNim,
        nama: userName,
        fakultas: fakultas || 'Fakultas Teknik',
        token,
        biodata,
      },
    }, 200);

  } catch (error: any) {
    return c.json({
      success: false,
      message: 'Gagal melakukan login via InfoKHS',
      error: error.message,
    }, 500);
  }
}

