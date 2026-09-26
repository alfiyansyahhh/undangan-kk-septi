"use client";

import { motion } from "framer-motion";
import { getDriveThumbnailUrl } from "@/lib/gdrive";

function formatParentName(value: string | undefined, kind: "father" | "mother") {
  const raw = (value ?? "").trim();
  if (!raw) return kind === "father" ? "Bapak" : "Ibu";

  const cleaned = raw
    .replace(/^almarhumah\s+/i, "")
    .replace(/^almarhum\s+/i, "")
    .replace(/^almh\.\s*/i, "")
    .replace(/^alm\.\s*/i, "")
    .replace(/^bapak\s+/i, "")
    .replace(/^ibu\s+/i, "")
    .trim();

  const isAlmarhum = /^(almarhumah|almh\.|almarhum|alm\.)/i.test(raw);
  const title = kind === "father"
    ? (isAlmarhum ? "Almarhum Bapak" : "Bapak")
    : (isAlmarhum ? "Almarhumah Ibu" : "Ibu");

  return cleaned ? `${title} ${cleaned}` : title;
}

interface GroomSectionProps {
  photo: string;
  fullName: string;
  fatherName: string;
  motherName: string;
  instagram?: string;
}

export default function GroomSection({
  photo,
  fullName,
  fatherName,
  motherName,
  instagram,
}: GroomSectionProps) {
  const imgUrl = photo?.startsWith("http")
    ? photo
    : getDriveThumbnailUrl(photo, 800);

  return (
    <div className="text-center text-white relative z-10 overflow-hidden">
      <div className="max-w-md mx-auto space-y-6">
        {/* Title Animation */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-xs sm:text-sm uppercase tracking-[0.35em] text-stone-300 font-sans font-light"
        >
          THE GROOM
        </motion.h2>

        {/* Card Frame Foto Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          className="relative mx-auto w-full max-w-[240px] sm:max-w-[280px] aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-stone-900"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgUrl}
            alt={fullName}
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        </motion.div>

        {/* Info Nama & Orang Tua Animation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          className="space-y-2 pt-2"
        >
          <h3 className="font-serif text-2xl sm:text-3xl text-white tracking-wide">
            {fullName}
          </h3>

          <p className="text-xs text-stone-400 font-sans tracking-wider leading-relaxed">
            Putra dari {formatParentName(fatherName, "father")} &amp; {formatParentName(motherName, "mother")}
          </p>

          {instagram && (
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href={`https://instagram.com/${instagram.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-stone-300 hover:text-white pt-2 transition-colors"
            >
              <svg
                className="w-4 h-4 text-stone-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              <span>{instagram}</span>
            </motion.a>
          )}
        </motion.div>
      </div>
    </div>
  );
}