"use client";
import { useState } from "react";
import Link from "next/link";
import CheckInEditor from "./checkInEditor";
export default function QrDashboard({ staff }: { staff: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function logout() {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/qr/session", { method: "DELETE" });
      if (!response.ok) throw new Error();
      window.location.reload();
    } catch { setError("Gagal keluar. Coba lagi."); setBusy(false); }
  }
  return <main className="min-h-dvh bg-stone-100 px-3 pb-[max(2rem,env(safe-area-inset-bottom))] font-sans text-stone-900 sm:px-6">
    <header className="mx-auto flex max-w-3xl items-center justify-between gap-3 py-5"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700">Penerima tamu</p><h1 className="text-xl font-bold">Check-in Undangan</h1></div>{staff ? <button disabled={busy} onClick={logout} className="min-h-11 rounded-xl border bg-white px-4 text-sm disabled:opacity-50">{busy ? "Keluar…" : "Keluar"}</button> : <Link href="/admin" className="rounded-xl border bg-white p-3 text-sm">Admin utama</Link>}</header>
    {error && <p role="alert" className="mx-auto mb-3 max-w-3xl text-sm text-red-700">{error}</p>}
    <div className="mx-auto max-w-3xl"><CheckInEditor /></div>
  </main>;
}
