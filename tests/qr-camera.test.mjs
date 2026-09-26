import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openQrCamera } from '../lib/qrCamera.ts';

function fixture() {
  let tracksStopped = 0, decoderStopped = 0, callback;
  const stream = { getTracks: () => [{ stop() { tracksStopped++; }, applyConstraints() { throw new Error('setPhotoOptions failed'); } }] };
  const video = { srcObject: null, async play() {}, pause() {} };
  const reader = { scan(_video, cb) { callback = cb; return { stop() { decoderStopped++; } }; } };
  return { stream, video, reader, acquire: async () => stream, result: () => callback({ getText: () => 'guest-token' }), counts: () => [tracksStopped, decoderStopped] };
}
test('stops scanner and camera once without changing photo/torch options', async () => {
  const f = fixture();
  const controls = await openQrCamera(f.reader, f.video, () => {}, () => false, f.acquire);
  controls.stop(); controls.stop();
  assert.deepEqual(f.counts(), [1, 1]);
  assert.equal(f.video.srcObject, null);
});
test('a decoded QR releases the camera and is delivered only once', async () => {
  const f = fixture(), results = [];
  const controls = await openQrCamera(f.reader, f.video, value => results.push(value), () => false, f.acquire);
  f.result(); f.result(); controls.stop();
  assert.deepEqual(results, ['guest-token']);
  assert.deepEqual(f.counts(), [1, 1]);
});
test('cancelling while camera permission is pending releases the acquired stream', async () => {
  const f = fixture();
  await openQrCamera(f.reader, f.video, () => assert.fail(), () => true, f.acquire);
  assert.deepEqual(f.counts(), [1, 0]);
});
test('failed video playback releases tracks', async () => {
  const f = fixture();
  f.video.play = async () => { throw new Error('play failed'); };
  await assert.rejects(openQrCamera(f.reader, f.video, () => {}, () => false, f.acquire), /play failed/);
  assert.deepEqual(f.counts(), [1, 0]);
  assert.equal(f.video.srcObject, null);
});
