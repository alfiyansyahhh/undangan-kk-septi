"use client";

import { useState } from "react";

export interface Wish {
  id: string;
  name: string;
  attendance: "Hadir" | "Tidak Hadir" | "Ragu-ragu";
  message: string;
  time: string;
}

interface WishSectionProps {
  wishes: Wish[];
  onSubmitWish: (newWish: Omit<Wish, "id" | "time">) => void;
}

export default function WishSection({ wishes, onSubmitWish }: WishSectionProps) {
  const [wishForm, setWishForm] = useState({
    name: "",
    attendance: "Hadir" as "Hadir" | "Tidak Hadir" | "Ragu-ragu",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishForm.name || !wishForm.message) return;

    onSubmitWish(wishForm);
    setWishForm({ name: "", attendance: "Hadir", message: "" });
  };

  return (
    <section className="relative px-6 py-14 font-sans sm:px-8">
      <div className="mx-auto max-w-md space-y-8">
      <div className="text-center space-y-4">
        <p className="text-[10px] font-sans font-light uppercase tracking-[0.4em] text-[#c9a96e]">
          Buku Tamu
        </p>
        <h2 className="font-serif text-2xl sm:text-3xl tracking-wide text-white">Ucapan & Doa Restu</h2>
        <div className="gold-divider w-24 mx-auto" />
        <p className="mx-auto max-w-[260px] text-xs leading-6 text-stone-300">
          Kirimkan doa dan ucapan terbaik untuk kedua mempelai
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative space-y-6 rounded-2xl border border-[#c9a96e]/20 bg-gradient-to-b from-[#1c1914]/95 to-[#101010]/95 p-6 shadow-xl sm:p-7"
      >
        <div>
          <label htmlFor="wish-name" className="mb-2 block text-[10px] font-medium uppercase tracking-[0.16em] text-[#d1bd97]">Nama Anda</label>
          <input
            id="wish-name"            type="text"
            placeholder="Contoh: Budi Santoso"
            required
            value={wishForm.name}
            onChange={(e) => setWishForm({ ...wishForm, name: e.target.value })}
            className="w-full rounded-none border-0 border-b border-[#c9a96e]/25 bg-transparent px-0 py-3 font-sans text-base text-stone-100 placeholder-stone-500 transition-colors focus:border-[#ddc08a] focus:outline-none focus:ring-0 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="wish-attendance" className="mb-2 block text-[10px] font-medium uppercase tracking-[0.16em] text-[#d1bd97]">Konfirmasi Kehadiran</label>
          <select
            id="wish-attendance"            value={wishForm.attendance}
            onChange={(e) =>
              setWishForm({
                ...wishForm,
                attendance: e.target.value as "Hadir" | "Tidak Hadir" | "Ragu-ragu",
              })
            }
            className="w-full rounded-none border-0 border-b border-[#c9a96e]/25 bg-transparent px-0 py-3 font-sans text-base text-stone-100 transition-colors focus:border-[#ddc08a] focus:outline-none focus:ring-0 sm:text-sm"
          >
            <option className="bg-[#171512]" value="Hadir">Saya akan Hadir</option>
            <option className="bg-[#171512]" value="Tidak Hadir">Maaf, Tidak Bisa Hadir</option>
            <option className="bg-[#171512]" value="Ragu-ragu">Masih Ragu-ragu</option>
          </select>
        </div>

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
          className="min-h-12 w-full cursor-pointer rounded-full border border-[#ddc08a]/40 bg-gradient-to-r from-[#c9a96e] to-[#b3945c] px-4 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[#19150e] transition-colors hover:from-[#ddc08a] hover:to-[#c9a96e] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ddc08a]"
        >
          Kirim Ucapan & Doa
        </button>
      </form>

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
          <div key={w.id} className="space-y-3 rounded-xl border border-[#c9a96e]/20 bg-black/70 p-5 shadow-lg backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3">
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
            <p className="whitespace-pre-wrap break-words text-xs text-stone-200 leading-6">{w.message}</p>
            <span className="text-[10px] text-stone-400 block pt-1">{w.time}</span>
          </div>
        ))}
        </div>
      </div>
      </div>
    </section>
  );
}