import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { addGuests, listGuests } from "@/lib/guests";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const denied = requireAdmin(request); if (denied) return denied;
  return NextResponse.json(listGuests(), { headers:{"Cache-Control":"no-store"} });
}
export async function POST(request: Request) {
  const denied = requireAdmin(request); if (denied) return denied;
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({message:"JSON tidak valid"},{status:400}); }
  if (!Array.isArray(body?.guests) || !body.guests.length || body.guests.length > 1000 || !body.guests.every((g: {name?: unknown; phone?: unknown}) => g && typeof g.name === "string" && g.name.trim().length > 0 && g.name.length <= 120 && typeof g.phone === "string" && g.phone.length <= 30)) return NextResponse.json({message:"Daftar tamu tidak valid (maksimum 1000 per input)."},{status:400});
  return NextResponse.json(addGuests(body.guests.map((g: {name:string;phone:string}) => ({name:g.name.trim(),phone:g.phone.trim()}))));
}
