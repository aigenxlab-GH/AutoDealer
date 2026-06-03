// Client-side image upload. Uploads directly to Cloudinary when configured,
// otherwise falls back to a compressed inline data URL so the admin form
// works with zero external accounts.
// NOTE: We intentionally do NOT read NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME here.
// cloudName comes from the server's /api/cloudinary-sign response, so the
// admin-only secret vars (CLOUDINARY_CLOUD_NAME etc.) never need a NEXT_PUBLIC_ prefix.

export const cloudinaryEnabled = true; // determined at runtime via the sign endpoint

const MAX_PX  = 1920;  // longest edge — good quality for car photos
const QUALITY = 0.85;  // JPEG quality

/** Resize + compress an image to a Blob using Canvas. Always runs before upload. */
function compressToBlob(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_PX || height > MAX_PX) {
          if (width >= height) { height = Math.round((height * MAX_PX) / width); width = MAX_PX; }
          else                 { width  = Math.round((width  * MAX_PX) / height); height = MAX_PX; }
        }
        const canvas = document.createElement("canvas");
        canvas.width  = width;
        canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => blob ? resolve(blob) : reject(new Error("Canvas toBlob failed")),
          "image/jpeg",
          QUALITY,
        );
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/** Same compression but returns a data URL (used as local fallback). */
async function compressToDataUrl(file: File): Promise<string> {
  const blob = await compressToBlob(file);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

export async function uploadImage(file: File): Promise<string> {
  // Always compress first — keeps file well under Cloudinary's 10 MB free limit
  const compressed = await compressToBlob(file);

  // Ask the server for a signed upload token
  const signRes = await fetch("/api/cloudinary-sign", { method: "POST" });
  if (!signRes.ok) {
    // Cloudinary not configured — return compressed data URL as fallback
    return compressToDataUrl(file);
  }

  const { cloudName, apiKey, timestamp, signature, folder } = await signRes.json();

  const form = new FormData();
  form.append("file", compressed, "photo.jpg");   // ← compressed blob, not raw file
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("signature", signature);
  form.append("folder", folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: form },
  );
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message ?? `Cloudinary error ${res.status}`);
  }
  const data = await res.json();
  return data.secure_url as string;
}
