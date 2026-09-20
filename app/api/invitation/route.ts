import { requireAdmin } from "@/lib/adminAuth";
import { NextResponse } from "next/server";
import { readInvitation, saveInvitation } from "@/lib/database";
import { localizeInvitation } from "@/lib/localPhotos";
import { validInvitation } from "@/lib/validation";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const edit = new URL(request.url).searchParams.get("edit") === "1";
  if (edit) { const denied = await requireAdmin(request); if (denied) return denied; }
  try { return NextResponse.json(edit ? await readInvitation() : await localizeInvitation(await readInvitation()), { headers: { "Cache-Control": "no-store" } }); }
  catch (error) { console.error(error); return NextResponse.json({ message: "Gagal membaca database" }, { status: 500 }); }
}
export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  let data: unknown;
  try { data = await request.json(); } catch { return NextResponse.json({ message: "JSON tidak valid" }, { status: 400 }); }
  if (!validInvitation(data)) return NextResponse.json({ message: "Data undangan tidak lengkap atau format tanggal salah" }, { status: 400 });
  try {
    await saveInvitation(data);
    return NextResponse.json({ success: true, message: "Data berhasil disimpan!" });
  } catch (error) { console.error(error); return NextResponse.json({ message: "Gagal menyimpan data" }, { status: 500 }); }
}
