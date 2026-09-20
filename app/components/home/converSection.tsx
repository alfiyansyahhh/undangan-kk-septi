"use client";

import { useState, useEffect } from "react";
import { getDriveThumbnailUrl } from "@/lib/gdrive";

interface CoverSectionProps {
  isOpen: boolean;
  coverPhotos?: string[]; // Array photo ID / URL untuk ganti-ganti background
  brideShortName: string;
  groomShortName: string;
  displayDate: string;
  guestName: string;
  onOpen: () => void;
}

export default function CoverSection({
  isOpen,
  coverPhotos = [],
  brideShortName,
  groomShortName,
  displayDate,
  guestName,
  onOpen,
}: CoverSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (coverPhotos.length <= 1) return;

    const timer = setInterval(() => {
      // Tentukan index foto berikutnya
      const upcomingIndex = (currentIndex + 1) % coverPhotos.length;
      setNextIndex(upcomingIndex);
      
      // Mulai animasi cross-fade
      setIsTransitioning(true);

      // Setelah transisi selesai (1.5 detik), perbarui active index
      setTimeout(() => {
        setCurrentIndex(upcomingIndex);
        setIsTransitioning(false);
      }, 1500);
    }, 3000); // Ganti foto setiap 5 detik

    return () => clearInterval(timer);
  }, [currentIndex, coverPhotos.length]);

  // Safe Fallback Photo
  const photosToRender = coverPhotos.length > 0 ? coverPhotos : ["/path-to-default.jpg"];

  const currentImg = photosToRender[currentIndex]?.startsWith("http")
    ? photosToRender[currentIndex]
    : getDriveThumbnailUrl(photosToRender[currentIndex], 1200);

  const nextImg = photosToRender[nextIndex]?.startsWith("http")
    ? photosToRender[nextIndex]
    : getDriveThumbnailUrl(photosToRender[nextIndex], 1200);

  return (
    <section
      className={`fixed inset-0 z-50 flex flex-col justify-end text-white transition-all duration-1000 bg-black ${
        isOpen ? "-translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
      }`}
    >
      {/* Background Ultra-Smooth Crossfade & Slow Zoom */}
      <div className="absolute inset-0 overflow-hidden bg-black">
        {/* Layer 1: Current Active Image */}
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentImg}
            alt="Cover Current"
            className="w-full h-full object-cover object-center scale-105 animate-slow-zoom"
          />
        </div>

        {/* Layer 2: Next Incoming Image (Cross-fade Overlay) */}
        {coverPhotos.length > 1 && (
          <div
            className={`absolute inset-0 transition-opacity duration-1500 ease-in-out ${
              isTransitioning ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={nextImg}
              alt="Cover Next"
              className="w-full h-full object-cover object-center scale-105 animate-slow-zoom"
            />
          </div>
        )}

        {/* Dark Vignette Gradient Overlay agar teks terbaca jelas */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20 z-10" />
      </div>

      {/* Content Container (Bagian Bawah) */}
      <div className="relative z-20 text-center px-6 pb-12 pt-20 space-y-5 max-w-md mx-auto w-full">
        {/* Subtitle */}
        <p className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-stone-300 font-sans font-light">
          THE WEDDING OF
        </p>

        {/* Nama Mempelai */}
        <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white tracking-widest uppercase font-medium">
          {groomShortName} &bull; {brideShortName}
        </h1>

        {/* Tanggal */}
        <p className="text-[10px] sm:text-xs tracking-[0.25em] text-stone-300 uppercase font-sans">
          {displayDate}
        </p>

        {/* Area Tamu Undangan */}
        <div className="pt-4 space-y-1">
          <p className="text-[10px] sm:text-xs tracking-[0.2em] text-stone-400 uppercase font-sans">
            DEAR,
          </p>
          <h2 className="text-sm sm:text-base font-serif italic text-white tracking-wide">
            {guestName}
          </h2>
        </div>

        {/* Tombol LET'S ROLL */}
        <div className="pt-3">
          <button
            onClick={onOpen}
            className="px-6 py-2.5 rounded-full border border-white/40 bg-black/30 backdrop-blur-md text-white text-[10px] sm:text-xs tracking-[0.25em] font-sans uppercase hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center gap-2 mx-auto group shadow-lg cursor-pointer"
          >
            <svg
              className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 13l-7 7-7-7m14-8l-7 7-7-7"
              />
            </svg>
            <span>LET'S ROLL</span>
          </button>
        </div>
      </div>
    </section>
  );
}