import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sameOrigin } from '../lib/requestOrigin.ts';

const request = (origin, host = '10.225.242.58:3000') => new Request('http://localhost:3000/api/qr/session', {
  method: 'POST', headers: { host, ...(origin === undefined ? {} : { origin }) },
});
test('allows only the configured HTTPS tunnel in development even with an internal Host', () => {
  const tunnel = 'https://cxl500x8-3000.asse.devtunnels.ms';
  assert.equal(sameOrigin(request(tunnel, 'localhost:3000'), true, tunnel), true);
  assert.equal(sameOrigin(request(tunnel, 'localhost:3000'), false, tunnel), false);
  assert.equal(sameOrigin(request('https://other.asse.devtunnels.ms'), true, tunnel), false);
  assert.equal(sameOrigin(request('http://evil.example'), true, 'invalid'), false);
});
test('accepts the LAN destination host only in development', () => {
  assert.equal(sameOrigin(request('http://10.225.242.58:3000'), true), true);
  assert.equal(sameOrigin(request('http://10.225.242.58:3000'), false), false);
  assert.equal(sameOrigin(request('http://localhost:3000'), false), true);
});
test('handles the observed tunnel HTTP localhost origin on an HTTPS localhost request', () => {
  const make = (origin = 'http://localhost:3000', host = 'localhost:3000') => new Request('https://localhost:3000/api/check-in', { method: 'POST', headers: { origin, host } });
  assert.equal(sameOrigin(make(), true), true);
  assert.equal(sameOrigin(make(), false), false);
  assert.equal(sameOrigin(make('http://localhost:4000'), true), false);
  assert.equal(sameOrigin(make('http://evil.example'), true), false);
  assert.equal(sameOrigin(make('http://localhost:3000', 'other.example'), true), false);
});
test('rejects other sites, ports, protocols and missing or malformed origins', () => {
  for (const origin of ['http://evil.example', 'http://10.225.242.58:4000', 'https://10.225.242.58:3000', 'null', undefined, 'invalid', 'http://10.225.242.58:3000/path']) {
    assert.equal(sameOrigin(request(origin), true), false, String(origin));
  }
  const forwarded = request('http://evil.example');
  forwarded.headers.set('x-forwarded-host', 'evil.example');
  assert.equal(sameOrigin(forwarded, true), false);
});
