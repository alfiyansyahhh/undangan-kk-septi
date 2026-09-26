"use client";

import { revealMotion } from "./revealMotion";
import { motion } from "framer-motion";

import { useState } from "react";

export interface Wish {
  id: string;
  name: string;
  attendance: "Hadir" | "Tidak Hadir" | "Ragu-ragu";
  message: string;
  time: string;
}

interface WishSectionProps {
  guestName: string;
  title?: string;
  description?: string;
  wishes: Wish[];
  onSubmitWish: (newWish: Omit<Wish, "id" | "time">) => Promise<void>;
}

export default function WishSection({
  guestName,
  title,
  description, wishes, onSubmitWish }: WishSectionProps) {
  const [wishForm, setWishForm] = useState({
    name: "",
    attendance: "Hadir" as "Hadir" | "Tidak Hadir" | "Ragu-ragu",
    message: "",
  });

  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !wishForm.message) return;

    if (sending) return;
    setSending(true);
    setError("");
    try {
      await onSubmitWish({ ...wishForm, name:guestName });
      setWishForm({ name: "", attendance: "Hadir", message: "" });
    } catch { setError("Ucapan belum tersimpan. Silakan coba lagi."); }
    finally { setSending(false); }
  };

  return (
    <section className="relative px-6 py-14 font-sans sm:px-8">
      <div className="mx-auto max-w-md space-y-8">
      <motion.div {...revealMotion("title", 0)} className="text-center space-y-4">
        <p className="text-[10px] font-sans font-light uppercase tracking-[0.4em] text-[#c9a96e]">
          Buku Tamu
        </p>
        <h2 className="font-serif text-2xl sm:text-3xl tracking-wide text-white">{title || "Ucapan & Doa Restu"}</h2>
        <div className="gold-divider w-24 mx-auto" />
        <p className="mx-auto max-w-[260px] text-xs leading-6 text-stone-300">
          {description || "Kirimkan doa dan ucapan terbaik untuk kedua mempelai"}
        </p>
      </motion.div>

      {!guestName && <p role="status" className="text-center text-sm text-stone-300">Buka link undangan personal dari mempelai untuk mengisi RSVP.</p>}
      <motion.form {...revealMotion("fade", 0.1)}
        onSubmit={handleSubmit}
        className="relative space-y-6 rounded-2xl border border-[#c9a96e]/20 bg-gradient-to-b from-[#1c1914]/95 to-[#101010]/95 p-6 shadow-xl sm:p-7"
      >
        <div>
          <label htmlFor="wish-name" className="mb-2 block text-[10px] font-medium uppercase tracking-[0.16em] text-[#d1bd97]">Nama Anda</label>
          <input
            id="wish-name"            type="text"
            placeholder="Buka link undangan personal Anda"
            required
            value={guestName}
            readOnly
            onChange={(e) => setWishForm({ ...wishForm, name: e.target.value })}
            className="w-full rounded-none border-0 border-b border-[#c9a96e]/25 bg-transparent px-0 py-3 font-sans text-base text-stone-100 placeholder-stone-500 transition-colors focus:border-[#ddc08a] focus:outline-none focus:ring-0 sm:text-sm"
          />
        </div>

        <fieldset>
          <legend className="mb-3 block text-[10px] font-medium uppercase tracking-[0.16em] text-[#d1bd97]">Konfirmasi Kehadiran</legend>
          <div className="grid gap-2">
            {([
              ["Hadir", "Saya akan hadir"],
              ["Tidak Hadir", "Maaf, tidak bisa hadir"],
              ["Ragu-ragu", "Masih ragu-ragu"],
            ] as const).map(([value, label]) => (
              <label key={value} className="relative cursor-pointer">
                <input type="radio" name="attendance" value={value} checked={wishForm.attendance === value} onChange={() => setWishForm({ ...wishForm, attendance: value })} className="peer sr-only" />
                <span className="flex min-h-12 items-center gap-3 rounded-xl border border-white/10 bg-black/15 px-4 py-3 text-sm text-stone-400 transition-colors hover:border-[#c9a96e]/40 peer-checked:border-[#c9a96e]/60 peer-checked:bg-[#c9a96e]/10 peer-checked:text-[#eee0c6] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#ddc08a]">
                  <span aria-hidden="true" className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${wishForm.attendance === value ? "border-[#c9a96e]" : "border-stone-600"}`}>{wishForm.attendance === value && <span className="h-2 w-2 rounded-full bg-[#c9a96e]" />}</span>
                  {label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="wish-message" className="mb-2 block text-[10px] font-medium uppercase tracking-[0.16em] text-[#d1bd97]">Pesan / Doa Restu</label>
          <textarea
            id="wish-message"            rows={3}
            placeholder="Tuliskan ucapan dan doa terbaik..."
            required
            value={wishForm.message}
            onChange={(e) => setWishForm({ ...wishForm, message: e.target.value })}
            className="w-full rounded-none border-0 border-b border-[#c9a96e]/25 bg-transparent px-0 py-3 font-sans text-base text-stone-100 placeholder-stone-500 transition-colors focus:border-[#ddc08a] focus:outline-none focus:ring-0 sm:text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={sending || !guestName}
          className="min-h-12 w-full cursor-pointer rounded-full border border-[#ddc08a]/40 bg-gradient-to-r from-[#c9a96e] to-[#b3945c] px-4 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[#19150e] transition-colors hover:from-[#ddc08a] hover:to-[#c9a96e] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ddc08a]"
        >
          {sending ? "Menyimpan…" : "Kirim Ucapan & Doa"}
        </button>
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      </motion.form>

      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#d1bd97]">Doa &amp; harapan</span>
          <div aria-hidden="true" className="h-px flex-1 bg-[#c9a96e]/20" />
          <span className="text-[10px] tabular-nums text-stone-400">{wishes.length} ucapan</span>
        </div>
        <div className="max-h-[28rem] space-y-3 overflow-y-auto pr-1">
        {wishes.length === 0 && (
          <p className="py-6 text-center text-xs leading-6 text-stone-400">Jadilah yang pertama mengirimkan doa dan harapan.</p>
        )}
        {wishes.map((w) => (
          <motion.div {...revealMotion("text", 0)} key={w.id} className="space-y-3 rounded-xl border border-[#c9a96e]/20 bg-black/70 p-5 shadow-lg backdrop-blur-xl">
            <div key="author" className="flex items-start justify-between gap-3">
              <span className="min-w-0 break-words font-serif text-lg font-normal tracking-wide text-[#eee5d5]">{w.name}</span>
              <span
                className={`shrink-0 text-[9px] px-2 py-1 rounded-full font-normal tracking-wide ${
                  w.attendance === "Hadir"
                    ? "bg-[#c9a96e]/10 text-[#d1bd97] border border-[#c9a96e]/20"
                    : w.attendance === "Tidak Hadir"
                    ? "bg-stone-800 text-stone-400 border border-stone-700"
                    : "bg-stone-800/50 text-stone-300 border border-stone-700/50"
                }`}
              >
                {w.attendance}
              </span>
            </div>
            <p key="message" className="whitespace-pre-wrap break-words text-xs text-stone-200 leading-6">{w.message}</p>
            <span key="time" className="text-[10px] text-stone-400 block pt-1">{w.time}</span>
          </motion.div>
        ))}
        </div>
      </div>
      </div>
    </section>
  );
}
