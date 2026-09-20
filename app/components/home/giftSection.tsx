"use client";

import { revealMotion } from "./revealMotion";
import { motion } from "framer-motion";

import { useState } from "react";
import { InvitationData } from "@/lib/gdrive";

interface GiftSectionProps {
  title?: string;
  description?: string;
  gifts?: InvitationData["gifts"];
  coverUrl: string;
  onCopy: (number: string, bank: string) => void;
  copiedBank: string | null;
}

export default function GiftSection({
  title,
  description,
  gifts,
  coverUrl,
  onCopy,
  copiedBank,
}: GiftSectionProps) {
  const [selectedGiftIdx, setSelectedGiftIdx] = useState(0);

  if (!gifts || gifts.length === 0) return null;

  const currentGift = gifts[selectedGiftIdx];

  return (
    <section className="relative min-h-[80vh] w-full overflow-hidden flex items-end">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={coverUrl}
        alt="Wedding Gift Background"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />

      <div className="relative z-10 w-full p-8 pb-12 space-y-5">
        <motion.h2 {...revealMotion("fade", 0)} className="font-serif text-2xl sm:text-3xl tracking-wide text-white text-center">
          {title || "Wedding Gift"}
        </motion.h2>
        <div className="gold-divider w-24 mx-auto" />
        <motion.p {...revealMotion("text", 0.1)} className="text-sm text-stone-300 text-center leading-relaxed max-w-sm mx-auto font-sans">
          {description || "Tanpa mengurangi rasa hormat kami bagi tamu yang ingin mengirimkan hadiah kepada kedua mempelai, silahkan klik dibawah ini :"}
        </motion.p>

        <motion.div {...revealMotion("text", 0.2)} className="flex items-center gap-3 max-w-sm mx-auto pt-2">
          <div className="flex-1 relative">
            <select
              value={selectedGiftIdx}
              onChange={(e) => setSelectedGiftIdx(Number(e.target.value))}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-[#c9a96e]/50 font-sans"
            >
              {gifts.map((gift, idx) => (
                <option key={idx} value={idx} className="bg-[#1a1a1a] text-white">
                  {gift.bank} — {gift.holder}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onCopy(currentGift.number, currentGift.bank)}
            className="px-5 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-semibold hover:bg-white/20 transition tracking-wider"
          >
            {copiedBank === currentGift.bank ? "✓ COPIED" : "COPY"}
          </button>
        </motion.div>

        <motion.div {...revealMotion("text", 0.3)} className="text-center">
          <p className="text-lg font-sans tabular-nums text-[#c9a96e] tracking-widest">
            {currentGift.number}
          </p>
          <p className="text-xs text-stone-400 mt-1">
            a.n. {currentGift.holder}
          </p>
        </motion.div>
      </div>
    </section>
  );
}