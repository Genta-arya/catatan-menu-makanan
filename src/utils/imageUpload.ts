import { VPS_API_BASE } from '../services/storage';

/**
 * Compresses an image file using an offscreen HTML5 Canvas.
 * Reduces 5MB-10MB camera shots down to ~100-200KB with great visual fidelity.
 */
export async function compressImage(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Format gambar tidak didukung.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio while fitting within maxWidth x maxHeight
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            maxHeight = height;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }

        // Fill white background for transparent PNGs converted to JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads compressed base64 image to VPS server storage (/uploads/ folder).
 * Returns the public HTTPS URL (e.g. https://router.mgentaarya.my.id/uploads/resep-xxx.jpg).
 * Gracefully falls back to base64 if network is offline.
 */
export async function uploadImageToServer(
  base64Data: string,
  type: 'resep' | 'bumbu' = 'resep'
): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(`${VPS_API_BASE}/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Data, type }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.url) {
        return json.url;
      }
    }
  } catch (err) {
    console.warn('Upload to VPS storage failed, falling back to local base64:', err);
  }

  // Fallback to local base64 if server upload fails
  return base64Data;
}

/**
 * Full Pipeline: Compresses client file then uploads to VPS uploads folder.
 */
export async function processAndUploadImage(
  file: File,
  type: 'resep' | 'bumbu' = 'resep'
): Promise<string> {
  const compressed = await compressImage(file);
  const serverUrl = await uploadImageToServer(compressed, type);
  return serverUrl;
}
