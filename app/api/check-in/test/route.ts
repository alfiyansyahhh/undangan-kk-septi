import { randomBytes } from "node:crypto";
import { requireCheckIn } from "@/lib/adminAuth";
import { database } from "@/lib/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json = (body: unknown) => Response.json(body, { headers: { "Cache-Control": "no-store" } });
export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") return Response.json({ message: "Tidak ditemukan." }, { status: 404 });
  const denied = await requireCheckIn(request); if (denied) return denied;
  // A single persistent token shared by every tester; concurrent requests cannot create duplicates.
  await database().batch([
    { sql: "INSERT OR IGNORE INTO documents (name, value) VALUES ('checkin-test-guest', ?)", args: [randomBytes(24).toString("hex")] },
    { sql: "INSERT OR IGNORE INTO guests (token, name, phone) SELECT value, 'Tamu Uji Coba', 'test:' || value FROM documents WHERE name = 'checkin-test-guest'", args: [] },
  ]);
  const guest = await database().prepare("SELECT token, name FROM guests WHERE token = (SELECT value FROM documents WHERE name = 'checkin-test-guest')").get();
  return json(guest);
}
export async function DELETE(request: Request) {
  if (process.env.NODE_ENV !== "development") return Response.json({ message: "Tidak ditemukan." }, { status: 404 });
  const denied = await requireCheckIn(request); if (denied) return denied;
  // Never accept an arbitrary guest token: only the dedicated test guest can be reset.
  await database().prepare("DELETE FROM check_ins WHERE guest_token = (SELECT value FROM documents WHERE name = 'checkin-test-guest')").run();
  return json({ success: true });
}
