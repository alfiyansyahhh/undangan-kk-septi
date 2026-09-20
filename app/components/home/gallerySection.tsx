"use client";

import { useState } from "react";
import { getDriveThumbnailUrl, getDriveFullUrl } from "@/lib/gdrive";

interface GallerySectionProps {
  gallery: string[];
  videoUrl?: string;
}

export default function GallerySection({
  gallery = [],
  videoUrl,
}: GallerySectionProps) {
  const [activeModalPhoto, setActiveModalPhoto] = useState<string | null>(null);

  // Helper untuk menentukan URL thumbnail yang aman
  const getThumbUrl = (photoSrc: string) => {
    if (!photoSrc) return "";
    if (photoSrc.startsWith("http://") || photoSrc.startsWith("https://")) {
      return photoSrc;
    }
    return getDriveThumbnailUrl(photoSrc, 800);
  };

  // Helper untuk menentukan URL gambar modal full-resolution
  const getFullUrl = (photoSrc: string) => {
    if (!photoSrc) return "";
    if (photoSrc.startsWith("http://") || photoSrc.startsWith("https://")) {
      return photoSrc;
    }
    return getDriveFullUrl(photoSrc);
  };

  const photos = gallery.filter(Boolean);

  return (
    <section className="relative z-10 px-6 py-10 sm:px-8">
      <div className="mx-auto max-w-md space-y-6">
        <div className="flex items-center gap-4 pb-3">
          <h2 className="shrink-0 font-serif text-2xl sm:text-3xl text-white tracking-wide uppercase">
            Gallery
          </h2>
          <div aria-hidden="true" className="h-px flex-1 bg-white/80" />
        </div>

        {/* Show the supplied video, or use a gallery photo as the wide cover. */}
        {(videoUrl || photos.length > 0) && (
          <div className="aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black/50 sm:rounded-2xl">
            {videoUrl ? (
              <iframe
                src={videoUrl}
                title="Gallery Video Trailer"
                className="h-full w-full"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <button
                type="button"
                onClick={() => setActiveModalPhoto(getFullUrl(photos[0]))}
                aria-label="Perbesar foto utama galeri"
                className="block h-full w-full cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getThumbUrl(photos[0])}
                  alt="Foto utama galeri"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </button>
            )}
          </div>
        )}

        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {photos.map((photoItem, idx) => (
              <button
                type="button"
                key={`${photoItem}-${idx}`}
                onClick={() => setActiveModalPhoto(getFullUrl(photoItem))}
                aria-label={`Perbesar foto galeri ${idx + 1}`}
                className="group relative aspect-[2/3] min-w-0 cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-stone-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:rounded-2xl"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getThumbUrl(photoItem)}
                  alt={`Gallery ${idx + 1}`}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 motion-reduce:transition-none"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal Lightbox Preview */}
      {activeModalPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setActiveModalPhoto(null)}
        >
          <div className="relative max-w-3xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setActiveModalPhoto(null)}
              className="absolute -top-10 right-0 text-white text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition font-sans"
            >
              ✕ Tutup
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeModalPhoto}
              alt="Zoomed preview"
              className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </section>
  );
}