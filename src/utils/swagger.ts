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
        summary: 'Health Check / Welcome [Public]',
        description: 'Mengecek status running dari API Hono',
        security: [],
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
        summary: 'Test Database Connection [Public]',
        description: 'Mengecek apakah API Hono terhubung dengan sukses ke Neon DB',
        security: [],
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
        summary: 'Register User Baru [Public]',
        description: 'Mendaftarkan user baru (mahasiswa, dosen, admin, teknisi) dengan NIM/NIDN unik. Kolom kata sandi diwakili oleh kolom pic.',
        security: [],
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
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login User [Public]',
        description: 'Autentikasi menggunakan NIM/NIDN/Email dan kata sandi (kolom pic) untuk mendapatkan JWT token',
        security: [],
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
          },
        },
      },
    },
    '/api/auth/infokhs': {
      post: {
        tags: ['Authentication'],
        summary: 'Login User via InfoKHS (API UMM) [Public]',
        description: 'Autentikasi mahasiswa menggunakan NIM (nim) dan password (pic) yang diteruskan ke API UMM (InfoKHS). Jika berhasil, user akan otomatis didaftarkan (bila belum terdaftar) dan mendapatkan local JWT token.',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nim', 'pic'],
                properties: {
                  nim: { type: 'string', example: '202410370110357', description: 'NIM Mahasiswa' },
                  pic: { type: 'string', example: '15841268', description: 'Password/PIC Mahasiswa' },
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
                        nim: { type: 'string', example: '202410370110357' },
                        nama: { type: 'string', example: 'Nabil Sahsada Suratno' },
                        fakultas: { type: 'string', example: 'Fakultas Teknik' },
                        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Login via InfoKHS gagal (kredensial salah)',
          },
          400: {
            description: 'Gagal menghubungi server UMM / Input tidak valid',
          },
        },
      },
    },
    '/api/categories': {
      get: {
        tags: ['Master Categories'],
        summary: 'Get All Categories [Semua Role (Wajib Login)]',
        description: 'Mengambil semua data kategori fasilitas (Bisa diakses oleh role mahasiswa, dosen, admin, dan teknisi)',
        responses: {
          200: {
            description: 'Berhasil mengambil daftar kategori',
          },
        },
      },
      post: {
        tags: ['Master Categories'],
        summary: 'Create Category [Khusus Admin]',
        description: 'Membuat kategori fasilitas baru (Hanya dapat diakses oleh role admin)',
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
          },
          403: {
            description: 'Akses ditolak',
          },
        },
      },
    },
    '/api/categories/{id}': {
      get: {
        tags: ['Master Categories'],
        summary: 'Get Category By ID [Semua Role (Wajib Login)]',
        description: 'Mengambil data detail kategori berdasarkan ID (Bisa diakses oleh semua role)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Berhasil' },
          404: { description: 'Tidak ditemukan' },
        },
      },
      put: {
        tags: ['Master Categories'],
        summary: 'Update Category By ID [Khusus Admin]',
        description: 'Memperbarui data kategori berdasarkan ID (Hanya dapat diakses oleh role admin)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Berhasil' },
          403: { description: 'Akses ditolak' },
        },
      },
      delete: {
        tags: ['Master Categories'],
        summary: 'Delete Category By ID [Khusus Admin]',
        description: 'Menghapus kategori berdasarkan ID (Hanya dapat diakses oleh role admin)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Berhasil' },
          403: { description: 'Akses ditolak' },
        },
      },
    },
    '/api/locations': {
      get: {
        tags: ['Master Locations'],
        summary: 'Get All Locations [Semua Role (Wajib Login)]',
        description: 'Mengambil semua data lokasi (Bisa diakses oleh role mahasiswa, dosen, admin, dan teknisi)',
        responses: {
          200: {
            description: 'Berhasil mengambil daftar lokasi',
          },
        },
      },
      post: {
        tags: ['Master Locations'],
        summary: 'Create Location [Khusus Admin]',
        description: 'Membuat lokasi baru (Hanya dapat diakses oleh role admin)',
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
          201: { description: 'Lokasi berhasil dibuat' },
          403: { description: 'Akses ditolak' },
        },
      },
    },
    '/api/locations/{id}': {
      get: {
        tags: ['Master Locations'],
        summary: 'Get Location By ID [Semua Role (Wajib Login)]',
        description: 'Mengambil data detail lokasi berdasarkan ID (Bisa diakses oleh semua role)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Berhasil' },
          404: { description: 'Tidak ditemukan' },
        },
      },
      put: {
        tags: ['Master Locations'],
        summary: 'Update Location By ID [Khusus Admin]',
        description: 'Memperbarui data lokasi berdasarkan ID (Hanya dapat diakses oleh role admin)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Berhasil' },
          403: { description: 'Akses ditolak' },
        },
      },
      delete: {
        tags: ['Master Locations'],
        summary: 'Delete Location By ID [Khusus Admin]',
        description: 'Menghapus lokasi berdasarkan ID (Hanya dapat diakses oleh role admin)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Berhasil' },
          403: { description: 'Akses ditolak' },
        },
      },
    },
    '/api/reports': {
      post: {
        tags: ['Reports'],
        summary: 'Create Report (Kirim Laporan) [Semua Role (Wajib Login)]',
        description: 'Mengirimkan laporan kerusakan fasilitas kampus baru beserta foto. Input menggunakan format multipart/form-data. (Bisa diakses oleh semua role, umumnya mahasiswa dan dosen)',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['title', 'description', 'categoryId', 'locationId', 'photo'],
                properties: {
                  title: { type: 'string', example: 'Kipas Angin Kelas Rusak' },
                  description: { type: 'string', example: 'Kipas angin di kelas 3.02 bergoyang kencang dan tidak berputar.' },
                  categoryId: { type: 'string', example: '1' },
                  locationId: { type: 'string', example: '2' },
                   photo: { type: 'string', format: 'binary', description: 'File gambar kerusakan (jpg, png, dll.)' },
                  priority: { type: 'string', enum: ['rendah', 'sedang', 'tinggi'], example: 'sedang', description: 'Tingkat prioritas laporan (opsional, default: sedang)' },
                  notes: { type: 'string', example: 'Kondisi sangat mendesak karena kelas digunakan setiap hari.', description: 'Catatan tambahan saat membuat laporan (opsional)' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Laporan berhasil dibuat',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Laporan kerusakan berhasil dikirim' },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'b1d034ee-0c0b-4ef8-bb6d-6bb9bd380a11' },
                        title: { type: 'string', example: 'Kipas Angin Kelas Rusak' },
                        description: { type: 'string', example: 'Kipas angin di kelas 3.02 bergoyang kencang dan tidak berputar.' },
                        photoUrl: { type: 'string', example: 'https://res.cloudinary.com/demo/image/upload/v1570975200/sample.jpg' },
                        status: { type: 'string', example: 'pending' },
                        priority: { type: 'string', example: 'sedang' },
                        notes: { type: 'string', nullable: true, example: 'Kondisi sangat mendesak karena kelas digunakan setiap hari.' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validasi input gagal / Foto tidak diunggah',
          },
        },
      },
      get: {
        tags: ['Reports'],
        summary: 'Get All Reports [Semua Role (Wajib Login)]',
        description: 'Mengambil daftar seluruh laporan kerusakan dengan filter opsional (Bisa diakses oleh semua role: mahasiswa, dosen, admin, teknisi)',
        parameters: [
          { name: 'status', in: 'query', required: false, schema: { type: 'string', enum: ['pending', 'in_progress', 'resolved', 'rejected'] } },
          { name: 'categoryId', in: 'query', required: false, schema: { type: 'integer' } },
          { name: 'locationId', in: 'query', required: false, schema: { type: 'integer' } },
        ],
        responses: {
          200: {
            description: 'Berhasil mengambil daftar laporan',
          },
        },
      },
    },
    '/api/reports/{id}': {
      get: {
        tags: ['Reports'],
        summary: 'Get Report By ID [Semua Role (Wajib Login)]',
        description: 'Mengambil rincian detail laporan kerusakan beserta feedback yang terkait (Bisa diakses oleh semua role)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Berhasil' },
          404: { description: 'Laporan tidak ditemukan' },
        },
      },
    },
    '/api/reports/{id}/status': {
      put: {
        tags: ['Reports'],
        summary: 'Update Report Status [Khusus Admin / Teknisi]',
        description: 'Memperbarui status penanganan laporan (Hanya dapat diakses oleh role admin dan teknisi)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['pending', 'in_progress', 'resolved', 'rejected'], example: 'in_progress' },
                  notes: { type: 'string', example: 'Teknisi sedang menjadwalkan perbaikan AC pada siang hari.', description: 'Catatan tambahan terkait perubahan status laporan (opsional)' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Status berhasil diperbarui' },
          403: { description: 'Akses ditolak: Hanya admin atau teknisi yang diperbolehkan mengubah status' },
          404: { description: 'Laporan tidak ditemukan' },
        },
      },
    },
    '/api/reports/{id}/priority': {
      put: {
        tags: ['Reports'],
        summary: 'Update Report Priority [Khusus Admin]',
        description: 'Memperbarui tingkat prioritas penanganan laporan (Hanya dapat diakses oleh role admin)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['priority'],
                properties: {
                  priority: { type: 'string', enum: ['rendah', 'sedang', 'tinggi'], example: 'tinggi', description: 'Tingkat prioritas baru' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Prioritas berhasil diperbarui',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Prioritas laporan berhasil diperbarui' },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'b1d034ee-0c0b-4ef8-bb6d-6bb9bd380a11' },
                        title: { type: 'string', example: 'Kipas Angin Kelas Rusak' },
                        priority: { type: 'string', example: 'tinggi' },
                        updatedAt: { type: 'string', example: '2026-06-23T12:00:00.000Z' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: 'Validasi prioritas gagal' },
          403: { description: 'Akses ditolak: Hanya admin yang diperbolehkan mengubah prioritas' },
          404: { description: 'Laporan tidak ditemukan' },
        },
      },
    },
    '/api/reports/{id}/assign': {
      put: {
        tags: ['Reports'],
        summary: 'Assign Technician to Report [Khusus Admin]',
        description: 'Menugaskan teknisi (user dengan role teknisi) ke laporan kerusakan (Hanya dapat diakses oleh role admin)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['technicianId'],
                properties: {
                  technicianId: { type: 'string', format: 'uuid', nullable: true, example: 'd034eebb-0c0b-4ef8-bb6d-6bb9bd380a11', description: 'ID user teknisi yang akan ditugaskan. Isi null untuk mengosongkan tugas.' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Teknisi berhasil ditugaskan',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Teknisi berhasil ditugaskan ke laporan' },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'b1d034ee-0c0b-4ef8-bb6d-6bb9bd380a11' },
                        title: { type: 'string', example: 'Kipas Angin Kelas Rusak' },
                        technicianId: { type: 'string', nullable: true, example: 'd034eebb-0c0b-4ef8-bb6d-6bb9bd380a11' },
                        updatedAt: { type: 'string', example: '2026-06-23T12:00:00.000Z' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: 'Validasi gagal / User bukan teknisi' },
          403: { description: 'Akses ditolak: Hanya admin yang diperbolehkan' },
          404: { description: 'Laporan tidak ditemukan' },
        },
      },
    },
    '/api/reports/{id}/completion-photo': {
      put: {
        tags: ['Reports'],
        summary: 'Upload Completion Photo [Khusus Teknisi]',
        description: 'Mengunggah foto bukti pengerjaan laporan kerusakan yang selesai (Hanya dapat diakses oleh role teknisi)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['photo'],
                properties: {
                  photo: { type: 'string', format: 'binary', description: 'File gambar bukti pengerjaan (jpg, png, dll.)' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Foto bukti pengerjaan berhasil diunggah',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Foto bukti pengerjaan berhasil diunggah' },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'b1d034ee-0c0b-4ef8-bb6d-6bb9bd380a11' },
                        title: { type: 'string', example: 'Kipas Angin Kelas Rusak' },
                        completionPhotoUrl: { type: 'string', example: 'https://res.cloudinary.com/demo/image/upload/v1570975200/sample.jpg' },
                        updatedAt: { type: 'string', example: '2026-06-23T12:00:00.000Z' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: 'Foto bukti wajib diunggah' },
          403: { description: 'Akses ditolak: Hanya teknisi yang diperbolehkan' },
          404: { description: 'Laporan tidak ditemukan' },
        },
      },
    },
    '/api/reports/{id}/feedbacks': {
      post: {
        tags: ['Reports'],
        summary: 'Submit Feedback [Khusus Pelapor Asli (Pembuat Laporan)]',
        description: 'Mengirimkan umpan balik komentar & rating kepuasan (1-5) untuk laporan yang sudah berstatus resolved (Hanya dapat diakses oleh user pembuat laporan asli)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['comment', 'rating'],
                properties: {
                  comment: { type: 'string', example: 'Pengerjaan cepat sekali, AC sekarang sudah dingin kembali!' },
                  rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Feedback berhasil dikirim' },
          400: { description: 'Laporan belum diselesaikan / validasi gagal' },
          403: { description: 'Bukan pelapor asli' },
        },
      },
    },
    '/api/dashboard': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get Dashboard Summary [Semua Role (Wajib Login)]',
        description: 'Mengambil data ringkasan dashboard yang disesuaikan secara dinamis berdasarkan role JWT token pengguna. Struktur response berbeda untuk admin, teknisi, dan reporter (mahasiswa/dosen).',
        responses: {
          200: {
            description: 'Berhasil mengambil ringkasan dashboard',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Berhasil mengambil ringkasan dashboard' },
                    data: {
                      type: 'object',
                      description: 'Struktur data summary dinamis berdasarkan role (admin, teknisi, reporter).',
                    }
                  }
                }
              }
            }
          },
          401: { description: 'Pengguna tidak terautentikasi / Token JWT tidak valid' },
          403: { description: 'Akses ditolak / Role tidak valid' }
        }
      }
    },
    '/api/users': {
      get: {
        tags: ['Master Users'],
        summary: 'Get All Users [Khusus Admin]',
        description: 'Mengambil semua daftar pengguna yang terdaftar di dalam sistem.',
        responses: {
          200: {
            description: 'Daftar pengguna berhasil diambil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Berhasil mengambil daftar user' },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', example: 'd034eebb-0c0b-4ef8-bb6d-6bb9bd380a11' },
                          name: { type: 'string', example: 'Budi Santoso' },
                          nimNidn: { type: 'string', example: '2201010023' },
                          email: { type: 'string', example: 'budi@kampus.ac.id' },
                          role: { type: 'string', example: 'mahasiswa' },
                          createdAt: { type: 'string', example: '2026-06-23T12:00:00.000Z' },
                          updatedAt: { type: 'string', example: '2026-06-23T12:00:00.000Z' }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          401: { description: 'Pengguna tidak terautentikasi / Token JWT tidak valid' },
          403: { description: 'Akses ditolak: Hanya admin yang diperbolehkan' }
        }
      },
      post: {
        tags: ['Master Users'],
        summary: 'Create User Baru [Khusus Admin]',
        description: 'Membuat akun pengguna baru dengan role tertentu.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'nimNidn', 'email', 'pic', 'role'],
                properties: {
                  name: { type: 'string', example: 'Dedi Irawan' },
                  nimNidn: { type: 'string', example: '2201010044' },
                  email: { type: 'string', example: 'dedi@kampus.ac.id' },
                  pic: { type: 'string', example: 'password123', description: 'Password akun user' },
                  role: { type: 'string', enum: ['mahasiswa', 'dosen', 'admin', 'teknisi'], example: 'teknisi' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'User berhasil dibuat',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'User berhasil dibuat' },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'd034eebb-0c0b-4ef8-bb6d-6bb9bd380a11' },
                        name: { type: 'string', example: 'Dedi Irawan' },
                        nimNidn: { type: 'string', example: '2201010044' },
                        email: { type: 'string', example: 'dedi@kampus.ac.id' },
                        role: { type: 'string', example: 'teknisi' },
                        createdAt: { type: 'string', example: '2026-06-23T12:00:00.000Z' },
                        updatedAt: { type: 'string', example: '2026-06-23T12:00:00.000Z' }
                      }
                    }
                  }
                }
              }
            }
          },
          400: { description: 'Validasi gagal / NIM atau Email sudah terdaftar' },
          401: { description: 'Pengguna tidak terautentikasi' },
          403: { description: 'Akses ditolak' }
        }
      }
    },
    '/api/users/{id}': {
      get: {
        tags: ['Master Users'],
        summary: 'Get User By ID [Khusus Admin]',
        description: 'Mengambil detail informasi satu pengguna berdasarkan ID.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Detail user berhasil diambil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Berhasil mengambil detail user' },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'd034eebb-0c0b-4ef8-bb6d-6bb9bd380a11' },
                        name: { type: 'string', example: 'Budi Santoso' },
                        nimNidn: { type: 'string', example: '2201010023' },
                        email: { type: 'string', example: 'budi@kampus.ac.id' },
                        role: { type: 'string', example: 'mahasiswa' },
                        createdAt: { type: 'string', example: '2026-06-23T12:00:00.000Z' },
                        updatedAt: { type: 'string', example: '2026-06-23T12:00:00.000Z' }
                      }
                    }
                  }
                }
              }
            }
          },
          401: { description: 'Pengguna tidak terautentikasi' },
          403: { description: 'Akses ditolak' },
          404: { description: 'User tidak ditemukan' }
        }
      },
      put: {
        tags: ['Master Users'],
        summary: 'Update User By ID [Khusus Admin]',
        description: 'Memperbarui data pengguna berdasarkan ID.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Budi Santoso Nugroho' },
                  nimNidn: { type: 'string', example: '2201010023' },
                  email: { type: 'string', example: 'budi_new@kampus.ac.id' },
                  pic: { type: 'string', example: 'newpassword123', description: 'Password baru (opsional)' },
                  role: { type: 'string', enum: ['mahasiswa', 'dosen', 'admin', 'teknisi'], example: 'mahasiswa' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'User berhasil diperbarui',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'User berhasil diperbarui' },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'd034eebb-0c0b-4ef8-bb6d-6bb9bd380a11' },
                        name: { type: 'string', example: 'Budi Santoso Nugroho' },
                        nimNidn: { type: 'string', example: '2201010023' },
                        email: { type: 'string', example: 'budi_new@kampus.ac.id' },
                        role: { type: 'string', example: 'mahasiswa' },
                        createdAt: { type: 'string', example: '2026-06-23T12:00:00.000Z' },
                        updatedAt: { type: 'string', example: '2026-06-23T12:00:00.000Z' }
                      }
                    }
                  }
                }
              }
            }
          },
          400: { description: 'Validasi gagal / NIM atau Email sudah terdaftar pada user lain' },
          401: { description: 'Pengguna tidak terautentikasi' },
          403: { description: 'Akses ditolak' },
          404: { description: 'User tidak ditemukan' }
        }
      },
      delete: {
        tags: ['Master Users'],
        summary: 'Delete User By ID [Khusus Admin]',
        description: 'Menghapus akun pengguna dari sistem berdasarkan ID.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'User berhasil dihapus',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'User berhasil dihapus' },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'd034eebb-0c0b-4ef8-bb6d-6bb9bd380a11' },
                        name: { type: 'string', example: 'Budi Santoso Nugroho' },
                        nimNidn: { type: 'string', example: '2201010023' },
                        email: { type: 'string', example: 'budi_new@kampus.ac.id' },
                        role: { type: 'string', example: 'mahasiswa' }
                      }
                    }
                  }
                }
              }
            }
          },
          401: { description: 'Pengguna tidak terautentikasi' },
          403: { description: 'Akses ditolak' },
          404: { description: 'User tidak ditemukan' }
        }
      }
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
