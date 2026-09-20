import { localPhotoDatabase } from "@/lib/localPhotos";
export const runtime="nodejs";
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  if(!/^[\w-]{25,50}$/.test(id))return new Response(null,{status:404});
  const photo=await localPhotoDatabase().prepare("SELECT mime, content FROM local_photos WHERE id = ?").get(id);
  if(!photo)return new Response(null,{status:404});
  return new Response(new Uint8Array(photo.content as ArrayBuffer),{headers:{"Content-Type":String(photo.mime),"Cache-Control":"public, max-age=31536000, immutable","X-Content-Type-Options":"nosniff"}});
}
