"use client";
import PhotoLightbox from "./components/home/photoLightbox";
import ClosingPhotoSection from "./components/home/closingPhotoSection";
import DressCodeSection from "./components/home/dressCodeSection";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { InvitationData, getDriveThumbnailUrl } from "@/lib/gdrive";

// Import semua Section yang sudah dipisah
import CoverSection from "./components/home/converSection";
import HeroSection from "./components/home/heroSection";
import CoupleSection from "./components/home/coupleSection";
import CountdownSection from "./components/home/countDownSection";
import EventSection from "./components/home/eventSection";
import GallerySection from "./components/home/gallerySection";
import StorySection from "./components/home/storySection";
import GiftSection from "./components/home/giftSection";
import WishSection, { Wish } from "./components/home/wishSection";
import FooterSection from "./components/home/footerSection";
import QuoteSliderSection from "./components/home/quoteSliderSection";
import MusicPlayer from "./components/home/musicPlayer";
import GlobalBackground from "./components/home/globalBackground";

function InvitationContent() {
  const searchParams = useSearchParams();
  const guestToken = searchParams.get("guest") || "";
  const [resolvedGuest, setResolvedGuest] = useState<{ token: string; name: string } | null>(null);
  const verifiedName = resolvedGuest?.token === guestToken ? resolvedGuest.name : "";
  const guestName = verifiedName || "Tamu Undangan";
  useEffect(() => {
    if (!guestToken) return;
    const controller = new AbortController();
    fetch(`/api/guest?guest=${encodeURIComponent(guestToken)}`, { signal: controller.signal }).then(async res => {
      if (!res.ok) throw new Error("Link tamu tidak valid");
      const guest = await res.json();
      if (!controller.signal.aborted) setResolvedGuest({ token: guestToken, name: guest.name });
    }).catch(() => { });
    return () => controller.abort();
  }, [guestToken]);

  const [data, setData] = useState<InvitationData | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [copiedBank, setCopiedBank] = useState<string | null>(null);
  const [activeModalPhoto, setActiveModalPhoto] = useState<string | null>(null);

  // Wishes State
  const [wishes, setWishes] = useState<Wish[]>([]);

  // Countdown State
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Fetch updated data from local API
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/invitation", { cache: "no-store" });
        if (!res.ok) throw new Error("Gagal membaca database");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        setLoadError(true);
        console.error("Gagal load invitation data:", err);
      }
    }
    loadData();

    async function loadWishes() {
      try {
        const res = await fetch("/api/wishes", { cache: "no-store" });
        if (!res.ok) throw new Error("Gagal memuat ucapan");
        setWishes(await res.json());
      } catch (error) { console.error(error); }
    }
    loadWishes();
  }, []);

  // Countdown timer logic
  useEffect(() => {
    if (!data) return;
    const target = new Date(data.events.targetDate).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [data?.events.targetDate]);

  const handleOpenInvitation = () => {
    setIsOpen(true);
    setTimeout(() => {
      document.getElementById("quote-slider-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleCopyAccount = (number: string, bank: string) => {
    navigator.clipboard.writeText(number);
    setCopiedBank(bank);
    setTimeout(() => setCopiedBank(null), 2500);
  };

  const handleAddWish = async (wishData: Omit<Wish, "id" | "time">) => {
    const response = await fetch("/api/wishes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...wishData, guestToken, id: crypto.randomUUID() }),
    });
    if (!response.ok) throw new Error("Gagal menyimpan ucapan");
    const saved: Wish = await response.json();
    setWishes(current => [saved, ...current.filter(w => w.id !== saved.id)]);
  };

  useEffect(() => { if (data) document.title = data.couple.title; }, [data?.couple.title]);

  if (!data) return <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black text-stone-300"><p role="status">{loadError ? "Undangan belum berhasil dimuat." : "Memuat undangan…"}</p>{loadError && <button onClick={() => window.location.reload()} className="rounded border border-white/30 px-4 py-2">Coba lagi</button>}</main>;

  const coverUrl = getDriveThumbnailUrl(data.photos.cover, 1200);

  const slideshowPhotos = data.photos.coverSlides || [];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative font-sans">

      <MusicPlayer music={data.music} isOpen={isOpen} />
      <GlobalBackground photos={slideshowPhotos} />

      {/* 1. COVER SCREEN */}
      <CoverSection
        isOpen={isOpen}
        coverPhotos={slideshowPhotos}
        brideShortName={data.couple.bride.shortName}
        groomShortName={data.couple.groom.shortName}
        displayDate={data.events.displayDate}
        guestName={guestName}
        onOpen={handleOpenInvitation}
      />

      {/* 2. MAIN CONTENT */}
      <div id="main-invitation" className="min-h-screen relative">
        <div className="flex flex-col lg:flex-row min-h-screen">

          {/* ======================================================== */}
          {/* PANEL KIRI (Desktop): Sticky Hero Cover Photo            */}
          {/* ======================================================== */}
          <div className="hidden lg:block lg:w-7/12 xl:w-2/3 h-screen sticky top-0 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverUrl}
              alt="Desktop Cover"
              className="w-full h-full object-cover object-center animate-slow-zoom"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute bottom-12 left-12 right-12 text-white space-y-3 z-10">
              <p className="text-xs uppercase tracking-[0.35em] text-[#c9a96e]">
                The Wedding Of
              </p>
              <h1 className="font-serif text-5xl xl:text-6xl text-white leading-tight">
                {data.couple.bride.shortName} & {data.couple.groom.shortName}
              </h1>
              <p className="text-sm tracking-widest text-stone-300 font-light">
                {data.events.displayDate}
              </p>
            </div>
          </div>

          {/* ======================================================== */}
          {/* PANEL KANAN: Scrollable Sections                         */}
          {/* ======================================================== */}
          <div className="w-full overflow-x-hidden lg:w-5/12 xl:w-1/3 min-h-screen  pb-24 border-l border-white/10 shadow-2xl">
            <HeroSection
              // coverUrl={coverUrl}
              // coverPhotos={data?.photos?.gallery}
              brideShortName={data.couple.bride.shortName}
              groomShortName={data.couple.groom.shortName}
              displayDate={data.events.displayDate}
            />

            {/* Quote + Auto-Scroll Slider Marquee */}
            <QuoteSliderSection
              id="quote-slider-section"
              quoteTitle={data.couple.quoteSource}
              quoteText={data.couple.quote}
              gallery={data.photos.quoteSlides || []}
              onSelectPhoto={(url) => setActiveModalPhoto(url)}
            />

            {/* Couple Section */}
            <CoupleSection couple={data.couple} />

            {/* Countdown Section */}
            <CountdownSection
              timeLeft={timeLeft}
              displayDate={data.events.displayDate}
            />

            {/* Event Section */}
            <EventSection
              photoAkad={data.photos.akad}
              photoResepsi={data.photos.resepsi}
              events={data.events}
            />

            <DressCodeSection settings={data.dressCode} />

            {/* Gallery Grid Masonry */}
            <GallerySection gallery={data.photos.gallery} coverPhoto={data.photos.galleryCover} videoUrl={data.sections?.galleryVideo} title={data.sections?.galleryTitle} />

            {/* Love Story Section */}
            <StorySection
              title={data.sections?.storyTitle}
              story={data.story}
            />


            {/* Gift Section */}
            {/* <GiftSection
              title={data.sections?.giftTitle}
              description={data.sections?.giftDescription}
              gifts={data.gifts}
              coverUrl={getDriveThumbnailUrl(data.photos.gift || coverUrl)}
              onCopy={handleCopyAccount}
              copiedBank={copiedBank}
            /> */}

            {/* Wish / Ucapan Section */}
            <WishSection guestName={verifiedName} title={data.sections?.wishTitle} description={data.sections?.wishDescription} wishes={wishes} onSubmitWish={handleAddWish} />

            <ClosingPhotoSection photo={data.photos.closing} message={data.sections?.closingMessage} />

            {/* Footer Section */}
            <FooterSection
              text={data.sections?.footerText}
              brideShortName={data.couple.bride.shortName}
              groomShortName={data.couple.groom.shortName}
              hashtag={data.couple.hashtag}
            />
          </div>

        </div>
      </div>

      {activeModalPhoto && <PhotoLightbox src={activeModalPhoto} onClose={() => setActiveModalPhoto(null)} />}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white font-sans">Memuat undangan...</div>}>
      <InvitationContent />
    </Suspense>
  );
}