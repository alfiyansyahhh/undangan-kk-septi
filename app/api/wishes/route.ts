import { requireAdmin } from "@/lib/adminAuth";
import { NextResponse } from "next/server";
import { createHash, randomUUID } from "node:crypto";
import { findGuest } from "@/lib/guests";
import { database } from "@/lib/database";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const rows = await database().prepare("SELECT value FROM wishes ORDER BY created_at DESC, rowid DESC").all();
    return NextResponse.json(rows.map(row => JSON.parse(String(row.value))), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { console.error(error); return NextResponse.json({ message: "Gagal memuat ucapan" }, { status: 500 }); }
}
export async function POST(request: Request) {
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ message: "JSON tidak valid" }, { status: 400 }); }
  const guest = await findGuest(body?.guestToken);
  if (!guest) return NextResponse.json({message:"Gunakan link undangan tamu yang valid untuk RSVP."},{status:403});
  body.name = guest.name;
  if (!body || typeof body.name !== "string" || !body.name.trim() || body.name.length > 120 || typeof body.message !== "string" || !body.message.trim() || body.message.length > 3000 || !["Hadir", "Tidak Hadir", "Ragu-ragu"].includes(body.attendance)) {
    return NextResponse.json({ message: "Nama, kehadiran, atau pesan tidak valid" }, { status: 400 });
  }
  const now = new Date();
  // A client-generated UUID lets a retry safely return the original submission.
  const id = typeof body.id === "string" && /^[\da-f-]{36}$/i.test(body.id) ? createHash("sha256").update(guest.token + body.id).digest("hex") : randomUUID();
  const wish = { id, name: body.name.trim(), message: body.message.trim(), attendance: body.attendance, time: now.toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) };
  try {
    const db = database();
    await db.prepare("INSERT OR IGNORE INTO wishes VALUES (?, ?, ?)").run(id, JSON.stringify(wish), now.toISOString());
    const saved = (await db.prepare("SELECT value FROM wishes WHERE id = ?").get(id))!;
    return NextResponse.json(JSON.parse(String(saved.value)), { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ message: "Gagal menyimpan ucapan" }, { status: 500 }); }
}
export async function DELETE(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ message: "ID ucapan diperlukan" }, { status: 400 });
  try {
    await database().prepare("DELETE FROM wishes WHERE id = ?").run(id);
    return NextResponse.json({ success: true });
  } catch (error) { console.error(error); return NextResponse.json({ message: "Gagal menghapus ucapan" }, { status: 500 }); }
}
