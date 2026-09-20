"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { InvitationData, getDriveThumbnailUrl, getDriveFullUrl } from "@/lib/gdrive";
import defaultData from "@/data/invitation-data.json";

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
import GlobalBackground from "./components/home/globalBackground";

function InvitationContent() {
  const searchParams = useSearchParams();
  const guestName = searchParams.get("to") || searchParams.get("u") || "Tamu Undangan";

  const [data, setData] = useState<InvitationData>(defaultData as InvitationData);
  const [isOpen, setIsOpen] = useState(false);
  const [copiedBank, setCopiedBank] = useState<string | null>(null);
  const [activeModalPhoto, setActiveModalPhoto] = useState<string | null>(null);

  // Wishes State
  const [wishes, setWishes] = useState<Wish[]>([
    {
      id: "1",
      name: "Rian & Sarah",
      attendance: "Hadir",
      message: "Selamat! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah. Bahagia selalu sampai kakek nenek.",
      time: "1 jam yang lalu",
    },
    {
      id: "2",
      name: "Dinda Lestari",
      attendance: "Hadir",
      message: "Barakallahu lakuma wa baraka alaikuma wa jama'a bainakuma fii khair. Lancar sampai hari H yaa!",
      time: "3 jam yang lalu",
    },
  ]);

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
        const res = await fetch("/api/invitation");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Gagal load invitation data:", err);
      }
    }
    loadData();

    try {
      const storedWishes = localStorage.getItem("wedding_wishes_meila_arif");
      if (storedWishes) {
        setWishes(JSON.parse(storedWishes));
      }
    } catch {
      // ignore
    }
  }, []);

  // Countdown timer logic
  useEffect(() => {
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
  }, [data.events.targetDate]);

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

  const handleAddWish = (wishData: Omit<Wish, "id" | "time">) => {
    const newWish: Wish = {
      id: Date.now().toString(),
      ...wishData,
      time: "Baru saja",
    };

    const updated = [newWish, ...wishes];
    setWishes(updated);
    try {
      localStorage.setItem("wedding_wishes_meila_arif", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const coverUrl = data.photos.cover || getDriveThumbnailUrl("1uwgIpksRY4BUmCPb1LtoNW3jtY2COuzI", 1200);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative font-sans">
     
     <GlobalBackground photos={data.photos.gallery} />

      {/* 1. COVER SCREEN */}
      <CoverSection
        isOpen={isOpen}
        coverPhotos={data.photos.gallery}
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
          <div className="w-full lg:w-5/12 xl:w-1/3 min-h-screen  pb-24 border-l border-white/10 shadow-2xl">
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
              quoteTitle="Rgveda X.85.36"
              quoteText="Dalam sebuah pernikahan kalian disatukan demi sebuah kebahagiaan dengan janji hati untuk saling membahagiakan. Bersamaku engkau akan hidup selamanya karena Tuhan pasti akan memberikan karunia sebagai pelindung dan saksi dalam pernikahan ini. Untuk itulah kalian dipersatukan dalam satu keluarga."
              gallery={data.photos.gallery}
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
              photoAkad={data.photos.cover}
              photoResepsi={data.photos.cover}
              events={data.events} 
            />

            {/* Gallery Grid Masonry */}
            <GallerySection gallery={data.photos.gallery} />

            {/* Love Story Section */}
            <StorySection 
              story={data.story} 
              photos={data.photos.gallery}
            />

            {/* Gift Section */}
            <GiftSection
              gifts={data.gifts}
              coverUrl={coverUrl}
              onCopy={handleCopyAccount}
              copiedBank={copiedBank}
            />

            {/* Wish / Ucapan Section */}
            <WishSection wishes={wishes} onSubmitWish={handleAddWish} />

            {/* Footer Section */}
            <FooterSection
              brideShortName={data.couple.bride.shortName}
              groomShortName={data.couple.groom.shortName}
              hashtag={data.couple.hashtag}
            />
          </div>

        </div>
      </div>

      {/* Modal Lightbox Foto (Opsional jika foto di-click) */}
      {activeModalPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setActiveModalPhoto(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeModalPhoto}
            alt="Expanded view"
            className="max-w-full max-h-[90vh] object-contain rounded-sm"
          />
        </div>
      )}
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