import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth-server";
import { createUploadSignature, isCloudinaryConfigured } from "@/lib/cloudinary";

/** Returns a signed payload for a direct browser → Cloudinary upload. Admin only. */
export async function POST() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      { error: "Cloudinary not configured" },
      { status: 503 },
    );
  }
  return NextResponse.json(createUploadSignature());
}
