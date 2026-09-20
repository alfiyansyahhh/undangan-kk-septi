"use client";

import { motion, useReducedMotion } from "framer-motion";
import { getDriveThumbnailUrl } from "@/lib/gdrive";
import { revealMotion } from "./revealMotion";

export default function ClosingPhotoSection({ photo, message }: { photo?: string; message?: string }) {
  const reducedMotion = useReducedMotion();
  if (!photo) return null;

  return (
    <section aria-labelledby="closing-title" className="relative mt-10 bg-[#0b0b0a] px-6 py-12 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-md">
        <motion.div {...(reducedMotion ? {} : revealMotion("fade"))} className="relative aspect-[4/3] overflow-hidden rounded-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={getDriveThumbnailUrl(photo, 1200)} alt="Kedua mempelai" loading="lazy" className="h-full w-full object-cover object-[center_65%]" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-3 border border-white/20" />
        </motion.div>
        <motion.div {...(reducedMotion ? {} : revealMotion("text", 0.1))} className="px-2 pt-9 text-center sm:px-5">
          <div aria-hidden="true" className="mb-6 flex items-center justify-center gap-3 text-[#c9a96e]/70">
            <span className="h-px w-9 bg-current" /><span className="text-[8px]">◆</span><span className="h-px w-9 bg-current" />
          </div>
          <h2 id="closing-title" className="font-serif text-3xl tracking-wide text-[#eee5d5] sm:text-4xl">Terima Kasih</h2>
          <p className="mx-auto mt-4 max-w-xs text-sm leading-7 text-stone-400">{message || "Terima kasih telah menjadi bagian dari cerita dan kebahagiaan kami."}</p>
        </motion.div>
      </div>
    </section>
  );
}
