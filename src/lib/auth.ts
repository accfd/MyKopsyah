import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "kopsyah_admin_session";
const SESSION_VALUE = "kopsyah_authorized_session_token_valid";

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);
  return session?.value === SESSION_VALUE;
}

export async function loginAdmin(pin: string): Promise<{ success: boolean; error?: string }> {
  const expectedPin = process.env.ADMIN_PIN || "123456";

  if (!pin || pin.trim() !== expectedPin.trim()) {
    return { success: false, error: "PIN yang Anda masukkan salah. Coba lagi." };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, SESSION_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 hari sesi aktif
    path: "/",
  });

  return { success: true };
}

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
