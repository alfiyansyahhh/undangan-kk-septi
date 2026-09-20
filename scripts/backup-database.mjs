import { DatabaseSync, backup } from 'node:sqlite';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
const source = process.env.DATABASE_PATH || path.resolve('storage/invitation.sqlite');
if (!existsSync(source)) throw new Error('Database belum ada. Buka aplikasi terlebih dahulu.');
const destination = process.argv[2] || path.resolve('storage/backups', `invitation-${new Date().toISOString().replaceAll(':','-')}.sqlite`);
if (path.resolve(source) === path.resolve(destination) || existsSync(destination)) throw new Error('Pilih file backup baru, bukan database aktif atau backup yang sudah ada.');
mkdirSync(path.dirname(destination),{recursive:true});
const db = new DatabaseSync(source, {readOnly:true});
try { await backup(db,destination); console.log(`Backup tersimpan: ${destination}`); }
finally { db.close(); }
