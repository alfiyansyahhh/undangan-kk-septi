import { database } from "./database";
import { extractDriveId } from "./gdrive";
import type { InvitationData } from "./gdrive";
export const localPhotoDatabase = database;
export function photoReferences(data: InvitationData): string[] {
  return [data.couple.bride.photo, data.couple.groom.photo, data.photos.cover, data.photos.akad, data.photos.resepsi, data.photos.gift, data.photos.galleryCover, ...data.photos.gallery, ...(data.photos.coverSlides || []), ...(data.photos.background || []), ...(data.photos.quoteSlides || []), ...(data.story || []).map(item => item.image)].filter((v): v is string => !!v);
}
export async function localizeInvitation(data: InvitationData): Promise<InvitationData> {
  const ids = new Set((await localPhotoDatabase().prepare("SELECT id FROM local_photos").all()).map(row => String(row.id)));
  const resolve = (src: string) => { const id = extractDriveId(src); return id && ids.has(id) ? `/api/media/${id}` : src; };
  return { ...data, couple:{ ...data.couple, bride:{...data.couple.bride,photo:resolve(data.couple.bride.photo)},groom:{...data.couple.groom,photo:resolve(data.couple.groom.photo)} },
    photos:{ ...data.photos, cover:resolve(data.photos.cover), gallery:data.photos.gallery.map(resolve), coverSlides:data.photos.coverSlides?.map(resolve), background:data.photos.background?.map(resolve), quoteSlides:data.photos.quoteSlides?.map(resolve), akad:data.photos.akad && resolve(data.photos.akad), resepsi:data.photos.resepsi && resolve(data.photos.resepsi), gift:data.photos.gift && resolve(data.photos.gift), galleryCover:data.photos.galleryCover && resolve(data.photos.galleryCover) },
    story:data.story?.map(item=>({...item,image:item.image && resolve(item.image)})) };
}
export function imageMime(bytes: Uint8Array): string | null {
  if (bytes[0]===255 && bytes[1]===216 && bytes[2]===255) return "image/jpeg";
  if (Buffer.from(bytes.subarray(0,8)).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return "image/png";
  const head=Buffer.from(bytes.subarray(0,12)).toString("ascii");
  if (head.startsWith("GIF87a") || head.startsWith("GIF89a")) return "image/gif";
  if (head.startsWith("RIFF") && head.slice(8)==="WEBP") return "image/webp";
  return null;
}
export async function downloadDrivePhoto(id: string) {
  let url = new URL(`https://drive.google.com/thumbnail?id=${id}&sz=w2400`);
  const signal = AbortSignal.timeout(30_000);
  for(let redirect=0;redirect<6;redirect++) {
    if(url.protocol!=="https:" || !(url.hostname==="drive.google.com" || url.hostname==="drive.usercontent.google.com" || url.hostname.endsWith(".googleusercontent.com"))) throw new Error("Tujuan unduhan tidak diizinkan");
    const response=await fetch(url,{redirect:"manual",signal});
    if([301,302,303,307,308].includes(response.status)) { const location=response.headers.get("location");await response.body?.cancel();if(!location)throw new Error("Redirect tidak valid");url=new URL(location,url);continue; }
    if(!response.ok || !response.body) throw new Error("Foto tidak bisa diakses. Periksa izin Google Drive.");
    const reader=response.body.getReader();const chunks:Uint8Array[]=[];let size=0;
    try { while(true) { const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>15*1024*1024)throw new Error("Foto melebihi 15 MB");chunks.push(value); } }
    finally { await reader.cancel(); }
    const content=Buffer.concat(chunks);const mime=imageMime(content);
    if(!mime)throw new Error("Respons bukan gambar. Pastikan foto Drive dapat diakses publik.");
    return {content,mime};
  }
  throw new Error("Terlalu banyak redirect");
}
