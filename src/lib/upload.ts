// Client-side image upload. Uploads directly to Cloudinary when configured,
// otherwise falls back to a compressed inline data URL so the admin form
// works with zero external accounts.
// NOTE: We intentionally do NOT read NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME here.
// cloudName comes from the server's /api/cloudinary-sign response, so the
// admin-only secret vars (CLOUDINARY_CLOUD_NAME etc.) never need a NEXT_PUBLIC_ prefix.

export const cloudinaryEnabled = true; // determined at runtime via the sign endpoint

const MAX_PX   = 1200;  // longest edge in pixels
const QUALITY  = 0.82;  // JPEG quality

/** Compress + resize an image client-side using Canvas. */
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        // Calculate new dimensions keeping aspect ratio
        let { width, height } = img;
        if (width > MAX_PX || height > MAX_PX) {
          if (width >= height) { height = Math.round((height * MAX_PX) / width); width = MAX_PX; }
          else                 { width  = Math.round((width  * MAX_PX) / height); height = MAX_PX; }
        }
        const canvas = document.createElement("canvas");
        canvas.width  = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", QUALITY));
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export async function uploadImage(file: File): Promise<string> {
  // Ask the server for a signed upload token.
  // cloudName is returned by the server so we never need NEXT_PUBLIC_ prefix.
  const signRes = await fetch("/api/cloudinary-sign", { method: "POST" });
  if (!signRes.ok) {
    // Cloudinary not configured — fall back to compressed local data URL
    return compressImage(file);
  }

  const { cloudName, apiKey, timestamp, signature, folder } = await signRes.json();

  const form = new FormData();
  form.append("file", file);
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
