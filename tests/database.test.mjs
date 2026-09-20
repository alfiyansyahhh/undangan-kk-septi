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
      cwd: process.cwd(), encoding: 'utf8', env: { ...process.env, DATABASE_PATH: path.join(dir, 'test.sqlite') },
    });
    assert.equal(result.status, 0, result.stderr);
  };
  try {
    run(`import { readInvitation, saveInvitation, savePhotos, database } from './lib/database.ts';
      const data = readInvitation(); data.couple.title = 'Persistence test'; data.photos.gift = 'chosen-photo';
      saveInvitation(data); savePhotos([{ id:'test-photo', name:'Test', thumbnail:'https://example.com/test.jpg', full:'https://example.com/test.jpg' }]);
      database().prepare('INSERT INTO wishes VALUES (?, ?, ?)').run('test-wish', JSON.stringify({name:'Test guest'}), new Date().toISOString());`);
    run(`import assert from 'node:assert/strict'; import { readInvitation, readPhotos, database } from './lib/database.ts';
      assert.equal(readInvitation().couple.title, 'Persistence test');
      assert.equal(readInvitation().photos.gift, 'chosen-photo');
      assert.ok(readPhotos().some(p => p.id === 'test-photo'));
      assert.equal(JSON.parse(database().prepare('SELECT value FROM wishes WHERE id = ?').get('test-wish').value).name, 'Test guest');`);
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
        return next(specifier, context);
      }});
      const invitation = await import('./app/api/invitation/route.ts');
      const photos = await import('./app/api/photos/route.ts');
      const wishes = await import('./app/api/wishes/route.ts');
      const request = (body) => new Request('http://localhost/api', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      const data = await (await invitation.GET()).json();
      data.photos.akad = 'test-photo'; data.sections = { galleryTitle:'Custom gallery' };
      assert.equal((await invitation.POST(request(data))).status,200);
      assert.equal((await (await invitation.GET()).json()).photos.akad,'test-photo');
      assert.equal((await invitation.POST(request({}))).status,400);
      assert.equal((await (await invitation.GET()).json()).sections.galleryTitle,'Custom gallery');
      assert.equal((await photos.POST(request({photos:[{}]}))).status,400);
      const photoId = 'valid_photo_identifier_123456789';
      assert.equal((await photos.POST(request({photos:[{id:photoId,name:'Test'}]}))).status,200);
      assert.ok((await (await photos.GET()).json()).some(p => p.id === photoId));
      const wish = {id:'00000000-0000-4000-8000-000000000001', name:'Guest',attendance:'Hadir',message:'Congratulations'};
      assert.equal((await wishes.POST(request(wish))).status,201);
      assert.equal((await wishes.POST(request(wish))).status,201);
      assert.equal((await (await wishes.GET()).json()).length,1);
      assert.equal((await wishes.POST(request({...wish,name:''}))).status,400);
      assert.equal((await wishes.DELETE(new Request('http://localhost/api/wishes?id='+wish.id,{method:'DELETE'}))).status,200);
      assert.equal((await (await wishes.GET()).json()).length,0);
    `], { encoding:'utf8', env:{...process.env,DATABASE_PATH:path.join(dir,'test.sqlite')} });
    assert.equal(result.status,0,result.stderr);
  } finally { rmSync(dir,{recursive:true,force:true}); }
});
