"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { getDriveThumbnailUrl, getDriveFullUrl } from "@/lib/gdrive";

// Import Swiper styles
import "swiper/css";

interface QuoteSliderSectionProps {
  quoteTitle?: string;
  quoteText?: string;
  gallery: string[]; // Array photoId dari Google Drive
  onSelectPhoto?: (url: string) => void;
}

export default function QuoteSliderSection({
  quoteTitle = "Rgveda X.85.36",
  quoteText = "Dalam sebuah pernikahan kalian disatukan demi sebuah kebahagiaan dengan janji hati untuk saling membahagiakan. Bersamaku engkau akan hidup selamanya karena Tuhan pasti akan memberikan karunia sebagai pelindung dan saksi dalam pernikahan ini. Untuk itulah kalian dipersatukan dalam satu keluarga.",
  gallery = [],
  onSelectPhoto,
}: QuoteSliderSectionProps) {
  // Duplikasi gallery ID agar loop marquee berjalan smooth & tidak putus
  const displayPhotos = gallery.length > 0 ? [...gallery, ...gallery, ...gallery] : [];

  return (
    <section className="py-16 px-6 bg-[#0a0a0a] border-t border-white/5 space-y-8 overflow-hidden">
      {/* Kutipan / Ayat Header */}
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <h2 className="font-serif italic text-lg sm:text-2xl text-white font-medium whitespace-nowrap">
            {quoteTitle}
          </h2>
          <div className="h-[1px] w-full bg-gradient-to-r from-stone-500/50 to-transparent" />
        </div>

        <p className="text-[11px] sm:text-sm text-stone-300 leading-relaxed font-light font-serif tracking-wide text-justify sm:text-left">
          {quoteText}
        </p>
      </div>

      {/* Infinite Auto-Scroll Slider */}
      <div className="w-full relative py-4">
        {/* Gradient Blur Overlay Kiri & Kanan */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />

        <Swiper
          modules={[Autoplay]}
          slidesPerView={"auto"}
          spaceBetween={16}
          loop={true}
          speed={4000}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          grabCursor={true}
          className="w-full !ease-linear"
        >
          {displayPhotos.map((photoId, idx) => {
            const thumbUrl = getDriveThumbnailUrl(photoId, 800);
            const fullUrl = getDriveFullUrl ? getDriveFullUrl(photoId) : thumbUrl;

            return (
              <SwiperSlide
                key={idx}
                style={{ width: "auto" }}
                className="!w-40 sm:!w-52 flex-shrink-0"
              >
                <div
                  onClick={() => onSelectPhoto && onSelectPhoto(fullUrl)}
                  className="w-40 h-60 sm:w-52 sm:h-72 rounded-sm overflow-hidden bg-[#1a1a1a] cursor-pointer group border border-[#c9a96e]/15 relative"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbUrl}
                    alt={`Slider Gallery ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500" />
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
}