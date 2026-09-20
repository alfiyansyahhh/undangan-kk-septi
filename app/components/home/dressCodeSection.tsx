"use client";

import { motion, useReducedMotion } from "framer-motion";
import { defaultDressCode, type DressCode } from "@/lib/dressCode";
import { revealMotion } from "./revealMotion";

export default function DressCodeSection({ settings = defaultDressCode }: { settings?: DressCode }) {
  const reducedMotion = useReducedMotion();
  if (!settings.enabled) return null;

  return (
    <section id="dress-code" aria-labelledby="dress-code-title" className="relative border-y border-[#c9a96e]/15 bg-black/75 px-6 py-16 text-center backdrop-blur-xl sm:px-10 sm:py-20">
      <motion.div {...(reducedMotion ? {} : revealMotion("title"))}>
        <p className="mb-4 text-[10px] tracking-[0.35em] text-[#c9a96e]">A HARMONY OF COLORS</p>
        <h2 id="dress-code-title" className="font-serif text-4xl text-[#eee5d5] sm:text-5xl">{settings.title}</h2>
        <div aria-hidden="true" className="mx-auto my-6 h-px w-20 bg-gradient-to-r from-transparent via-[#c9a96e] to-transparent" />
      </motion.div>
      <motion.p {...(reducedMotion ? {} : revealMotion("text", 0.1))} className="mx-auto max-w-sm text-sm leading-relaxed text-stone-300">{settings.description}</motion.p>
      <div className="mx-auto mt-9 max-w-sm rounded-2xl border border-[#c9a96e]/20 bg-[#eee5d5]/[0.04] px-4 py-7 sm:px-6">
        <ul aria-label="Pilihan warna busana" className="grid grid-cols-6 gap-x-3 gap-y-5">
          {settings.colors.map((color, index) => (
            <motion.li key={`${index}-${color.hex}`} {...(reducedMotion ? {} : revealMotion("zoom", (index % 6) * 0.06))} title={color.name}>
              <span className="mx-auto block aspect-square w-full max-w-11 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: color.hex }} />
              <span className="sr-only">{color.name}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
