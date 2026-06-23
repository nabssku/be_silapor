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
        description: 'Mendaftarkan user baru (mahasiswa, dosen, admin, teknisi) dengan NIM/NIDN unik',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'nimNidn', 'email', 'password', 'role'],
                properties: {
                  name: { type: 'string', example: 'Budi Santoso' },
                  nimNidn: { type: 'string', example: '2201010023' },
                  email: { type: 'string', example: 'budi@kampus.ac.id' },
                  password: { type: 'string', example: 'password123' },
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
        description: 'Autentikasi menggunakan NIM/NIDN/Email dan password untuk mendapatkan JWT token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['identifier', 'password'],
                properties: {
                  identifier: { type: 'string', example: '2201010023' },
                  password: { type: 'string', example: 'password123' },
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
