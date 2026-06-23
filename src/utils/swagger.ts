export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Silapor REST API Documentation',
    version: '1.0.0',
    description: 'REST API untuk Sistem Pelaporan dan Monitoring Kerusakan Fasilitas Kampus Berbasis Web (Mahasiswa, Dosen, Admin, & Teknisi)',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local Development Server',
    },
  ],
  security: [
    {
      BearerAuth: [],
    },
  ],
  paths: {
    '/': {
      get: {
        tags: ['System'],
        summary: 'Health Check / Welcome',
        description: 'Mengecek status running dari API Hono',
        responses: {
          200: {
            description: 'API is running successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Welcome to Silapor REST API!' },
                    status: { type: 'string', example: 'Running' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/test-db': {
      get: {
        tags: ['System'],
        summary: 'Test Database Connection',
        description: 'Mengecek apakah API Hono terhubung dengan sukses ke Neon DB',
        responses: {
          200: {
            description: 'Koneksi database berhasil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Connection to Neon DB successful!' },
                    data: { type: 'object' },
                  },
                },
              },
            },
          },
          500: {
            description: 'Koneksi database gagal',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string', example: 'Failed to connect to Neon DB' },
                    error: { type: 'string', example: 'Connection refused' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register User Baru',
        description: 'Mendaftarkan user baru (mahasiswa, dosen, admin, teknisi) dengan NIM/NIDN unik. Kolom kata sandi diwakili oleh kolom pic.',
        security: [], // Tidak butuh token JWT
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'nimNidn', 'email', 'pic', 'role'],
                properties: {
                  name: { type: 'string', example: 'Budi Santoso' },
                  nimNidn: { type: 'string', example: '2201010023' },
                  email: { type: 'string', example: 'budi@kampus.ac.id' },
                  pic: { type: 'string', example: 'password123' },
                  role: { type: 'string', enum: ['mahasiswa', 'dosen', 'admin', 'teknisi'], example: 'mahasiswa' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Registrasi berhasil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Registrasi berhasil' },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
                        name: { type: 'string', example: 'Budi Santoso' },
                        nimNidn: { type: 'string', example: '2201010023' },
                        email: { type: 'string', example: 'budi@kampus.ac.id' },
                        role: { type: 'string', example: 'mahasiswa' },
                        createdAt: { type: 'string', example: '2026-06-23T12:00:00.000Z' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Bad Request / NIM atau Email sudah terdaftar',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string', example: 'NIM/NIDN sudah terdaftar di sistem' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login User',
        description: 'Autentikasi menggunakan NIM/NIDN/Email dan kata sandi (kolom pic) untuk mendapatkan JWT token',
        security: [], // Tidak butuh token JWT
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['identifier', 'pic'],
                properties: {
                  identifier: { type: 'string', example: '2201010023' },
                  pic: { type: 'string', example: 'password123' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login berhasil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Login berhasil' },
                    data: {
                      type: 'object',
                      properties: {
                        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                        user: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
                            name: { type: 'string', example: 'Budi Santoso' },
                            nimNidn: { type: 'string', example: '2201010023' },
                            email: { type: 'string', example: 'budi@kampus.ac.id' },
                            role: { type: 'string', example: 'mahasiswa' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Kredensial salah / User tidak ditemukan',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string', example: 'Password yang Anda masukkan salah' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/categories': {
      get: {
        tags: ['Master Categories'],
        summary: 'Get All Categories',
        description: 'Mengambil semua data kategori fasilitas (Wajib Login)',
        responses: {
          200: {
            description: 'Berhasil mengambil daftar kategori',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Berhasil mengambil daftar kategori' },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer', example: 1 },
                          name: { type: 'string', example: 'Listrik / AC' },
                          description: { type: 'string', example: 'Masalah kelistrikan, stop kontak, AC mati, dll.' },
                          createdAt: { type: 'string', example: '2026-06-23T12:00:00.000Z' },
                          updatedAt: { type: 'string', example: '2026-06-23T12:00:00.000Z' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Master Categories'],
        summary: 'Create Category',
        description: 'Membuat kategori fasilitas baru (Khusus Admin)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'Listrik / AC' },
                  description: { type: 'string', example: 'Masalah kelistrikan, stop kontak, AC mati, dll.' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Kategori berhasil dibuat',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Kategori berhasil dibuat' },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'Listrik / AC' },
                        description: { type: 'string', example: 'Masalah kelistrikan, stop kontak, AC mati, dll.' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Bad Request / Kategori sudah terdaftar',
          },
          403: {
            description: 'Akses ditolak: Hanya administrator yang diperbolehkan',
          },
        },
      },
    },
    '/api/categories/{id}': {
      get: {
        tags: ['Master Categories'],
        summary: 'Get Category By ID',
        description: 'Mengambil data detail kategori berdasarkan ID (Wajib Login)',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            example: 1,
          },
        ],
        responses: {
          200: {
            description: 'Berhasil mengambil data kategori',
          },
          404: {
            description: 'Kategori tidak ditemukan',
          },
        },
      },
      put: {
        tags: ['Master Categories'],
        summary: 'Update Category By ID',
        description: 'Memperbarui data kategori berdasarkan ID (Khusus Admin)',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            example: 1,
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Kelistrikan & AC' },
                  description: { type: 'string', example: 'Semua peralatan listrik dan pendingin ruangan' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Kategori berhasil diperbarui',
          },
          403: {
            description: 'Akses ditolak',
          },
          404: {
            description: 'Kategori tidak ditemukan',
          },
        },
      },
      delete: {
        tags: ['Master Categories'],
        summary: 'Delete Category By ID',
        description: 'Menghapus kategori berdasarkan ID (Khusus Admin)',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            example: 1,
          },
        ],
        responses: {
          200: {
            description: 'Kategori berhasil dihapus',
          },
          403: {
            description: 'Akses ditolak',
          },
          404: {
            description: 'Kategori tidak ditemukan',
          },
        },
      },
    },
    '/api/locations': {
      get: {
        tags: ['Master Locations'],
        summary: 'Get All Locations',
        description: 'Mengambil semua data lokasi (Wajib Login)',
        responses: {
          200: {
            description: 'Berhasil mengambil daftar lokasi',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Berhasil mengambil daftar lokasi' },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer', example: 1 },
                          name: { type: 'string', example: 'Gedung Rektorat Lt. 2' },
                          description: { type: 'string', example: 'Ruang Staff, Dekan, dll.' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Master Locations'],
        summary: 'Create Location',
        description: 'Membuat lokasi baru (Khusus Admin)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'Gedung Rektorat Lt. 2' },
                  description: { type: 'string', example: 'Ruang Staff, Dekan, dll.' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Lokasi berhasil dibuat',
          },
          400: {
            description: 'Nama lokasi sudah ada',
          },
          403: {
            description: 'Akses ditolak',
          },
        },
      },
    },
    '/api/locations/{id}': {
      get: {
        tags: ['Master Locations'],
        summary: 'Get Location By ID',
        description: 'Mengambil data detail lokasi berdasarkan ID (Wajib Login)',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            example: 1,
          },
        ],
        responses: {
          200: {
            description: 'Berhasil mengambil data lokasi',
          },
          404: {
            description: 'Lokasi tidak ditemukan',
          },
        },
      },
      put: {
        tags: ['Master Locations'],
        summary: 'Update Location By ID',
        description: 'Memperbarui data lokasi berdasarkan ID (Khusus Admin)',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            example: 1,
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Gedung Rektorat Lantai 2' },
                  description: { type: 'string', example: 'Ruang Staff Akademik' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Lokasi berhasil diperbarui',
          },
          403: {
            description: 'Akses ditolak',
          },
          404: {
            description: 'Lokasi tidak ditemukan',
          },
        },
      },
      delete: {
        tags: ['Master Locations'],
        summary: 'Delete Location By ID',
        description: 'Menghapus lokasi berdasarkan ID (Khusus Admin)',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            example: 1,
          },
        ],
        responses: {
          200: {
            description: 'Lokasi berhasil dihapus',
          },
          403: {
            description: 'Akses ditolak',
          },
          404: {
            description: 'Lokasi tidak ditemukan',
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};
