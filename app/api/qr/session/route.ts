import { NextResponse } from "next/server";
import { QR_COOKIE, SESSION_SECONDS, consumeLoginAttempt, createSession, passwordConfigured, passwordMatches, revokeSession, sameOrigin } from "@/lib/adminAuth";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ message: "Permintaan tidak diizinkan." }, { status: 403 });
  if (!passwordConfigured("qr")) return NextResponse.json({ message: "Akun petugas QR belum dikonfigurasi." }, { status: 503 });
  try {
    if (!await consumeLoginAttempt("qr")) return NextResponse.json({ message: "Terlalu banyak percobaan. Coba lagi dalam 15 menit." }, { status: 429 });
    let body;
    try { body = await request.json(); } catch { return NextResponse.json({ message: "Permintaan tidak valid." }, { status: 400 }); }
    if (typeof body?.password !== "string" || body.password.length > 1024 || !passwordMatches(body.password, "qr") || body.username !== (process.env.QR_ADMIN_USERNAME || "adminqr")) return NextResponse.json({ message: "Username atau password salah." }, { status: 401 });
    const response = NextResponse.json({ success: true });
    response.cookies.set(QR_COOKIE, await createSession("qr"), { httpOnly: true, secure: new URL(request.url).protocol === "https:", sameSite: "strict", path: "/", maxAge: SESSION_SECONDS });
    return response;
  } catch {
    return NextResponse.json({ message: "Login belum berhasil. Periksa koneksi database atau coba lagi." }, { status: 503 });
  }
}
export async function DELETE(request: Request) {
  if (!sameOrigin(request)) {
    const development = process.env.NODE_ENV === "development";
    const details = {
      origin: request.headers.get("origin"),
      host: request.headers.get("host"),
      forwardedHost: request.headers.get("x-forwarded-host"),
      forwardedProto: request.headers.get("x-forwarded-proto"),
      requestOrigin: new URL(request.url).origin,
      trustedOrigin: process.env.DEV_APP_ORIGIN || null,
    };
    if (development) console.warn("[QR login origin ditolak]", JSON.stringify(details));
    return NextResponse.json({ message: development
      ? `Login ditolak: origin ${details.origin || "tidak terkirim"}; origin yang dikonfigurasi ${details.trustedOrigin || "belum diisi"}. Periksa log [QR login origin ditolak].`
      : "Permintaan tidak diizinkan." }, { status: 403 });
  }
  try {
    await revokeSession(request, "qr");
    const response = NextResponse.json({ success: true });
    response.cookies.set(QR_COOKIE, "", { httpOnly: true, sameSite: "strict", path: "/", maxAge: 0 });
    return response;
  } catch {
    return NextResponse.json({ message: "Gagal keluar. Coba lagi." }, { status: 503 });
  }
}
