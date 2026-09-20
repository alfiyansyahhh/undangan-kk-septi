"use client";
import { useEffect, useState } from "react";
import type { Wish } from "../home/wishSection";
export default function WishesEditor() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  useEffect(() => {
    fetch("/api/wishes", { cache: "no-store" }).then(async res => {
      if (!res.ok) throw new Error();
      setWishes(await res.json());
    }).catch(() => setError("Gagal memuat ucapan. Buka tab ini kembali untuk mencoba lagi.")).finally(() => setLoading(false));
  }, []);
  async function remove(id: string) {
    if (!window.confirm("Hapus ucapan ini?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/wishes?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setWishes(current => current.filter(w => w.id !== id));
    } catch { setError("Gagal menghapus ucapan."); }
    finally { setDeleting(null); }
  }
  return <section className="rounded-xl bg-white border p-5 space-y-4"><h2 className="font-bold">Buku tamu ({wishes.length})</h2>
    {loading && <p>Memuat…</p>}{error && <p role="alert" className="text-red-700">{error}</p>}
    {!loading && !error && !wishes.length && <p>Belum ada ucapan.</p>}
    {wishes.map(w => <article key={w.id} className="border rounded-lg p-4 space-y-2"><div className="flex justify-between gap-4"><strong>{w.name}</strong><span className="text-sm">{w.attendance}</span></div><p className="whitespace-pre-wrap break-words">{w.message}</p><p className="text-xs text-stone-500">{w.time}</p><button type="button" disabled={deleting !== null} onClick={() => remove(w.id)} className="text-sm text-red-700">{deleting === w.id ? "Menghapus…" : "Hapus ucapan"}</button></article>)}
  </section>;
}
