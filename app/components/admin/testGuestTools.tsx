"use client";
import { useState } from "react";
import Image from "next/image";

export default function TestGuestTools({ onChange, onSelect }: { onChange: () => Promise<void>; onSelect: (token: string) => void }) {
  const [guest, setGuest] = useState<{ token: string; name: string } | null>(null);
  const [qr, setQr] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function act(reset = false) {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/check-in/test", { method: reset ? "DELETE" : "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Permintaan gagal.");
      if (!reset) {
        setGuest(result);
        const qrcode = await import("qrcode");
        setQr(await qrcode.toDataURL(`undangan:guest:${result.token}`, { width: 320, margin: 4 }));
      }
      await onChange();
      setMessage(reset ? "Check-in tamu tes direset. Silakan scan lagi." : "Tamu tes siap. QR yang sama bisa dipakai berulang kali.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Gagal memproses tamu tes."); }
    finally { setBusy(false); }
  }
  const button = "min-h-12 rounded-xl border border-amber-300 bg-white px-4 py-3 text-sm font-medium disabled:opacity-50";
  return <details className="rounded-xl border border-amber-200 bg-amber-50 p-4">
    <summary className="cursor-pointer text-sm font-semibold text-amber-900">Tamu tes & reset check-in</summary>
    <div className="mt-4 space-y-3">
      <p className="text-sm leading-6 text-amber-900">Satu tamu khusus untuk latihan. Tidak masuk rekap kehadiran tamu asli.</p>
      <button type="button" disabled={busy} onClick={() => act()} className={`${button} w-full`}>{busy ? "Memproses..." : "Tampilkan QR Tamu Uji Coba"}</button>
      {guest && <><p className="text-center font-semibold">{guest.name}</p>{qr && <Image unoptimized src={qr} width={256} height={256} alt="QR Tamu Uji Coba" className="mx-auto w-full max-w-64 rounded-xl" />}<div className="grid gap-2 sm:grid-cols-2"><button type="button" disabled={busy} onClick={() => onSelect(guest.token)} className={button}>Coba check-in manual</button><button type="button" disabled={busy} onClick={() => act(true)} className={button}>Reset check-in tamu tes</button></div><a href={`/?guest=${guest.token}`} target="_blank" rel="noopener noreferrer" className="block py-2 text-center text-sm text-amber-900 underline">Buka undangan tamu tes</a>{qr && <a href={qr} download="qr-tamu-tes.png" className="block py-2 text-center text-sm text-amber-900 underline">Unduh QR untuk tes di perangkat lain</a>}</>}
      {message && <p role="status" className="text-sm text-amber-900">{message}</p>}
    </div>
  </details>;
}
