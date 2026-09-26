import { requireCheckIn } from "@/lib/adminAuth";
import { database } from "@/lib/database";
import { findGuest } from "@/lib/guests";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json = (value: unknown, status = 200) => Response.json(value, { status, headers: { "Cache-Control": "no-store" } });
export async function GET(request: Request) {
  const denied = await requireCheckIn(request); if (denied) return denied;
  const token = new URL(request.url).searchParams.get("guest");
  if (token !== null) {
    const guest = await findGuest(token);
    if (!guest) return json({ message: "QR atau link tamu tidak valid." }, 404);
    const checkIn = await database().prepare("SELECT checked_in_at AS checkedInAt, party_size AS partySize FROM check_ins WHERE guest_token = ?").get(token);
    return json({ token: guest.token, name: guest.name, checkIn: checkIn || null });
  }
  const rows = await database().prepare("SELECT g.token, g.name, c.checked_in_at AS checkedInAt, c.party_size AS partySize, CASE WHEN g.token = (SELECT value FROM documents WHERE name = 'checkin-test-guest') THEN 1 ELSE 0 END AS isTest FROM guests g LEFT JOIN check_ins c ON c.guest_token = g.token ORDER BY c.checked_in_at DESC, g.name").all();
  return json(process.env.NODE_ENV === "development" ? rows : rows.filter(row => !row.isTest));
}
export async function POST(request: Request) {
  const denied = await requireCheckIn(request); if (denied) return denied;
  let body;
  try { body = await request.json(); } catch { return json({ message: "JSON tidak valid." }, 400); }
  if (!Number.isInteger(body?.partySize) || body.partySize < 1 || body.partySize > 100) return json({ message: "Jumlah hadir harus 1–100 orang." }, 400);
  const guest = await findGuest(body?.token);
  if (!guest) return json({ message: "Tamu tidak ditemukan." }, 404);
  const result = await database().prepare("INSERT INTO check_ins (guest_token, checked_in_at, party_size) VALUES (?, ?, ?) ON CONFLICT(guest_token) DO NOTHING").run(guest.token, new Date().toISOString(), body.partySize);
  const checkIn = await database().prepare("SELECT checked_in_at AS checkedInAt, party_size AS partySize FROM check_ins WHERE guest_token = ?").get(guest.token);
  return json({ name: guest.name, checkIn, alreadyCheckedIn: result.rowsAffected === 0 });
}
