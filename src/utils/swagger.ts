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
                    data: {
                      type: 'object',
                      properties: {
                        rows: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              now: { type: 'string', example: '2026-06-23T12:00:00.000Z' },
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
  },
};
