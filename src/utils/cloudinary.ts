/**
 * Menghitung hash SHA-1 dari string menggunakan Web Crypto API.
 * Kompatibel dengan Vercel Edge dan standard Node.js.
 */
async function generateSha1(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Mengunggah berkas foto/gambar ke Cloudinary menggunakan REST API (Signed Upload).
 * @param file Berkas gambar (File/Blob)
 * @returns secure_url dari gambar yang berhasil diunggah
 */
export async function uploadToCloudinary(file: File | Blob): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials (CLOUD_NAME, API_KEY, API_SECRET) are not configured');
  }

  const timestamp = Math.floor(Date.now() / 1000);
  
  // Buat signature string: timestamp={timestamp}{apiSecret}
  const signatureString = `timestamp=${timestamp}${apiSecret}`;
  const signature = await generateSha1(signatureString);

  // Buat FormData payload
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  const result = await response.json() as any;

  if (!response.ok) {
    throw new Error(`Cloudinary upload failed: ${result.error?.message || 'Unknown error'}`);
  }

  if (!result.secure_url) {
    throw new Error('Cloudinary response did not contain secure_url');
  }

  return result.secure_url;
}
