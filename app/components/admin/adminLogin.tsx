"use client";
import { useState } from "react";
export default function AdminLogin({ qr = false }: { qr?: boolean }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function login(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch(qr ? "/api/qr/session" : "/api/admin/session", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({password, username}) });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.message || `Server gagal merespons (HTTP ${response.status}). Periksa log deployment dan koneksi database.`);
      if (!result?.success) throw new Error("Respons login tidak valid. Silakan coba lagi.");
      window.location.reload();
    } catch (error) { setError(error instanceof Error ? error.message : "Gagal login. Coba lagi."); setBusy(false); }
  }
  return <main className="min-h-screen flex items-center justify-center bg-stone-100 p-6 font-sans text-stone-800"><form onSubmit={login} className="w-full max-w-sm rounded-2xl border bg-white p-8 shadow-sm space-y-5"><h1 className="text-2xl font-semibold">{qr ? "Login Petugas QR" : "Login Admin"}</h1><p className="text-sm text-stone-500">{qr ? "Masuk untuk scan undangan dan mencatat kehadiran tamu." : "Masukkan password untuk mengelola undangan."}</p>{qr && <label className="block text-sm">Username<input required autoComplete="username" autoCapitalize="none" spellCheck={false} value={username} onChange={e => setUsername(e.target.value)} className="mt-2 w-full rounded-lg border p-3 text-base" /></label>}<label className="block text-sm">Password<input required type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className="mt-2 w-full rounded-lg border p-3 text-base" /></label>{error && <p role="alert" className="text-sm text-red-700">{error}</p>}<button disabled={busy} className="w-full rounded-lg bg-amber-700 px-4 py-3 text-white disabled:opacity-50">{busy ? "Memeriksa…" : "Masuk"}</button>{!qr && <a href="/admin/qr" className="block py-2 text-center text-sm text-emerald-700 underline">Masuk sebagai petugas QR</a>}</form></main>;
}
