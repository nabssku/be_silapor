import { Context } from 'hono'
import {
  getCategories,
  getCategoryById,
  findCategoryByName,
  createCategory,
  updateCategory,
  deleteCategory,
  getLocations,
  getLocationById,
  findLocationByName,
  createLocation,
  updateLocation,
  deleteLocation
} from '../services/master'

// ==========================================
// 1. CONTROLLERS KATEGORI (CATEGORIES)
// ==========================================

export async function getAllCategoriesController(c: Context) {
  try {
    const list = await getCategories();
    return c.json({
      success: true,
      message: 'Berhasil mengambil daftar kategori',
      data: list,
    }, 200);
  } catch (error: any) {
    return c.json({
      success: false,
      message: 'Gagal mengambil daftar kategori',
      error: error.message,
    }, 500);
  }
}

export async function getCategoryByIdController(c: Context) {
  try {
    const id = parseInt(c.req.param('id') || '', 10);
    if (isNaN(id)) {
      return c.json({
        success: false,
        message: 'Format ID tidak valid',
      }, 400);
    }

    const category = await getCategoryById(id);
    if (!category) {
      return c.json({
        success: false,
        message: 'Kategori tidak ditemukan',
      }, 404);
    }

    return c.json({
      success: true,
      message: 'Berhasil mengambil data kategori',
      data: category,
    }, 200);
  } catch (error: any) {
    return c.json({
      success: false,
      message: 'Gagal mengambil data kategori',
      error: error.message,
    }, 500);
  }
}

export async function createCategoryController(c: Context) {
  try {
    const body = (c.req.valid as any)('json');

    // Cek keunikan nama kategori
    const existing = await findCategoryByName(body.name as string);
    if (existing) {
      return c.json({
        success: false,
        message: 'Kategori dengan nama tersebut sudah ada',
      }, 400);
    }

    const category = await createCategory({
      name: body.name as string,
      description: body.description || null,
    });

    return c.json({
      success: true,
      message: 'Kategori berhasil dibuat',
      data: category,
    }, 201);
  } catch (error: any) {
    return c.json({
      success: false,
      message: 'Gagal membuat kategori',
      error: error.message,
    }, 500);
  }
}

export async function updateCategoryController(c: Context) {
  try {
    const id = parseInt(c.req.param('id') || '', 10);
    if (isNaN(id)) {
      return c.json({
        success: false,
        message: 'Format ID tidak valid',
      }, 400);
    }

    const body = (c.req.valid as any)('json');

    // Cek keberadaan kategori
    const category = await getCategoryById(id);
    if (!category) {
      return c.json({
        success: false,
        message: 'Kategori tidak ditemukan',
      }, 404);
    }

    // Jika ingin mengubah nama, cek keunikan nama baru
    if (body.name && body.name !== category.name) {
      const existing = await findCategoryByName(body.name as string);
      if (existing) {
        return c.json({
          success: false,
          message: 'Kategori dengan nama tersebut sudah ada',
        }, 400);
      }
    }

    const updated = await updateCategory(id, {
      name: body.name,
      description: body.description,
    });

    return c.json({
      success: true,
      message: 'Kategori berhasil diperbarui',
      data: updated,
    }, 200);
  } catch (error: any) {
    return c.json({
      success: false,
      message: 'Gagal memperbarui kategori',
      error: error.message,
    }, 500);
  }
}

export async function deleteCategoryController(c: Context) {
  try {
    const id = parseInt(c.req.param('id') || '', 10);
    if (isNaN(id)) {
      return c.json({
        success: false,
        message: 'Format ID tidak valid',
      }, 400);
    }

    const deleted = await deleteCategory(id);
    if (!deleted) {
      return c.json({
        success: false,
        message: 'Kategori tidak ditemukan',
      }, 404);
    }

    return c.json({
      success: true,
      message: 'Kategori berhasil dihapus',
      data: deleted,
    }, 200);
  } catch (error: any) {
    return c.json({
      success: false,
      message: 'Gagal menghapus kategori',
      error: error.message,
    }, 500);
  }
}

