import { NextResponse } from "next/server";
import { readPhotos, savePhotos } from "@/lib/database";
import { getDriveFullUrl, getDriveThumbnailUrl } from "@/lib/gdrive";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  try { return NextResponse.json(readPhotos(), { headers: { "Cache-Control": "no-store" } }); }
  catch (error) { console.error(error); return NextResponse.json({ message: "Gagal membaca foto" }, { status: 500 }); }
}
export async function POST(request: Request) {
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ message: "JSON tidak valid" }, { status: 400 }); }
  if (!Array.isArray(body?.photos) || !body.photos.length || !body.photos.every((p: { id?: unknown; name?: unknown }) => p && typeof p.id === "string" && /^[\w-]{20,100}$/.test(p.id) && (p.name === undefined || typeof p.name === "string"))) {
    return NextResponse.json({ message: "Daftar foto atau ID tidak valid" }, { status: 400 });
  }
  try {
    savePhotos(body.photos.map((p: { id: string; name?: string }) => ({ id: p.id, name: p.name || `IMG_${p.id.slice(0, 6)}`, thumbnail: getDriveThumbnailUrl(p.id), full: getDriveFullUrl(p.id) })));
    const photos = readPhotos();
    return NextResponse.json({ success: true, photos, total: photos.length });
  } catch (error) { console.error(error); return NextResponse.json({ message: "Gagal menyimpan foto" }, { status: 500 }); }
}
