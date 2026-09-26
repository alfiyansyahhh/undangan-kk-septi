"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { IScannerControls } from "@zxing/browser";
import { openQrCamera } from "@/lib/qrCamera";
import TestGuestTools from "./testGuestTools";

type Row = { token: string; name: string; checkedInAt: string | null; partySize: number | null; isTest: number };
type Guest = { token: string; name: string; checkIn: { checkedInAt: string; partySize: number } | null };
const button = "min-h-12 rounded-xl border px-4 py-3 text-sm font-medium transition active:scale-[0.98] disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700";

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
  const resultPanel = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (guest) resultPanel.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [guest]);

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
      const scanner = await openQrCamera(
        new BrowserQRCodeReader(), video.current,
        text => { void lookup(text); },
        () => !mounted.current || generation !== scanGeneration.current,
      );
      if (!mounted.current || generation !== scanGeneration.current) scanner.stop();
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
  const realGuests = rows.filter(row => !row.isTest);
  const checked = realGuests.filter(row => row.checkedInAt);
  const filtered = rows.filter(row => row.name.toLowerCase().includes(query.toLowerCase()));
  const exportToExcel = () => {
    const exportRows = rows.map(row => ({
      nama: row.name,
      status: row.checkedInAt ? "Sudah hadir" : "Belum hadir",
      jumlahOrang: row.partySize && row.checkedInAt ? row.partySize : 0,
      waktu: row.checkedInAt ? new Date(row.checkedInAt).toLocaleString("id-ID") : "-",
      tipe: row.isTest ? "Tes" : "Undangan",
    }));
    const header = ["Nama tamu", "Status", "Jumlah orang", "Waktu hadir", "Tipe"];
    const separator = ";";
    const csv = [
      header,
      ...exportRows.map(row => [row.nama, row.status, String(row.jumlahOrang), row.waktu, row.tipe]),
    ]
      .map(values => values.map(value => `"${String(value).replace(/"/g, '""')}"`).join(separator))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "application/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "rekap-tamu.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setNotice("File Excel/CSV berhasil dibuat.");
  };
  return <section className="min-w-0 space-y-5 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
    <div><h2 className="text-xl font-semibold">QR check-in</h2><p className="mt-1 text-sm leading-6 text-stone-500">Scan undangan, periksa nama, lalu konfirmasi jumlah tamu.</p></div>
    <div className="grid gap-2 sm:grid-cols-3">{[["Undangan hadir", checked.length], ["Orang hadir", checked.reduce((sum, row) => sum + (row.partySize || 0), 0)], ["Belum hadir", realGuests.length - checked.length]].map(([label, count]) => <div key={label} className="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-4 text-center"><strong className="block text-2xl tabular-nums text-emerald-800">{loaded ? count : "-"}</strong><span className="mt-1 block text-[11px] font-medium uppercase tracking-[0.12em] text-stone-600">{label}</span></div>)}</div>
    <div className="space-y-3 rounded-2xl bg-stone-950 p-4 text-white">
      <div className="flex items-center justify-between gap-2"><span className="text-xs font-medium uppercase tracking-widest text-emerald-300">Pemindai QR</span>{scanning && <span className="text-xs text-stone-400">Kamera aktif</span>}</div>
      <video ref={video} muted playsInline className={`aspect-square max-h-[45dvh] w-full rounded-xl bg-black object-cover ${scanning ? "" : "hidden"}`} />
      {!scanning && <div className="py-5 text-center"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 h-12 w-12 text-emerald-300"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M3 12h18" /><path d="M7 7h3v3H7zm7 7h3v3h-3z" /></svg><p className="text-sm text-stone-300">Siap menyambut tamu berikutnya</p></div>}
      <button type="button" disabled={busy} onClick={scanning ? stopScan : startScan} className={`${button} w-full border-emerald-500 bg-emerald-600 text-white`}>{scanning ? "Tutup kamera" : "Scan QR tamu"}</button>
      {scanning && <p role="status" className="text-center text-xs text-stone-400">Arahkan kamera ke QR pada undangan tamu.</p>}
    </div>
    {notice && <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{notice}</p>}
    {busy && <p role="status" className="text-sm text-stone-500">Memproses...</p>}
    {guest && <div ref={resultPanel} className="scroll-mt-5 space-y-4 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 sm:p-5"><p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">{guest.checkIn ? "Sudah check-in" : "Konfirmasi tamu"}</p><h3 className="break-words text-xl font-semibold">{guest.name}</h3>{guest.checkIn ? <><p className="text-sm leading-6">{guest.checkIn.partySize} orang / {new Date(guest.checkIn.checkedInAt).toLocaleString("id-ID")}</p><button disabled={busy} onClick={startScan} className={`${button} w-full bg-emerald-700 text-white`}>Scan tamu berikutnya</button></> : <><label htmlFor="party-size" className="block text-sm">Jumlah orang yang hadir</label><div className="flex items-center gap-3"><button type="button" aria-label="Kurangi jumlah orang" disabled={busy || size <= 1} onClick={() => setSize(current => Math.max(1, (current || 1) - 1))} className={`${button} w-14 bg-white text-xl`}>-</button><input id="party-size" type="number" inputMode="numeric" min={1} max={100} step={1} value={Number.isNaN(size) ? "" : size} disabled={busy} onChange={e => setSize(e.target.valueAsNumber)} className="min-h-12 w-0 flex-1 rounded-xl border border-emerald-200 bg-white p-3 text-center text-xl" /><button type="button" aria-label="Tambah jumlah orang" disabled={busy || size >= 100} onClick={() => setSize(current => Math.min(100, (current || 0) + 1))} className={`${button} w-14 bg-white text-xl`}>+</button></div><button disabled={busy || !Number.isInteger(size) || size < 1 || size > 100} onClick={confirm} className={`${button} w-full bg-emerald-700 text-white`}>{busy ? "Menyimpan..." : "Konfirmasi kehadiran"}</button></>}</div>}
    {process.env.NODE_ENV === "development" && <TestGuestTools onSelect={lookup} onChange={async () => { setGuest(null); await refresh(); }} />}
    <details className="rounded-xl border border-stone-200 p-4"><summary className="cursor-pointer text-sm font-medium">Pakai link / kode QR manual</summary><form onSubmit={e => { e.preventDefault(); void lookup(input); }} className="mt-4 space-y-3"><label className="block text-sm">Link atau kode QR<input value={input} onChange={e => setInput(e.target.value)} className="mt-2 w-full min-w-0 rounded-xl border p-3 text-base" placeholder="Tempel link undangan personal" /></label><button disabled={busy || !input.trim()} className={`${button} w-full`}>Periksa tamu</button></form></details>
    <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold">Daftar tamu</h3><div className="flex flex-wrap items-center gap-2"><button disabled={busy} onClick={() => refresh().then(() => setNotice("Rekap diperbarui.")).catch(error => setNotice(error.message))} className={`${button} text-emerald-800`}>Perbarui rekap</button><button type="button" onClick={exportToExcel} className={`${button} border-emerald-200 bg-emerald-50 text-emerald-800`}>Export Excel</button></div></div>
    <label className="block text-sm">Cari nama tamu<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Nama tamu / keluarga" className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 text-base" /></label>
    <div className="overflow-hidden rounded-2xl border border-stone-200">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-stone-100 text-stone-700">
            <tr>
              <th className="px-3 py-3 font-semibold">Nama tamu</th>
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="px-3 py-3 font-semibold">Waktu</th>
              <th className="px-3 py-3 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 bg-white">
            {filtered.map(row => (
              <tr key={row.token} className="align-top hover:bg-stone-50">
                <td className="px-3 py-3">
                  <div className="min-w-0">
                    <p className="break-words font-medium text-stone-800">{row.name}{!!row.isTest && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-700">Tes</span>}</p>
                  </div>
                </td>
                <td className="px-3 py-3">
                  {row.checkedInAt ? (
                    <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">Sudah hadir</span>
                  ) : (
                    <span className="inline-flex rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600">Belum hadir</span>
                  )}
                </td>
                <td className="px-3 py-3 text-stone-600">
                  {row.checkedInAt ? (
                    <span className="block text-xs">{new Date(row.checkedInAt).toLocaleString("id-ID")}</span>
                  ) : (
                    <span className="text-xs text-stone-400">-</span>
                  )}
                </td>
                <td className="px-3 py-3 text-right">
                  {row.checkedInAt ? (
                    <span className="text-xs font-medium text-emerald-700">{row.partySize || 1} orang</span>
                  ) : (
                    <button disabled={busy} onClick={() => lookup(row.token)} className={`${button} shrink-0 border-emerald-200 bg-emerald-50 text-emerald-800`}>Check-in</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {loaded && !filtered.length && <p className="p-3 text-sm text-stone-500">{rows.length ? "Nama tidak ditemukan." : "Belum ada tamu. Hubungi admin utama untuk menambahkan daftar tamu."}</p>}
    </div>
  </section>;
}
