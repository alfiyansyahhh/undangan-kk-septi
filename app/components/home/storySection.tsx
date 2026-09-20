"use client";

import { revealMotion } from "./revealMotion";

import { motion } from "framer-motion";
import { InvitationData } from "@/lib/gdrive";
import { getDriveThumbnailUrl } from "@/lib/gdrive";

interface StorySectionProps {
  title?: string;
  story?: InvitationData["story"];
}

export default function StorySection({
  title, story = [] }: StorySectionProps) {
  if (!story || story.length === 0) return null;

  // Helper untuk mendapatkan URL gambar yang valid
  const getImageUrl = (rawSrc?: string) => {
    if (!rawSrc) return "";
    
    // Jika sudah berupa URL lengkap (http/https)
    if (rawSrc.startsWith("http://") || rawSrc.startsWith("https://")) {
      return rawSrc;
    }
    
    // Jika berupa ID Google Drive
    return getDriveThumbnailUrl(rawSrc, 800);
  };

  return (
    <section className="px-6 py-12 text-white space-y-8 relative z-10 overflow-hidden">
      {/* Header Title */}
      <motion.div {...revealMotion("title", 0)} className="text-center space-y-3">
        <div className="flex items-center justify-center gap-4">
          <div className="h-[1px] w-12 bg-stone-400/50" />
          <h2 className="font-serif text-2xl sm:text-3xl tracking-widest text-white uppercase">
            {title || "THE • JOURNEY"}
          </h2>
          <div className="h-[1px] w-12 bg-stone-400/50" />
        </div>
      </motion.div>

      {/* Journey Cards Container */}
      <div className="space-y-6 max-w-md mx-auto">
        {story.map((item, idx) => {
          const isEven = idx % 2 === 0;

          const imgUrl = getImageUrl(item.image);


          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: isEven ? -60 : 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={`p-5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center gap-4 shadow-xl ${
                isEven ? "flex-row" : "flex-row-reverse"
              }`}
            >
              {/* Foto Item */}
              {imgUrl ? (
                <div className="w-2/5 flex-shrink-0 aspect-[3/4] rounded-xl overflow-hidden relative shadow-md bg-stone-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgUrl}
                    alt={item.title || `Journey ${item.year}`}
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      // Sembunyikan gambar jika gagal dimuat
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
              ) : null}

              {/* Teks Content */}
              <div
                className={`flex-1 space-y-2 text-stone-200 ${
                  isEven ? "text-left" : "text-right"
                }`}
              >
                <h3 className="font-serif text-base sm:text-lg text-white font-medium">
                  {item.title || item.year}
                </h3>
                <p className="text-[10px] tracking-widest text-stone-400">{item.year}</p>
                <p className="text-xs text-stone-300 font-serif leading-relaxed line-clamp-6 font-light">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}