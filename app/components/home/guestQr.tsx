"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function GuestQr({ token, name }: { token: string; name: string }) {
  const [qr, setQr] = useState<{ token: string; url: string } | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!/^[a-f0-9]{48}$/.test(token) || !name) return;
    let cancelled = false;
    import("qrcode").then(qrcode => qrcode.toDataURL(`undangan:guest:${token}`, { width: 320, margin: 4, errorCorrectionLevel: "M" })).then(url => { if (!cancelled) setQr({ token, url }); }).catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, [token, name]);
  if (!/^[a-f0-9]{48}$/.test(token) || !name) return null;
  const url = qr?.token === token ? qr.url : "";
  return <section className="relative z-10 mx-6 my-8 rounded-2xl border border-white/20 bg-black/60 p-6 text-center space-y-4">
    <p className="text-xs uppercase tracking-[0.3em] text-[#c9a96e]">Check-in tamu</p>
    <h2 className="font-serif text-2xl">{name}</h2>
    <p className="text-sm text-stone-300">Tunjukkan QR ini kepada panitia saat tiba. Satu QR berlaku untuk satu undangan; jumlah orang dicatat panitia.</p>
    {url ? <><Image unoptimized src={url} width={256} height={256} alt={`QR check-in ${name}`} className="mx-auto rounded-xl" /><a href={url} download="qr-undangan.png" className="inline-block rounded-full border border-white/30 px-5 py-2 text-sm">Unduh QR</a></> : <p role="status">{error ? "QR gagal dimuat. Panitia bisa mencari nama Anda saat tiba." : "Menyiapkan QR…"}</p>}
    <p className="text-xs text-stone-400">Simpan QR sebelum berangkat dan jangan bagikan ke orang lain.</p>
  </section>;
}
