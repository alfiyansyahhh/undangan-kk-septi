import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { database } from "./database";
import { sameOrigin } from "./requestOrigin";
export { sameOrigin } from "./requestOrigin";
export const ADMIN_COOKIE = "invitation_admin";
export const QR_COOKIE = "invitation_qr";
type Role = "admin" | "qr";
const passwordFor = (role: Role) => role === "qr" ? process.env.QR_ADMIN_PASSWORD : process.env.ADMIN_PASSWORD;
const versionFor = (role: Role) => role === "qr" ? hash(`qr:${process.env.QR_ADMIN_USERNAME || "adminqr"}:${passwordFor(role) || ""}`) : hash(passwordFor(role) || "");
export const SESSION_SECONDS = 8 * 60 * 60;
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const authDatabase = database;
export function passwordConfigured(role: Role = "admin") { return !!passwordFor(role); }
export function passwordMatches(password: string, role: Role = "admin") {
  return passwordConfigured(role) && timingSafeEqual(Buffer.from(hash(password)), Buffer.from(hash(passwordFor(role)!)));
}
export async function createSession(role: Role = "admin") {
  const db = authDatabase();
  await db.prepare("DELETE FROM admin_sessions WHERE expires <= ?").run(Date.now());
  const token = randomBytes(32).toString("hex");
  await db.prepare("INSERT INTO admin_sessions VALUES (?, ?, ?)").run(hash(token), Date.now() + SESSION_SECONDS * 1000, versionFor(role));
  return token;
}
export async function validSession(token?: string, role: Role = "admin") {
  if (!token || !passwordConfigured(role) || !/^[a-f0-9]{64}$/.test(token)) return false;
  const row = await authDatabase().prepare("SELECT expires, version FROM admin_sessions WHERE token = ?").get(hash(token));
  return !!row && Number(row.expires) > Date.now() && row.version === versionFor(role);
}
export function sessionToken(request: Request, role: Role = "admin") {
  const cookie = role === "qr" ? QR_COOKIE : ADMIN_COOKIE;
  return request.headers.get("cookie")?.split(";").map(v => v.trim()).find(v => v.startsWith(`${cookie}=`))?.slice(cookie.length + 1);
}
export async function revokeSession(request: Request, role: Role = "admin") {
  const token = sessionToken(request, role);
  if (token) await authDatabase().prepare("DELETE FROM admin_sessions WHERE token = ?").run(hash(token));
}
export async function requireAdmin(request: Request) {
  if (!await validSession(sessionToken(request))) return NextResponse.json({ message: "Sesi berakhir. Silakan login admin." }, { status: 401 });
  if (request.method !== "GET" && !sameOrigin(request)) return NextResponse.json({ message: "Permintaan tidak diizinkan" }, { status: 403 });
  return null;
}
export async function requireCheckIn(request: Request) {
  if (!await validSession(sessionToken(request)) && !await validSession(sessionToken(request, "qr"), "qr")) return NextResponse.json({ message: "Sesi berakhir. Silakan login kembali di /admin/qr." }, { status: 401 });
  if (request.method !== "GET" && !sameOrigin(request)) {
    const development = process.env.NODE_ENV === "development";
    const details = {
      origin: request.headers.get("origin"),
      host: request.headers.get("host"),
      requestOrigin: new URL(request.url).origin,
      trustedOrigin: process.env.DEV_APP_ORIGIN || null,
    };
    if (development) console.warn("[Check-in origin ditolak]", JSON.stringify(details));
    return NextResponse.json({ message: development
      ? `Check-in ditolak: asal ${details.origin || "tidak terkirim"}; konfigurasi DEV_APP_ORIGIN: ${details.trustedOrigin || "belum diisi"}.`
      : "Permintaan tidak diizinkan" }, { status: 403 });
  }
  return null;
}
export async function consumeLoginAttempt(role: Role = "admin") {
  const row = await authDatabase().prepare(`INSERT INTO login_attempts VALUES (?, 1, ?)
    ON CONFLICT(id) DO UPDATE SET count = CASE WHEN reset_at <= ? THEN 1 ELSE count + 1 END,
    reset_at = CASE WHEN reset_at <= ? THEN excluded.reset_at ELSE reset_at END RETURNING count`).get(role === "qr" ? 2 : 1, Date.now() + 15 * 60_000, Date.now(), Date.now());
  return Number(row?.count) <= 10;
}
