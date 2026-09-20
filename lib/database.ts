import { DatabaseSync } from "node:sqlite";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type { GDrivePhoto, InvitationData } from "./gdrive";

let connection: DatabaseSync | undefined;
export function database() {
  if (connection) return connection;
  const filename = process.env.DATABASE_PATH || path.join(process.cwd(), "storage", "invitation.sqlite");
  mkdirSync(path.dirname(filename), { recursive: true });
  const db = new DatabaseSync(filename);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS documents (name TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS photos (id TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS wishes (id TEXT PRIMARY KEY, value TEXT NOT NULL, created_at TEXT NOT NULL);
  `);
  // Seed once, inside a transaction. Existing JSON files remain untouched.
  db.exec("BEGIN IMMEDIATE");
  try {
    if (!db.prepare("SELECT name FROM documents WHERE name = ?").get("invitation")) {
      const seed = readFileSync(path.join(process.cwd(), "data/invitation-data.json"), "utf8");
      JSON.parse(seed);
      db.prepare("INSERT INTO documents VALUES (?, ?)").run("invitation", seed);
    }
    if (!db.prepare("SELECT name FROM documents WHERE name = ?").get("photos-migrated")) {
      const photos = JSON.parse(readFileSync(path.join(process.cwd(), "data/gdrive-photos.json"), "utf8")) as GDrivePhoto[];
      const insert = db.prepare("INSERT OR IGNORE INTO photos VALUES (?, ?)");
      for (const photo of photos) insert.run(photo.id, JSON.stringify(photo));
      db.prepare("INSERT INTO documents VALUES (?, ?)").run("photos-migrated", "true");
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    db.close();
    throw error;
  }
  connection = db;
  return db;
}
export function readInvitation(): InvitationData {
  const row = database().prepare("SELECT value FROM documents WHERE name = ?").get("invitation")!;
  return JSON.parse(String(row.value));
}
export function saveInvitation(data: InvitationData) {
  database().prepare("UPDATE documents SET value = ? WHERE name = ?").run(JSON.stringify(data), "invitation");
}
export function readPhotos(): GDrivePhoto[] {
  return database().prepare("SELECT value FROM photos ORDER BY rowid").all().map(row => JSON.parse(String(row.value)));
}
export function savePhotos(photos: GDrivePhoto[]) {
  const db = database();
  db.exec("BEGIN IMMEDIATE");
  try {
    const insert = db.prepare("INSERT INTO photos VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET value = excluded.value");
    for (const photo of photos) insert.run(photo.id, JSON.stringify(photo));
    db.exec("COMMIT");
  } catch (error) { db.exec("ROLLBACK"); throw error; }
}
