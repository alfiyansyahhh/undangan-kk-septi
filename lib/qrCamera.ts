import type { BrowserQRCodeReader, IScannerControls } from "@zxing/browser";

/** Own the stream lifecycle: ZXing's decodeFromConstraints.stop() adjusts torch
 * after stopping tracks, which can reject with setPhotoOptions on mobile. */
export async function openQrCamera(
  reader: Pick<BrowserQRCodeReader, "scan">,
  video: HTMLVideoElement,
  onResult: (text: string) => void,
  cancelled: () => boolean,
  acquire: (constraints: MediaStreamConstraints) => Promise<MediaStream> = constraints => navigator.mediaDevices.getUserMedia(constraints),
): Promise<IScannerControls> {
  const stream = await acquire({ video: { facingMode: { ideal: "environment" } }, audio: false });
  let decoder: IScannerControls | undefined;
  let stopped = false;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    try { decoder?.stop(); }
    finally {
      stream.getTracks().forEach(track => track.stop());
      if (video.srcObject === stream) {
        video.pause();
        video.srcObject = null;
      }
    }
  };
  try {
    if (cancelled()) { stop(); return { stop }; }
    video.srcObject = stream;
    await video.play();
    if (cancelled()) { stop(); return { stop }; }
    decoder = reader.scan(video, result => {
      if (stopped) return;
      if (cancelled()) { stop(); return; }
      if (result) { stop(); onResult(result.getText()); }
    });
    // A result may be delivered synchronously before scan returns its controls.
    if (stopped) decoder.stop();
    return { stop };
  } catch (error) {
    stop();
    throw error;
  }
}
