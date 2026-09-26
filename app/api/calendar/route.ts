import { readInvitation } from "@/lib/database";
import { calendarEvent } from "@/lib/calendar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("event");
  if (key !== "akad" && key !== "resepsi") return Response.json({ message: "Acara tidak valid." }, { status: 400 });
  const calendar = calendarEvent(await readInvitation(), key);
  if (!calendar) return Response.json({ message: "Tanggal dan rentang jam acara belum lengkap." }, { status: 422 });
  if (new URL(request.url).searchParams.get("provider") === "google") return Response.redirect(calendar.google, 302);
  return new Response(calendar.ics, { headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": `attachment; filename="${key}.ics"`, "Cache-Control": "no-store" } });
}
