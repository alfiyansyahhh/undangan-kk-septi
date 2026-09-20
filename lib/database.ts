import { createClient, type InStatement, type InValue } from "@libsql/client";
import { mkdirSync } from "node:fs";
import path from "node:path";
import seedInvitation from "../data/invitation-data.json" with { type: "json" };
import seedPhotos from "../data/gdrive-photos.json" with { type: "json" };
import type { GDrivePhoto, InvitationData } from "./gdrive";

function connect() {
  const url = process.env.undangan_TURSO_DATABASE_URL || process.env.TURSO_DATABASE_URL;
  const authToken = process.env.undangan_TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;
  if (url) {
    if (!authToken) throw new Error("TURSO_AUTH_TOKEN belum dikonfigurasi");
    return createClient({ url, authToken });
  }
  if (process.env.VERCEL) throw new Error("TURSO_DATABASE_URL belum dikonfigurasi di Vercel");
  const filename = process.env.DATABASE_PATH || path.join(process.cwd(), "storage", "invitation.sqlite");
  mkdirSync(path.dirname(filename), { recursive:true });
  return createClient({ url:`file:${filename}` });
}
const schema = [
  "CREATE TABLE IF NOT EXISTS documents (name TEXT PRIMARY KEY, value TEXT NOT NULL)",
  "CREATE TABLE IF NOT EXISTS photos (id TEXT PRIMARY KEY, value TEXT NOT NULL)",
  "CREATE TABLE IF NOT EXISTS wishes (id TEXT PRIMARY KEY, value TEXT NOT NULL, created_at TEXT NOT NULL)",
  "CREATE TABLE IF NOT EXISTS guests (token TEXT PRIMARY KEY, name TEXT NOT NULL, phone TEXT NOT NULL, UNIQUE(name, phone))",
  "CREATE TABLE IF NOT EXISTS admin_sessions (token TEXT PRIMARY KEY, expires INTEGER NOT NULL, version TEXT NOT NULL)",
  "CREATE TABLE IF NOT EXISTS login_attempts (id INTEGER PRIMARY KEY, count INTEGER NOT NULL, reset_at INTEGER NOT NULL)",
  "CREATE TABLE IF NOT EXISTS local_photos (id TEXT PRIMARY KEY, mime TEXT NOT NULL, content BLOB NOT NULL)",
];
function createDatabase() {
  const client=connect();
  let initialization: Promise<void> | undefined;
  async function initialize() {
    await client.batch(schema,"write");
    const state=await client.execute("SELECT name FROM documents WHERE name IN ('invitation', 'photos-migrated')");
    const existing=new Set(state.rows.map(row=>String(row.name)));
    const statements:InStatement[]=[];
    if(!existing.has("invitation")) statements.push({sql:"INSERT OR IGNORE INTO documents VALUES (?, ?)",args:["invitation",JSON.stringify(seedInvitation)]});
    if(!existing.has("photos-migrated")) {
      for(const photo of seedPhotos) statements.push({sql:"INSERT OR IGNORE INTO photos SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM documents WHERE name = 'photos-migrated')",args:[photo.id,JSON.stringify(photo)]});
      statements.push({sql:"INSERT OR IGNORE INTO documents VALUES (?, ?)",args:["photos-migrated","true"]});
    }
    if(statements.length) await client.batch(statements,"write");
  }
  function ready() {
    initialization ??= initialize().catch(error=>{initialization=undefined;throw error;});
    return initialization;
  }
  return {
    prepare(sql:string) {
      const execute=async (...args:InValue[])=>{await ready();return client.execute({sql,args});};
      return {
        run: execute,
        get: async (...args:InValue[])=>(await execute(...args)).rows[0],
        all: async (...args:InValue[])=>(await execute(...args)).rows,
      };
    },
    async batch(statements:InStatement[]) { await ready(); if(statements.length)return client.batch(statements,"write"); },
  };
}
let connection:ReturnType<typeof createDatabase> | undefined;
export function database() { return connection ??= createDatabase(); }
export async function readInvitation():Promise<InvitationData> {
  const row=await database().prepare("SELECT value FROM documents WHERE name = ?").get("invitation");
  return unifySlideshow(JSON.parse(String(row!.value)));
}
export async function saveInvitation(data:InvitationData) {
  await database().prepare("UPDATE documents SET value = ? WHERE name = ?").run(JSON.stringify(unifySlideshow(data)),"invitation");
}
export async function readPhotos():Promise<GDrivePhoto[]> {
  return (await database().prepare("SELECT value FROM photos ORDER BY rowid").all()).map(row=>JSON.parse(String(row.value)));
}
export async function savePhotos(photos:GDrivePhoto[]) {
  await database().batch(photos.map(photo=>({sql:"INSERT INTO photos VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET value = excluded.value",args:[photo.id,JSON.stringify(photo)]})));
}
export function unifySlideshow(data:InvitationData):InvitationData {
  const {background,...photos}=data.photos;
  return {...data,photos:{...photos,coverSlides:photos.coverSlides ?? background ?? []}};
}
