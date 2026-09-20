"use client";

import { useState } from "react";
import { getDriveThumbnailUrl, getDriveFullUrl } from "@/lib/gdrive";

interface GallerySectionProps {
  gallery: string[];
}

export default function GallerySection({ gallery }: GallerySectionProps) {
  const [activeModalPhoto, setActiveModalPhoto] = useState<string | null>(null);

  return (
    <section className="px-4 py-10 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="font-display text-3xl text-white">Our Gallery</h2>
        <div className="gold-divider w-24 mx-auto" />
      </div>

      <div className="gallery-masonry pt-4">
        {gallery.map((photoId, idx) => {
          const thumbUrl = getDriveThumbnailUrl(photoId, 800);
          const fullUrl = getDriveFullUrl(photoId);
          const heights = ["h-40", "h-56", "h-48", "h-64", "h-44", "h-52", "h-60", "h-36", "h-56"];
          const heightClass = heights[idx % heights.length];

          return (
            <div
              key={idx}
              onClick={() => setActiveModalPhoto(fullUrl)}
              className={`relative ${heightClass} overflow-hidden bg-[#1a1a1a] cursor-pointer group border border-[#c9a96e]/15 rounded-sm`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbUrl}
                alt={`Gallery ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500" />
            </div>
          );
        })}
      </div>

      {activeModalPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setActiveModalPhoto(null)}
        >
          <div className="relative max-w-3xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setActiveModalPhoto(null)}
              className="absolute -top-10 right-0 text-white text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition"
            >
              ✕ Tutup
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeModalPhoto}
              alt="Zoomed preview"
              className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </section>
  );
}