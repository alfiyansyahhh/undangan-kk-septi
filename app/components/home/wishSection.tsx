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
    <section className="px-6 py-10 space-y-6">
      <div className="text-center space-y-2">
        <p className="text-[11px] uppercase tracking-[0.3em] text-[#c9a96e]">
          Buku Tamu
        </p>
        <h2 className="font-display text-2xl text-white">Ucapan & Doa Restu</h2>
        <div className="gold-divider w-24 mx-auto" />
        <p className="text-xs text-stone-400 pt-1">
          Kirimkan doa dan ucapan terbaik untuk kedua mempelai
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-5 rounded-xl bg-[#141414] border border-[#c9a96e]/15 space-y-3"
      >
        <div>
          <label className="block text-xs font-medium text-stone-400 mb-1">Nama Anda</label>
          <input
            type="text"
            placeholder="Contoh: Budi Santoso"
            required
            value={wishForm.name}
            onChange={(e) => setWishForm({ ...wishForm, name: e.target.value })}
            className="w-full px-3 py-2.5 text-sm bg-[#1a1a1a] border border-white/10 rounded-lg text-white placeholder-stone-600 focus:ring-1 focus:ring-[#c9a96e]/50 focus:border-[#c9a96e]/30 focus:outline-none font-serif-elegant"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-400 mb-1">Konfirmasi Kehadiran</label>
          <select
            value={wishForm.attendance}
            onChange={(e) =>
              setWishForm({
                ...wishForm,
                attendance: e.target.value as "Hadir" | "Tidak Hadir" | "Ragu-ragu",
              })
            }
            className="w-full px-3 py-2.5 text-sm bg-[#1a1a1a] border border-white/10 rounded-lg text-white focus:ring-1 focus:ring-[#c9a96e]/50 focus:border-[#c9a96e]/30 focus:outline-none appearance-none font-serif-elegant"
          >
            <option value="Hadir">Saya akan Hadir</option>
            <option value="Tidak Hadir">Maaf, Tidak Bisa Hadir</option>
            <option value="Ragu-ragu">Masih Ragu-ragu</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-400 mb-1">Pesan / Doa Restu</label>
          <textarea
            rows={3}
            placeholder="Tuliskan ucapan dan doa terbaik..."
            required
            value={wishForm.message}
            onChange={(e) => setWishForm({ ...wishForm, message: e.target.value })}
            className="w-full px-3 py-2.5 text-sm bg-[#1a1a1a] border border-white/10 rounded-lg text-white placeholder-stone-600 focus:ring-1 focus:ring-[#c9a96e]/50 focus:border-[#c9a96e]/30 focus:outline-none font-serif-elegant"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-gradient-to-r from-[#c9a96e] to-[#a88a4e] hover:from-[#ddc08a] hover:to-[#c9a96e] text-black font-semibold text-sm transition"
        >
          Kirim Ucapan & Doa
        </button>
      </form>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {wishes.map((w) => (
          <div key={w.id} className="p-4 rounded-xl bg-[#141414] border border-white/5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-white font-serif-elegant">{w.name}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  w.attendance === "Hadir"
                    ? "bg-emerald-900/50 text-emerald-400 border border-emerald-800/50"
                    : w.attendance === "Tidak Hadir"
                    ? "bg-stone-800 text-stone-400 border border-stone-700"
                    : "bg-amber-900/50 text-amber-400 border border-amber-800/50"
                }`}
              >
                {w.attendance}
              </span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">{w.message}</p>
            <span className="text-[10px] text-stone-500 block pt-1">{w.time}</span>
          </div>
        ))}
      </div>
    </section>
  );
}