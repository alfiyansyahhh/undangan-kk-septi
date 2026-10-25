import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

test("admin can delete a guest and the guest check-in record", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "invitation-guest-delete-"));
  try {
    const result = spawnSync(process.execPath, ["--experimental-strip-types", "--input-type=module", "-e", `
      import { registerHooks } from 'node:module';
      import { pathToFileURL } from 'node:url';
      import path from 'node:path';
      import assert from 'node:assert/strict';
      registerHooks({ resolve(specifier, context, next) {
        if (specifier.startsWith('@/')) return { url:pathToFileURL(path.resolve(specifier.slice(2) + '.ts')).href, shortCircuit:true };
        if (specifier === 'next/server') return next('next/server.js',context);
        if (['./database','./gdrive','./requestOrigin'].includes(specifier)) return next(specifier+'.ts',context);
        return next(specifier, context);
      }});
      process.env.ADMIN_PASSWORD = 'test-password-not-for-production';
      const auth = await import('./lib/adminAuth.ts');
      const { database } = await import('./lib/database.ts');
      const { addGuests, findGuest, listGuests } = await import('./lib/guests.ts');
      const route = await import('./app/api/guests/route.ts');
      const token = await auth.createSession();
      const guest = (await addGuests([{name:'Delete Me',phone:''}])).find(item => item.name === 'Delete Me');
      assert.ok(guest);
      await database().prepare('INSERT INTO check_ins VALUES (?, ?, ?)').run(guest.token,new Date().toISOString(),1);
      const request = new Request('http://localhost/api/guests', {
        method:'DELETE',
        headers:{cookie:auth.ADMIN_COOKIE+'='+token,origin:'http://localhost','Content-Type':'application/json'},
        body:JSON.stringify({token:guest.token}),
      });
      assert.equal((await route.DELETE(request)).status,200);
      assert.equal(await findGuest(guest.token),undefined);
      assert.equal(await database().prepare('SELECT guest_token FROM check_ins WHERE guest_token = ?').get(guest.token),undefined);
      assert.equal((await listGuests()).some(item => item.token === guest.token),false);
      assert.equal((await route.DELETE(new Request('http://localhost/api/guests', {
        method:'DELETE',
        headers:{cookie:auth.ADMIN_COOKIE+'='+token,origin:'http://localhost','Content-Type':'application/json'},
        body:JSON.stringify({token:guest.token}),
      }))).status,404);
    `], {
      cwd:process.cwd(),
      encoding:"utf8",
      env:{...process.env,TURSO_DATABASE_URL:"",undangan_TURSO_DATABASE_URL:"",VERCEL:"",DATABASE_PATH:path.join(dir,"test.sqlite")},
    });
    assert.equal(result.status,0,result.stderr);
  } finally {
    rmSync(dir,{recursive:true,force:true});
  }
});