// ==========================================
// 2. CONTROLLERS LOKASI (LOCATIONS)
// ==========================================

export async function getAllLocationsController(c: Context) {
  try {
    const list = await getLocations();
    return c.json({
      success: true,
      message: 'Berhasil mengambil daftar lokasi',
      data: list,
    }, 200);
  } catch (error: any) {
    return c.json({
      success: false,
      message: 'Gagal mengambil daftar lokasi',
      error: error.message,
    }, 500);
  }
}

export async function getLocationByIdController(c: Context) {
  try {
    const id = parseInt(c.req.param('id') || '', 10);
    if (isNaN(id)) {
      return c.json({
        success: false,
        message: 'Format ID tidak valid',
      }, 400);
    }

    const location = await getLocationById(id);
    if (!location) {
      return c.json({
        success: false,
        message: 'Lokasi tidak ditemukan',
      }, 404);
    }

    return c.json({
      success: true,
      message: 'Berhasil mengambil data lokasi',
      data: location,
    }, 200);
  } catch (error: any) {
    return c.json({
      success: false,
      message: 'Gagal mengambil data lokasi',
      error: error.message,
    }, 500);
  }
}

export async function createLocationController(c: Context) {
  try {
    const body = (c.req.valid as any)('json');

    // Cek keunikan nama lokasi
    const existing = await findLocationByName(body.name as string);
    if (existing) {
      return c.json({
        success: false,
        message: 'Lokasi dengan nama tersebut sudah ada',
      }, 400);
    }

    const location = await createLocation({
      name: body.name as string,
      description: body.description || null,
    });

    return c.json({
      success: true,
      message: 'Lokasi berhasil dibuat',
      data: location,
    }, 201);
  } catch (error: any) {
    return c.json({
      success: false,
      message: 'Gagal membuat lokasi',
      error: error.message,
    }, 500);
  }
}

export async function updateLocationController(c: Context) {
  try {
    const id = parseInt(c.req.param('id') || '', 10);
    if (isNaN(id)) {
      return c.json({
        success: false,
        message: 'Format ID tidak valid',
      }, 400);
    }

    const body = (c.req.valid as any)('json');

    // Cek keberadaan lokasi
    const location = await getLocationById(id);
    if (!location) {
      return c.json({
        success: false,
        message: 'Lokasi tidak ditemukan',
      }, 404);
    }

    // Jika ingin mengubah nama, cek keunikan nama baru
    if (body.name && body.name !== location.name) {
      const existing = await findLocationByName(body.name as string);
      if (existing) {
        return c.json({
          success: false,
          message: 'Lokasi dengan nama tersebut sudah ada',
        }, 400);
      }
    }

    const updated = await updateLocation(id, {
      name: body.name,
      description: body.description,
    });

    return c.json({
      success: true,
      message: 'Lokasi berhasil diperbarui',
      data: updated,
    }, 200);
  } catch (error: any) {
    return c.json({
      success: false,
      message: 'Gagal memperbarui lokasi',
      error: error.message,
    }, 500);
  }
}

export async function deleteLocationController(c: Context) {
  try {
    const id = parseInt(c.req.param('id') || '', 10);
    if (isNaN(id)) {
      return c.json({
        success: false,
        message: 'Format ID tidak valid',
      }, 400);
    }

    const deleted = await deleteLocation(id);
    if (!deleted) {
      return c.json({
        success: false,
        message: 'Lokasi tidak ditemukan',
      }, 404);
    }

    return c.json({
      success: true,
      message: 'Lokasi berhasil dihapus',
      data: deleted,
    }, 200);
  } catch (error: any) {
    return c.json({
      success: false,
      message: 'Gagal menghapus lokasi',
      error: error.message,
    }, 500);
  }
}
