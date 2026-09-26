import { randomBytes } from "node:crypto";
import { database } from "./database";
export interface Guest { token:string; name:string; phone:string }
export async function findGuest(token:unknown):Promise<Guest | undefined> {
  if(typeof token!=="string" || !/^[a-f0-9]{48}$/.test(token))return undefined;
  return await database().prepare("SELECT token,name,phone FROM guests WHERE token = ? AND (? = 1 OR NOT EXISTS (SELECT 1 FROM documents WHERE name = 'checkin-test-guest' AND value = guests.token))").get(token, process.env.NODE_ENV === "development" ? 1 : 0) as unknown as Guest | undefined;
}
export async function listGuests():Promise<Guest[]> {
  return await database().prepare("SELECT token,name,phone FROM guests WHERE ? = 1 OR NOT EXISTS (SELECT 1 FROM documents WHERE name = 'checkin-test-guest' AND value = guests.token) ORDER BY rowid DESC").all(process.env.NODE_ENV === "development" ? 1 : 0) as unknown as Guest[];
}
export async function addGuests(guests:Array<{name:string;phone:string}>) {
  await database().batch(guests.map(guest=>({sql:"INSERT OR IGNORE INTO guests VALUES (?, ?, ?)",args:[randomBytes(24).toString("hex"),guest.name,guest.phone]})));
  return listGuests();
}
