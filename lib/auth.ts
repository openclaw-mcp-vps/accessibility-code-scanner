import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const ACCESS_COOKIE_NAME = "acscan_access";
export const ACCESS_EMAIL_COOKIE_NAME = "acscan_email";
const ACCESS_COOKIE_VALUE = "granted";

export async function hasActiveAccess(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_COOKIE_NAME)?.value === ACCESS_COOKIE_VALUE;
}

export async function getAccessEmail(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_EMAIL_COOKIE_NAME)?.value;
}

export function grantAccessCookies(response: NextResponse, email: string): void {
  const normalizedEmail = email.trim().toLowerCase();
  const cookieConfig = {
    path: "/",
    sameSite: "lax" as const,
    secure: true,
    maxAge: 60 * 60 * 24 * 30
  };

  response.cookies.set({
    name: ACCESS_COOKIE_NAME,
    value: ACCESS_COOKIE_VALUE,
    httpOnly: true,
    ...cookieConfig
  });

  response.cookies.set({
    name: ACCESS_EMAIL_COOKIE_NAME,
    value: normalizedEmail,
    httpOnly: false,
    ...cookieConfig
  });
}

export function clearAccessCookies(response: NextResponse): void {
  response.cookies.delete(ACCESS_COOKIE_NAME);
  response.cookies.delete(ACCESS_EMAIL_COOKIE_NAME);
}
