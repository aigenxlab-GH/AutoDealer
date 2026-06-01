"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  checkCredentials,
  createSessionToken,
} from "@/lib/auth";

export interface LoginResult {
  ok: boolean;
  error?: string;
}

export async function loginAction(
  email: string,
  password: string,
): Promise<LoginResult> {
  if (!checkCredentials(email, password)) {
    return { ok: false, error: "Invalid email or password." };
  }

  const token = await createSessionToken(email.trim().toLowerCase());
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return { ok: true };
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/admin/login");
}
