import "server-only";
import { v2 as cloudinary } from "cloudinary";

const CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ??
  process.env.CLOUDINARY_CLOUD_NAME;

const API_KEY    = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

// Configure the SDK so cloudinary.utils methods work correctly
if (CLOUD_NAME && API_KEY && API_SECRET) {
  cloudinary.config({ cloud_name: CLOUD_NAME, api_key: API_KEY, api_secret: API_SECRET });
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(CLOUD_NAME && API_KEY && API_SECRET);
}

export interface UploadSignature {
  cloudName: string;
  apiKey:    string;
  timestamp: number;
  folder:    string;
  signature: string;
}

/** Generate a short-lived signature so the browser can upload directly. */
export function createUploadSignature(folder = "sapphire-auto"): UploadSignature {
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    API_SECRET as string,
  );
  return {
    cloudName: CLOUD_NAME as string,
    apiKey:    API_KEY    as string,
    timestamp,
    folder,
    signature,
  };
}
