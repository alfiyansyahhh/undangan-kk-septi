import { NextResponse } from "next/server";
import { ADMIN_COOKIE, SESSION_SECONDS, consumeLoginAttempt, createSession, passwordConfigured, passwordMatches, revokeSession, sameOrigin } from "@/lib/adminAuth";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ message: "Permintaan tidak diizinkan" }, { status: 403 });
  if (!passwordConfigured()) return NextResponse.json({ message: "Password admin belum dikonfigurasi di server." }, { status: 503 });
  if (!consumeLoginAttempt()) return NextResponse.json({ message: "Terlalu banyak percobaan. Coba lagi dalam 15 menit." }, { status: 429 });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Permintaan tidak valid" }, { status: 400 }); }
  if (typeof body?.password !== "string" || body.password.length > 1024 || !passwordMatches(body.password)) return NextResponse.json({ message: "Password salah." }, { status: 401 });
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE, createSession(), { httpOnly: true, secure: new URL(request.url).protocol === "https:", sameSite: "strict", path: "/", maxAge: SESSION_SECONDS });
  return response;
}
export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ message: "Permintaan tidak diizinkan" }, { status: 403 });
  revokeSession(request);
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE, "", { httpOnly:true, sameSite:"strict", path:"/", maxAge:0 });
  return response;
}
