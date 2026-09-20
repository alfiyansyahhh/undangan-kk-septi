import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { database } from "./database";
export const ADMIN_COOKIE = "invitation_admin";
export const SESSION_SECONDS = 8 * 60 * 60;
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const authDatabase = database;
export function passwordConfigured() { return !!process.env.ADMIN_PASSWORD; }
export function passwordMatches(password: string) {
  return passwordConfigured() && timingSafeEqual(Buffer.from(hash(password)), Buffer.from(hash(process.env.ADMIN_PASSWORD!)));
}
export async function createSession() {
  const db = authDatabase();
  await db.prepare("DELETE FROM admin_sessions WHERE expires <= ?").run(Date.now());
  const token = randomBytes(32).toString("hex");
  await db.prepare("INSERT INTO admin_sessions VALUES (?, ?, ?)").run(hash(token), Date.now() + SESSION_SECONDS * 1000, hash(process.env.ADMIN_PASSWORD || ""));
  return token;
}
export async function validSession(token?: string) {
  if (!token || !passwordConfigured() || !/^[a-f0-9]{64}$/.test(token)) return false;
  const row = await authDatabase().prepare("SELECT expires, version FROM admin_sessions WHERE token = ?").get(hash(token));
  return !!row && Number(row.expires) > Date.now() && row.version === hash(process.env.ADMIN_PASSWORD!);
}
export function sessionToken(request: Request) {
  return request.headers.get("cookie")?.split(";").map(v => v.trim()).find(v => v.startsWith(`${ADMIN_COOKIE}=`))?.slice(ADMIN_COOKIE.length + 1);
}
export async function revokeSession(request: Request) {
  const token = sessionToken(request);
  if (token) await authDatabase().prepare("DELETE FROM admin_sessions WHERE token = ?").run(hash(token));
}
export function sameOrigin(request: Request) {
  return request.headers.get("origin") === new URL(request.url).origin;
}
export async function requireAdmin(request: Request) {
  if (!await validSession(sessionToken(request))) return NextResponse.json({ message: "Sesi berakhir. Silakan login admin." }, { status: 401 });
  if (request.method !== "GET" && !sameOrigin(request)) return NextResponse.json({ message: "Permintaan tidak diizinkan" }, { status: 403 });
  return null;
}
export async function consumeLoginAttempt() {
  const row = await authDatabase().prepare(`INSERT INTO login_attempts VALUES (1, 1, ?)
    ON CONFLICT(id) DO UPDATE SET count = CASE WHEN reset_at <= ? THEN 1 ELSE count + 1 END,
    reset_at = CASE WHEN reset_at <= ? THEN excluded.reset_at ELSE reset_at END RETURNING count`).get(Date.now() + 15 * 60_000, Date.now(), Date.now());
  return Number(row?.count) <= 10;
}
