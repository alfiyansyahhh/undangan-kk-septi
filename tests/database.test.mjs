import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

test('SQLite seeds once and preserves invitation, photos and wishes across processes', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'invitation-db-'));
  const run = code => {
    const result = spawnSync(process.execPath, ['--experimental-strip-types', '--input-type=module', '-e', code], {
      cwd: process.cwd(), encoding: 'utf8', env: { ...process.env, TURSO_DATABASE_URL:'', undangan_TURSO_DATABASE_URL:'', VERCEL:'', DATABASE_PATH: path.join(dir, 'test.sqlite') },
    });
    assert.equal(result.status, 0, result.stderr);
  };
  try {
    run(`import { readInvitation, saveInvitation, savePhotos, database } from './lib/database.ts';
      const data = await readInvitation(); data.couple.title = 'Persistence test'; data.photos.gift = 'chosen-photo';
      await saveInvitation(data); await savePhotos([{ id:'test-photo', name:'Test', thumbnail:'https://example.com/test.jpg', full:'https://example.com/test.jpg' }]);
      await database().prepare('INSERT INTO wishes VALUES (?, ?, ?)').run('test-wish', JSON.stringify({name:'Test guest'}), new Date().toISOString());`);
    run(`import assert from 'node:assert/strict'; import { readInvitation, readPhotos, database } from './lib/database.ts';
      assert.equal((await readInvitation()).couple.title, 'Persistence test');
      assert.equal((await readInvitation()).photos.gift, 'chosen-photo');
      assert.ok((await readPhotos()).some(p => p.id === 'test-photo'));
      assert.equal(JSON.parse((await database().prepare('SELECT value FROM wishes WHERE id = ?').get('test-wish')).value).name, 'Test guest');`);
  } finally { rmSync(dir, { recursive:true, force:true }); }
});

test('validation rejects incomplete documents without accepting data that would break sections', () => {
  const result = spawnSync(process.execPath, ['--experimental-strip-types', '--input-type=module', '-e', `
    import assert from 'node:assert/strict'; import { readFileSync } from 'node:fs';
    import { validInvitation } from './lib/validation.ts';
    const data = JSON.parse(readFileSync('./data/invitation-data.json','utf8'));
    assert.ok(validInvitation(data)); assert.equal(validInvitation({}),false);
    assert.equal(validInvitation({...data, photos:{...data.photos, background:42}}),false);
    assert.equal(validInvitation({...data, story:[{year:'2026',title:'Test',desc:'Test',image:42}]}),false);
  `], { encoding:'utf8' });
  assert.equal(result.status,0,result.stderr);
});

