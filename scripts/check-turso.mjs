import { createClient } from '@libsql/client';
import { DatabaseSync } from 'node:sqlite';
import { existsSync } from 'node:fs';
const url=process.env.undangan_TURSO_DATABASE_URL || process.env.TURSO_DATABASE_URL;
const authToken=process.env.undangan_TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;
if(!url || !authToken)throw new Error('Konfigurasi Turso belum lengkap');
const client=createClient({url,authToken});
try {
  await client.execute('SELECT 1');
  const tables=await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
  console.log('Turso terhubung. Tabel:',tables.rows.map(row=>row.name).join(', ') || '(kosong)');
  const source=process.env.DATABASE_PATH || 'storage/invitation.sqlite';
  if(existsSync(source)) {
    const local=new DatabaseSync(source,{readOnly:true});
    for(const table of ['documents','photos','wishes','guests','local_photos']) {
      if(local.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(table))console.log(`Lokal ${table}:`,local.prepare(`SELECT count(*) AS n FROM ${table}`).get().n);
    }
    local.close();
  }
} catch(error) { console.error('Pemeriksaan gagal:',error.code || error.cause?.code || error.name); process.exitCode=1; }
finally { client.close(); }
