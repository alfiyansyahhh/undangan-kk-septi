import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import defaultPhotos from "@/data/gdrive-photos.json";

const photosFilePath = path.join(process.cwd(), "data", "gdrive-photos.json");

export async function GET() {
  try {
    if (fs.existsSync(photosFilePath)) {
      const content = fs.readFileSync(photosFilePath, "utf8");
      return NextResponse.json(JSON.parse(content));
    }
    return NextResponse.json(defaultPhotos);
  } catch (error) {
    console.error("Error reading photos:", error);
    return NextResponse.json(defaultPhotos);
  }
}

export async function POST(request: Request) {
  try {
    const { photos: incomingPhotos } = await request.json();
    if (!Array.isArray(incomingPhotos) || incomingPhotos.length === 0) {
      return NextResponse.json({ success: false, message: "Daftar foto kosong" }, { status: 400 });
    }

    let existing = [];
    if (fs.existsSync(photosFilePath)) {
      try {
        existing = JSON.parse(fs.readFileSync(photosFilePath, "utf8"));
      } catch {
        existing = defaultPhotos;
      }
    } else {
      existing = defaultPhotos;
    }

    const map = new Map();
    existing.forEach((p: { id: string }) => map.set(p.id, p));
    incomingPhotos.forEach((p: { id: string; name?: string; thumbnail?: string; full?: string }) => {
      const id = p.id;
      const name = p.name || `IMG_${id.slice(0, 6)}.JPG`;
      const thumbnail = p.thumbnail || `https://drive.google.com/thumbnail?id=${id}&sz=w800`;
      const full = p.full || `https://lh3.googleusercontent.com/d/${id}`;
      map.set(id, { id, name, thumbnail, full });
    });

    const merged = Array.from(map.values());
    fs.writeFileSync(photosFilePath, JSON.stringify(merged, null, 2), "utf8");

    return NextResponse.json({
      success: true,
      message: `Berhasil menambahkan foto! Total sekarang: ${merged.length} foto`,
      total: merged.length,
      photos: merged,
    });
  } catch (error) {
    console.error("Error saving batch photos:", error);
    return NextResponse.json({ success: false, message: "Gagal menyimpan foto" }, { status: 500 });
  }
}
