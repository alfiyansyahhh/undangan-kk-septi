import { randomBytes } from "node:crypto";
import { database } from "./database";
export interface Guest { token: string; name: string; phone: string }
function guestsDatabase() {
  const db = database();
  db.exec("CREATE TABLE IF NOT EXISTS guests (token TEXT PRIMARY KEY, name TEXT NOT NULL, phone TEXT NOT NULL, UNIQUE(name, phone))");
  return db;
}
export function findGuest(token: unknown): Guest | undefined {
  if (typeof token !== "string" || !/^[a-f0-9]{48}$/.test(token)) return undefined;
  return guestsDatabase().prepare("SELECT token, name, phone FROM guests WHERE token = ?").get(token) as Guest | undefined;
}
export function listGuests(): Guest[] {
  return guestsDatabase().prepare("SELECT token, name, phone FROM guests ORDER BY rowid DESC").all() as unknown as Guest[];
}
export function addGuests(guests: Array<{name: string; phone: string}>) {
  const db = guestsDatabase();
  db.exec("BEGIN IMMEDIATE");
  try {
    const insert = db.prepare("INSERT OR IGNORE INTO guests VALUES (?, ?, ?)");
    for (const guest of guests) insert.run(randomBytes(24).toString("hex"), guest.name, guest.phone);
    db.exec("COMMIT");
  } catch (error) { db.exec("ROLLBACK"); throw error; }
  return listGuests();
}
