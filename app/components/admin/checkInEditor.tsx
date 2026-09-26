"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { IScannerControls } from "@zxing/browser";

type Row = { token: string; name: string; checkedInAt: string | null; partySize: number | null };
type Guest = { token: string; name: string; checkIn: { checkedInAt: string; partySize: number } | null };
const button = "rounded-lg border px-4 py-2 text-sm disabled:opacity-50";

function tokenFromInput(value: string) {
  const text = value.trim();
  if (/^[a-f0-9]{48}$/.test(text)) return text;
  if (/^undangan:guest:[a-f0-9]{48}$/.test(text)) return text.slice(15);
  try {
    const url = new URL(text);
    if (url.origin === window.location.origin && /^[a-f0-9]{48}$/.test(url.searchParams.get("guest") || "")) return url.searchParams.get("guest");
  } catch { /* Not an invitation URL. */ }
  return null;
}

export default function CheckInEditor() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [input, setInput] = useState("");
  const [guest, setGuest] = useState<Guest | null>(null);
  const [size, setSize] = useState(1);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const controls = useRef<IScannerControls | null>(null);
  const scanGeneration = useRef(0);
  const locked = useRef(false);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/check-in", { cache: "no-store" });
    const body = await response.json();
    if (!response.ok) throw new Error(body.message || "Gagal memuat kehadiran.");
    if (mounted.current) { setRows(body); setLoaded(true); }
  }, []);
  useEffect(() => {
    mounted.current = true;
    refresh().catch(error => setNotice(error.message));
    return () => {
      mounted.current = false;
      // Invalidate the latest pending camera request, not the initial generation.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      scanGeneration.current++;
      controls.current?.stop();
    };
  }, [refresh]);

  function stopScan() {
    scanGeneration.current++;
    controls.current?.stop(); controls.current = null;
    setScanning(false);
  }
  async function lookup(value: string) {
    if (locked.current) return;
    stopScan(); setGuest(null); setNotice("");
    const token = tokenFromInput(value);
    if (!token) { setNotice("QR tidak dikenali. Gunakan QR undangan atau cari nama tamu."); return; }
    locked.current = true; setBusy(true);
    try {
      const response = await fetch(`/api/check-in?guest=${encodeURIComponent(token)}`, { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message);
      if (mounted.current) { setGuest(body); setSize(1); }
    } catch (error) { if (mounted.current) setNotice(error instanceof Error ? error.message : "Gagal membaca tamu."); }
    finally { locked.current = false; if (mounted.current) setBusy(false); }
  }
  async function startScan() {
    stopScan(); setGuest(null); setNotice(""); setScanning(true);
    const generation = scanGeneration.current;
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Kamera memerlukan HTTPS atau localhost. Gunakan pencarian nama jika kamera tidak tersedia.");
      const { BrowserQRCodeReader } = await import("@zxing/browser");
      if (!mounted.current || generation !== scanGeneration.current || !video.current) return;
      let found = false;
      const scanner = await new BrowserQRCodeReader().decodeFromConstraints({ video: { facingMode: { ideal: "environment" } }, audio: false }, video.current, (result, _error, scanControls) => {
        if (!result || found || generation !== scanGeneration.current) return;
        found = true; scanControls.stop(); void lookup(result.getText());
      });
      if (!mounted.current || generation !== scanGeneration.current || found) scanner.stop();
      else controls.current = scanner;
    } catch (error) {
      if (mounted.current && generation === scanGeneration.current) { stopScan(); setNotice(error instanceof Error ? `Kamera tidak bisa dibuka: ${error.message}. Anda bisa mencari nama tamu.` : "Kamera tidak tersedia. Cari nama tamu."); }
    }
  }
  async function confirm() {
    if (!guest || locked.current) return;
    locked.current = true; setBusy(true); setNotice("");
    try {
      const response = await fetch("/api/check-in", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: guest.token, partySize: size }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message);
      setGuest({ ...guest, checkIn: body.checkIn });
      setNotice(body.alreadyCheckedIn ? "Tamu sudah check-in. Jumlah kehadiran tidak ditambahkan lagi." : `Kehadiran ${body.name} berhasil dicatat.`);
      try { await refresh(); } catch { setNotice("Check-in tersimpan, tetapi rekap belum berhasil dimuat. Klik Perbarui rekap."); }
    } catch (error) { setNotice(error instanceof Error ? error.message : "Gagal menyimpan. Periksa koneksi lalu coba lagi."); }
    finally { locked.current = false; setBusy(false); }
  }
  const checked = rows.filter(row => row.checkedInAt);
  const filtered = rows.filter(row => row.name.toLowerCase().includes(query.toLowerCase()));
  return <section className="space-y-5 rounded-xl border bg-white p-5">
    <h2 className="text-xl font-semibold">QR check-in</h2>
    <p className="text-sm text-stone-600">Scan QR tamu, periksa nama, lalu isi jumlah orang yang datang bersama. Check-in langsung tersimpan tanpa tombol Simpan Perubahan.</p>
    <div className="grid grid-cols-3 gap-3 text-center">{[["Undangan hadir", checked.length], ["Orang hadir", checked.reduce((sum, row) => sum + (row.partySize || 0), 0)], ["Belum hadir", rows.length - checked.length]].map(([label, count]) => <div key={label} className="rounded-xl bg-stone-100 p-3"><strong className="block text-2xl">{loaded ? count : "—"}</strong><span className="text-xs">{label}</span></div>)}</div>
    <div className="flex flex-wrap gap-2"><button disabled={busy || scanning} onClick={startScan} className={`${button} bg-emerald-700 text-white`}>Buka kamera</button>{scanning && <button onClick={stopScan} className={button}>Tutup kamera</button>}<button disabled={busy} onClick={() => refresh().then(() => setNotice("Rekap diperbarui.")).catch(error => setNotice(error.message))} className={button}>Perbarui rekap</button></div>
    <video ref={video} muted playsInline className={`w-full max-w-md rounded-xl bg-black ${scanning ? "" : "hidden"}`} />
    {scanning && <p role="status" className="text-sm">Arahkan kamera ke QR undangan.</p>}
    <form onSubmit={e => { e.preventDefault(); void lookup(input); }} className="flex flex-wrap items-end gap-2"><label className="flex-1 text-sm">Link atau kode QR<input value={input} onChange={e => setInput(e.target.value)} className="mt-1 w-full rounded-lg border p-2" placeholder="Tempel link undangan personal" /></label><button disabled={busy || !input.trim()} className={button}>Periksa tamu</button></form>
    {notice && <p role="status" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{notice}</p>}
    {guest && <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 space-y-3"><h3 className="text-lg font-semibold">{guest.name}</h3>{guest.checkIn ? <p>Sudah hadir: {guest.checkIn.partySize} orang · {new Date(guest.checkIn.checkedInAt).toLocaleString("id-ID")}</p> : <><label className="block text-sm">Jumlah orang yang hadir<input type="number" min={1} max={100} step={1} value={size} onChange={e => setSize(e.target.valueAsNumber)} className="ml-3 w-24 rounded border bg-white p-2" /></label><button disabled={busy || !Number.isInteger(size) || size < 1 || size > 100} onClick={confirm} className={`${button} bg-emerald-700 text-white`}>{busy ? "Menyimpan…" : "Konfirmasi kehadiran"}</button></>}</div>}
    <label className="block text-sm">Cari nama tamu<input value={query} onChange={e => setQuery(e.target.value)} placeholder="Nama tamu / keluarga" className="mt-1 w-full rounded-lg border p-3" /></label>
    <div className="max-h-96 overflow-auto"><table className="w-full text-left text-sm"><thead><tr><th className="p-2">Nama</th><th className="p-2">Kehadiran</th><th className="p-2">Tindakan</th></tr></thead><tbody>{filtered.map(row => <tr key={row.token} className="border-t"><td className="p-2">{row.name}</td><td className="p-2">{row.checkedInAt ? <>{row.partySize} orang<p className="text-xs text-stone-500">{new Date(row.checkedInAt).toLocaleString("id-ID")}</p></> : "Belum hadir"}</td><td className="p-2"><button disabled={busy} onClick={() => lookup(row.token)} className={button}>{row.checkedInAt ? "Lihat" : "Check-in"}</button></td></tr>)}</tbody></table>{loaded && !filtered.length && <p className="p-3 text-sm">{rows.length ? "Nama tidak ditemukan." : "Tambahkan tamu lewat tab Bagikan Undangan terlebih dahulu."}</p>}</div>
  </section>;
}
