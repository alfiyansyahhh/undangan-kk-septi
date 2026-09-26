"use client";

import { useState, useEffect } from "react";
import { getDriveThumbnailUrl } from "@/lib/gdrive";

interface GlobalBackgroundProps {
  photos?: string[];
}

export default function GlobalBackground({ photos = [] }: GlobalBackgroundProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (photos.length <= 1 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let transitionTimer: ReturnType<typeof setTimeout> | undefined;

    const timer = setInterval(() => {
      const upcomingIndex = (currentIndex + 1) % photos.length;
      setNextIndex(upcomingIndex);
      setIsTransitioning(true);

      transitionTimer = setTimeout(() => {
        setCurrentIndex(upcomingIndex);
        setIsTransitioning(false);
      }, 800);
    }, 2500);

    return () => {
      clearInterval(timer);
      clearTimeout(transitionTimer);
    };
  }, [currentIndex, photos.length]);

  if (photos.length === 0) return null;

  const currentImg = photos[currentIndex]?.startsWith("http")
    ? photos[currentIndex]
    : getDriveThumbnailUrl(photos[currentIndex], 1200);

  const nextImg = photos[nextIndex]?.startsWith("http")
    ? photos[nextIndex]
    : getDriveThumbnailUrl(photos[nextIndex], 1200);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black lg:left-auto lg:right-0 lg:w-5/12 xl:w-1/3"
      style={{ height: "100vh", minHeight: "100vh", maxHeight: "100vh" }}
    >
      {/* Current Active Image */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentImg}
          alt=""
          className="w-full h-full object-cover object-center animate-background-drift"
        />
      </div>

      {/* Next Incoming Image (Cross-fade) */}
      {photos.length > 1 && (
        <div
          className={`absolute inset-0 transition-opacity duration-[800ms] ease-in-out motion-reduce:transition-none ${isTransitioning ? "opacity-100" : "opacity-0"}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={nextImg}
            alt=""
            className="w-full h-full object-cover object-center animate-background-drift"
          />
        </div>
      )}

      {/* Overlay Gelap agar Teks Panel Kanan Selalu Legible */}
      <div className="absolute inset-0 bg-black/55" />
    </div>
  );
}