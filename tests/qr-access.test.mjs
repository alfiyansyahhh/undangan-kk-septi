import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

test('QR staff can check in but cannot access admin APIs, even by swapping cookies', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'qr-access-'));
  try {
    const result = spawnSync(process.execPath, ['--experimental-strip-types', '--input-type=module', '-e', `
      import { registerHooks } from 'node:module';
      import { pathToFileURL } from 'node:url';
      import path from 'node:path';
      import assert from 'node:assert/strict';
      registerHooks({ resolve(specifier, context, next) {
        if (specifier.startsWith('@/')) return { url: pathToFileURL(path.resolve(specifier.slice(2) + '.ts')).href, shortCircuit: true };
        if (specifier === 'next/server') return next('next/server.js', context);
        if (specifier === './database' || specifier === './requestOrigin') return next(specifier + '.ts', context);
        return next(specifier, context);
      }});
      process.env.ADMIN_PASSWORD = 'admin-test';
      process.env.QR_ADMIN_PASSWORD = 'qr-test';
      process.env.QR_ADMIN_USERNAME = 'adminqr';
      const auth = await import('./lib/adminAuth.ts');
      const login = await import('./app/api/qr/session/route.ts');
      const checkin = await import('./app/api/check-in/route.ts');
      const guests = await import('./app/api/guests/route.ts');
      const request = (body, origin = 'http://localhost') => new Request('http://localhost/api/qr/session', { method: 'POST', headers: { origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      assert.equal((await login.POST(request({username:'wrong', password:'qr-test'}))).status, 401);
      assert.equal((await login.POST(request({username:'adminqr', password:'qr-test'}, 'https://other.example'))).status, 403);
      const loggedIn = await login.POST(request({username:'adminqr', password:'qr-test'}));
      assert.equal(loggedIn.status, 200);
      const cookie = loggedIn.headers.get('set-cookie').split(';')[0];
      const token = cookie.slice(cookie.indexOf('=') + 1);
      assert.ok(await auth.validSession(token, 'qr'));
      assert.equal(await auth.validSession(token), false);
      assert.equal((await checkin.GET(new Request('http://localhost/api/check-in', {headers:{cookie}}))).status, 200);
      assert.equal((await guests.GET(new Request('http://localhost/api/guests', {headers:{cookie}}))).status, 401);
      assert.equal((await guests.GET(new Request('http://localhost/api/guests', {headers:{cookie: auth.ADMIN_COOKIE+'='+token}}))).status, 401);
      const { addGuests } = await import('./lib/guests.ts');
      const [guest] = await addGuests([{name:'QR Guest', phone:''}]);
      const post = origin => new Request('http://localhost/api/check-in', {method:'POST', headers:{cookie, origin, 'Content-Type':'application/json'}, body:JSON.stringify({token:guest.token, partySize:2})});
      assert.equal((await checkin.POST(post('https://other.example'))).status,403);
      assert.equal((await checkin.POST(post('http://localhost'))).status,200);
      const adminToken = await auth.createSession();
      assert.ok(await auth.validSession(adminToken));
      assert.equal(await auth.validSession(adminToken, 'qr'), false);
      const logout = new Request('http://localhost/api/qr/session',{method:'DELETE',headers:{cookie,origin:'http://localhost'}});
      assert.equal((await login.DELETE(logout)).status,200);
      assert.equal(await auth.validSession(token,'qr'),false);
      const fresh = await auth.createSession('qr');
      process.env.QR_ADMIN_PASSWORD = 'rotated';
      assert.equal(await auth.validSession(fresh,'qr'),false);
      assert.ok(await auth.validSession(adminToken));
    `], { encoding: 'utf8', env: { ...process.env, TURSO_DATABASE_URL: '', undangan_TURSO_DATABASE_URL: '', VERCEL: '', DATABASE_PATH: path.join(directory, 'test.sqlite') } });
    assert.equal(result.status, 0, result.stderr);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
