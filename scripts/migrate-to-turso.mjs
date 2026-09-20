import { createClient } from '@libsql/client';
import { DatabaseSync, backup } from 'node:sqlite';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
const source=process.env.DATABASE_PATH || path.resolve('storage/invitation.sqlite');
if(!existsSync(source))throw new Error('Database SQLite sumber tidak ada');
const url=process.env.undangan_TURSO_DATABASE_URL || process.env.TURSO_DATABASE_URL;
const authToken=process.env.undangan_TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;
if(!url || !authToken)throw new Error('Konfigurasi Turso belum lengkap');
const local=new DatabaseSync(source,{readOnly:true});
const remote=createClient({url,authToken});
const tables=['documents','photos','wishes','guests','local_photos'];
try {
  mkdirSync('storage/backups',{recursive:true});
  await backup(local,`storage/backups/pre-turso-${Date.now()}.sqlite`);
  const localInvitation=local.prepare("SELECT value FROM documents WHERE name='invitation'").get();
  const remoteTable=await remote.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='documents'");
  if(remoteTable.rows.length) {
    const existing=await remote.execute("SELECT value FROM documents WHERE name='invitation'");
    if(existing.rows.length && existing.rows[0].value!==localInvitation?.value)throw new Error('Database tujuan sudah berisi undangan berbeda; migrasi dihentikan tanpa menimpanya');
  }
  for(const table of tables) {
    const schema=local.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name=?").get(table);
    if(!schema)continue;
    await remote.execute(schema.sql.replace(/^CREATE TABLE /i,'CREATE TABLE IF NOT EXISTS '));
    const rows=local.prepare(`SELECT * FROM ${table} ORDER BY rowid`).all();
    if(!rows.length){console.log(`${table}: 0`);continue;}
    const columns=Object.keys(rows[0]);
    const sql=`INSERT OR IGNORE INTO ${table} (${columns.map(c=>'"'+c+'"').join(',')}) VALUES (${columns.map(()=>'?').join(',')})`;
    const batchSize=table==='local_photos'?1:100;
    for(let i=0;i<rows.length;i+=batchSize) {
      await remote.batch(rows.slice(i,i+batchSize).map(row=>({sql,args:columns.map(c=>row[c])})), 'write');
    }
    // Verify keys and values, including blobs, rather than only row counts.
    const primary=columns[0];
    for(let i=0;i<rows.length;i+=100) {
      const chunk=rows.slice(i,i+100);
      const result=await remote.execute({sql:`SELECT * FROM ${table} WHERE "${primary}" IN (${chunk.map(()=>'?').join(',')})`,args:chunk.map(r=>r[primary])});
      const indexed=new Map(result.rows.map(row=>[row[primary],row]));
      for(const row of chunk) for(const column of columns) {
        const actual=indexed.get(row[primary])?.[column];
        const expected=row[column];
        const same=expected instanceof Uint8Array ? actual instanceof ArrayBuffer && Buffer.from(expected).equals(Buffer.from(actual)) : actual===expected;
        if(!same)throw new Error(`Verifikasi gagal di tabel ${table}; sumber lokal tetap tersedia`);
      }
    }
    console.log(`${table}: ${rows.length} baris terverifikasi`);
  }
  console.log('Migrasi selesai. SQLite asli dan backup tetap disimpan.');
} catch(error) { console.error('Migrasi gagal:',error.code || error.message);process.exitCode=1; }
finally{local.close();remote.close();}
