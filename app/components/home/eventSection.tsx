"use client";

import { revealMotion } from "./revealMotion";
import { motion } from "framer-motion";
import CalendarButtons from "./calendarButtons";

import { InvitationData, getDriveThumbnailUrl } from "@/lib/gdrive";

interface EventSectionProps {
  events: InvitationData["events"];
  photoAkad?: string;
  photoResepsi?: string;
}

export default function EventSection({
  events,
  photoAkad,
  photoResepsi,
}: EventSectionProps) {
  const getImgUrl = (url?: string) => {
    if (!url) return "";
    return url.startsWith("http") ? url : getDriveThumbnailUrl(url, 600);
  };

  const akadImg = getImgUrl(photoAkad);
  const resepsiImg = getImgUrl(photoResepsi);

  return (
    <section className="px-6 py-12 space-y-8 text-white relative z-10">
      {/* Header Title */}
      <motion.div {...revealMotion("title", 0)} className="text-center space-y-2">
        <p className="text-[10px] sm:text-xs uppercase tracking-[0.35em] text-stone-300 font-sans font-light">
          RANGKAIAN ACARA
        </p>
        <h2 className="font-serif text-2xl sm:text-3xl text-white tracking-wide">
          Wedding &bull; Event
        </h2>
        <div className="w-16 h-[1px] bg-stone-400/50 mx-auto" />
      </motion.div>

      <div className="space-y-5 max-w-md mx-auto">
        {/* CARD 1: Akad / Pawiwahan */}
        <motion.div {...revealMotion("left", 0.1)} className="p-4 sm:p-5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 flex items-stretch gap-4 shadow-xl">
          {/* Foto Kiri */}
          {akadImg && (
            <div className="w-2/5 flex-shrink-0 rounded-xl overflow-hidden relative min-h-[140px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={akadImg}
                alt={events.akad.title}
                className="w-full h-full object-cover object-center absolute inset-0"
              />
            </div>
          )}

          {/* Detail Kanan */}
          <div className="flex-1 flex flex-col justify-between py-0.5 space-y-2 text-left">
            <div className="space-y-1">
              <h3 className="font-serif text-xl sm:text-2xl text-white leading-tight">
                {events.akad.title}
              </h3>
              <p className="text-xs text-stone-300 font-sans">
                {events.akad.date}
              </p>
              <p className="text-xs text-stone-300 font-sans">
                {events.akad.time}
              </p>
              <p className="text-xs font-semibold text-white pt-1">
                {events.akad.venue}
              </p>
              <p className="text-[11px] text-stone-400 font-light leading-tight line-clamp-2">
                {events.akad.address}
              </p>
            </div>

            {/* Location Pill Button */}
            <div className="pt-1">
              <a
                href={events.akad.mapsUrl || "https://maps.google.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white text-black text-xs font-medium hover:bg-stone-200 transition-colors shadow-md"
              >
                <svg
                  className="w-3.5 h-3.5 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <span>Location</span>
              </a>
            </div>
          </div>
        </motion.div>

        {/* CARD 2: Resepsi */}
        <motion.div {...revealMotion("right", 0.2)} className="p-4 sm:p-5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 flex items-stretch gap-4 shadow-xl">
          {/* Foto Kiri */}
          {resepsiImg && (
            <div className="w-2/5 flex-shrink-0 rounded-xl overflow-hidden relative min-h-[140px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resepsiImg}
                alt={events.resepsi.title}
                className="w-full h-full object-cover object-center absolute inset-0"
              />
            </div>
          )}

          {/* Detail Kanan */}
          <div className="flex-1 flex flex-col justify-between py-0.5 space-y-2 text-left">
            <div className="space-y-1">
              <h3 className="font-serif text-xl sm:text-2xl text-white leading-tight">
                {events.resepsi.title}
              </h3>
              <p className="text-xs text-stone-300 font-sans">
                {events.resepsi.date}
              </p>
              <p className="text-xs text-stone-300 font-sans">
                {events.resepsi.time}
              </p>
              <p className="text-xs font-semibold text-white pt-1">
                {events.resepsi.venue}
              </p>
              <p className="text-[11px] text-stone-400 font-light leading-tight line-clamp-2">
                {events.resepsi.address}
              </p>
            </div>

            {/* Location Pill Button */}
            <div className="pt-1">
              <a
                href={events.resepsi.mapsUrl || "https://maps.google.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white text-black text-xs font-medium hover:bg-stone-200 transition-colors shadow-md"
              >
                <svg
                  className="w-3.5 h-3.5 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <span>Location</span>
              </a>
            </div>
          </div>
        </motion.div>
        <CalendarButtons events={events} />
      </div>
    </section>
  );
}