test('API saves section settings, imports photos, persists wishes and rejects malformed writes', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'invitation-api-'));
  try {
    const result = spawnSync(process.execPath, ['--experimental-strip-types', '--input-type=module', '-e', `
      import { registerHooks } from 'node:module';
      import { pathToFileURL } from 'node:url';
      import path from 'node:path';
      import assert from 'node:assert/strict';
      registerHooks({ resolve(specifier, context, next) {
        if (specifier.startsWith('@/')) return { url:pathToFileURL(path.resolve(specifier.slice(2) + '.ts')).href, shortCircuit:true };
        if (specifier === 'next/server') return next('next/server.js',context);
        if (specifier === './database' || specifier === './gdrive' || specifier === './requestOrigin') return next(specifier+'.ts',context);
        return next(specifier, context);
      }});
      const invitation = await import('./app/api/invitation/route.ts');
      const photos = await import('./app/api/photos/route.ts');
      const wishes = await import('./app/api/wishes/route.ts');
      process.env.ADMIN_PASSWORD = 'test-password-not-for-production';
      const login = await import('./app/api/admin/session/route.ts');
      const auth = await import('./lib/adminAuth.ts');
      const loginRequest = (password, origin = 'http://localhost') => new Request('http://localhost/api/admin/session', {method:'POST', headers:{'Content-Type':'application/json',origin},body:JSON.stringify({password})});
      assert.equal((await login.POST(loginRequest('wrong'))).status,401);
      assert.equal((await login.POST(loginRequest(process.env.ADMIN_PASSWORD,'https://other.example'))).status,403);
      const loggedIn = await login.POST(loginRequest(process.env.ADMIN_PASSWORD));
      assert.equal(loggedIn.status,200);
      const cookie = loggedIn.headers.get('set-cookie').split(';')[0];
      assert.ok(loggedIn.headers.get('set-cookie').includes('HttpOnly'));
      const token = cookie.split('=')[1];
      assert.ok(await auth.validSession(token));
      assert.equal(await auth.validSession(token.slice(0,-1)+'z'),false);
      const headers = {'Content-Type':'application/json',origin:'http://localhost',cookie};
      const request = (body) => new Request('http://localhost/api', {method:'POST',headers,body:JSON.stringify(body)});
      const publicRequest = new Request('http://localhost/api');
      assert.equal((await photos.GET(publicRequest)).status,401);
      assert.equal((await invitation.POST(new Request('http://localhost/api',{method:'POST'}))).status,401);
      assert.equal((await photos.POST(new Request('http://localhost/api',{method:'POST'}))).status,401);
      assert.equal((await wishes.DELETE(new Request('http://localhost/api',{method:'DELETE'}))).status,401);
      assert.equal((await invitation.POST(new Request('http://localhost/api',{method:'POST',headers:{cookie,origin:'https://other.example'},body:'{}'}))).status,403);
      const data = await (await invitation.GET(new Request('http://localhost/api/invitation'))).json();
      data.photos.akad = 'test-photo'; data.sections = { galleryTitle:'Custom gallery' };
      assert.equal((await invitation.POST(request(data))).status,200);
      assert.equal((await (await invitation.GET(new Request('http://localhost/api/invitation'))).json()).photos.akad,'test-photo');
      assert.equal((await invitation.POST(request({}))).status,400);
      const local = await import('./lib/localPhotos.ts');
      const localRoute = await import('./app/api/photos/local/route.ts');
      assert.equal((await localRoute.POST(new Request('http://localhost/api/photos/local',{method:'POST'}))).status,401);
      const imageId = 'local_image_identifier_123456789';
      const jpeg = Buffer.from([255,216,255,224]);
      assert.equal(local.imageMime(jpeg),'image/jpeg');
      assert.equal(local.imageMime(Buffer.from('<html>login</html>')),null);
      await local.localPhotoDatabase().prepare('INSERT INTO local_photos VALUES (?, ?, ?)').run(imageId,'image/jpeg',jpeg);
      data.photos.gift = imageId;
      assert.equal((await invitation.POST(request(data))).status,200);
      const publicData = await (await invitation.GET(new Request('http://localhost/api/invitation'))).json();
      assert.equal(publicData.photos.gift,'/api/media/'+imageId);
      const adminData = await (await invitation.GET(new Request('http://localhost/api/invitation?edit=1',{headers}))).json();
      assert.equal(adminData.photos.gift,imageId);
      const media = await import('./app/api/media/[id]/route.ts');
      const imageResponse = await media.GET(new Request('http://localhost/api/media/'+imageId),{params:Promise.resolve({id:imageId})});
      assert.equal(imageResponse.headers.get('content-type'),'image/jpeg');
      assert.deepEqual(Buffer.from(await imageResponse.arrayBuffer()),jpeg);

      assert.equal((await (await invitation.GET(new Request('http://localhost/api/invitation'))).json()).sections.galleryTitle,'Custom gallery');
      assert.equal((await photos.POST(request({photos:[{}]}))).status,400);
      const photoId = 'valid_photo_identifier_123456789';
      assert.equal((await photos.POST(request({photos:[{id:photoId,name:'Test'}]}))).status,200);
      assert.ok((await (await photos.GET(new Request('http://localhost/api/photos',{headers}))).json()).some(p => p.id === photoId));
      const guests = await import('./app/api/guests/route.ts');
      const guestLookup = await import('./app/api/guest/route.ts');
      assert.equal((await guests.GET(publicRequest)).status,401);
      const created = await (await guests.POST(request({guests:[{name:'Verified Guest',phone:'081234567890'}]}))).json();
      const guestToken = created[0].token;
      const repeat = await (await guests.POST(request({guests:[{name:'Verified Guest',phone:'081234567890'}]}))).json();
      assert.equal(repeat[0].token,guestToken);
      const identity = await (await guestLookup.GET(new Request('http://localhost/api/guest?guest='+guestToken+'&to=Fake'))).json();
      assert.deepEqual(identity,{name:'Verified Guest'});
      assert.equal((await guestLookup.GET(new Request('http://localhost/api/guest?guest=invalid'))).status,404);
      assert.equal((await wishes.POST(request({name:'Fake',message:'Test',attendance:'Hadir'}))).status,403);
      const wish = {guestToken,id:'00000000-0000-4000-8000-000000000001', name:'Guest',attendance:'Hadir',message:'Congratulations'};
      assert.equal((await wishes.POST(request(wish))).status,201);
      assert.equal((await wishes.POST(request(wish))).status,201);
      assert.equal((await (await wishes.GET()).json()).length,1);
      assert.equal((await wishes.POST(request({...wish,message:''}))).status,400);
      const savedWish = (await (await wishes.GET()).json())[0];
      assert.equal(savedWish.name,'Verified Guest');
      assert.equal(savedWish.guestToken,undefined);
      assert.equal((await wishes.DELETE(new Request('http://localhost/api/wishes?id='+savedWish.id,{method:'DELETE',headers}))).status,200);
      assert.equal((await (await wishes.GET()).json()).length,0);
      assert.equal((await login.DELETE(new Request('http://localhost/api/admin/session',{method:'DELETE',headers}))).status,200);
      assert.equal(await auth.validSession(token),false);
      const second = await auth.createSession();
      process.env.ADMIN_PASSWORD = 'new-password';
      assert.equal(await auth.validSession(second),false);
      delete process.env.ADMIN_PASSWORD;
      assert.equal((await login.POST(loginRequest('anything'))).status,503);
    `], { encoding:'utf8', env:{...process.env,TURSO_DATABASE_URL:'',undangan_TURSO_DATABASE_URL:'',VERCEL:'',DATABASE_PATH:path.join(dir,'test.sqlite')} });
    assert.equal(result.status,0,result.stderr);
  } finally { rmSync(dir,{recursive:true,force:true}); }
});

test('share links encode guest names and templates preserve literal guest input', () => {
  const result = spawnSync(process.execPath, ['--experimental-strip-types','--input-type=module','-e', `
    import assert from 'node:assert/strict';
    import { invitationLink, guestMessage, whatsappPhone } from './lib/share.ts';
    const link = invitationLink('https://example.com/admin?old=1#test','a'.repeat(48));
    const url = new URL(link); assert.equal(url.pathname,'/'); assert.equal(url.searchParams.get('guest'),'a'.repeat(48));
    assert.equal(url.searchParams.has('to'),false);
    assert.equal(url.searchParams.has('old'),false);
    assert.throws(() => invitationLink('javascript:alert(1)','Guest'));
    assert.equal(guestMessage('Yth {nama}: {link}',{nama:'Guest {link}',link:'https://example.com'}),'Yth Guest {link}: https://example.com');
    assert.equal(whatsappPhone('0812-3456-7890'),'6281234567890');
    assert.equal(whatsappPhone('not-a-number'),'');
  `],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
});
