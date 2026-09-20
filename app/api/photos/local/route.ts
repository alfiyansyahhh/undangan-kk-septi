import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { downloadDrivePhoto, localPhotoDatabase } from "@/lib/localPhotos";
export const runtime="nodejs";
export async function POST(request:Request) {
  const denied=await requireAdmin(request);if(denied)return denied;
  let body;try{body=await request.json();}catch{return NextResponse.json({message:"JSON tidak valid"},{status:400});}
  if(typeof body?.id!=="string" || !/^[\w-]{25,50}$/.test(body.id))return NextResponse.json({message:"ID foto tidak valid"},{status:400});
  try {
    const db=localPhotoDatabase();
    if(await db.prepare("SELECT id FROM local_photos WHERE id = ?").get(body.id))return NextResponse.json({success:true,cached:true});
    const {content,mime}=await downloadDrivePhoto(body.id);
    await db.prepare("INSERT OR IGNORE INTO local_photos VALUES (?, ?, ?)").run(body.id,mime,content);
    return NextResponse.json({success:true});
  }catch(error){return NextResponse.json({message:error instanceof Error?error.message:"Gagal menyalin foto"},{status:502});}
}
