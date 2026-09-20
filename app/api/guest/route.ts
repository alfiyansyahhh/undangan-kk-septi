import { NextResponse } from "next/server";
import { findGuest } from "@/lib/guests";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const guest = await findGuest(new URL(request.url).searchParams.get("guest"));
  return guest ? NextResponse.json({name:guest.name},{headers:{"Cache-Control":"no-store"}}) : NextResponse.json({message:"Link tamu tidak valid."},{status:404});
}
