"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { InvitationData, getDriveThumbnailUrl, getDriveFullUrl } from "@/lib/gdrive";
import defaultData from "@/data/invitation-data.json";

interface Wish {
  id: string;
  name: string;
  attendance: "Hadir" | "Tidak Hadir" | "Ragu-ragu";
  message: string;
  time: string;
}

function InvitationContent() {
  const searchParams = useSearchParams();
  const guestName = searchParams.get("to") || searchParams.get("u") || "Tamu Undangan";

  const [data, setData] = useState<InvitationData>(defaultData as InvitationData);
  const [isOpen, setIsOpen] = useState(false);
  const [activeModalPhoto, setActiveModalPhoto] = useState<string | null>(null);
  const [copiedBank, setCopiedBank] = useState<string | null>(null);
  const [selectedGiftIdx, setSelectedGiftIdx] = useState(0);

  // Wishes state
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
  const [wishForm, setWishForm] = useState({
    name: "",
    attendance: "Hadir" as "Hadir" | "Tidak Hadir" | "Ragu-ragu",
    message: "",
  });

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

    // Load stored wishes from localStorage if any
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
      document.getElementById("main-invitation")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleCopyAccount = (number: string, bank: string) => {
    navigator.clipboard.writeText(number);
    setCopiedBank(bank);
    setTimeout(() => setCopiedBank(null), 2500);
  };

  const handleSubmitWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishForm.name || !wishForm.message) return;

    const newWish: Wish = {
      id: Date.now().toString(),
      name: wishForm.name,
      attendance: wishForm.attendance,
      message: wishForm.message,
      time: "Baru saja",
    };

    const updated = [newWish, ...wishes];
    setWishes(updated);
    try {
      localStorage.setItem("wedding_wishes_meila_arif", JSON.stringify(updated));
    } catch {
      // ignore
    }

    setWishForm({ name: "", attendance: "Hadir", message: "" });
  };

  const coverUrl = data.photos.cover || getDriveThumbnailUrl("1uwgIpksRY4BUmCPb1LtoNW3jtY2COuzI", 1200);
  const bridePhoto = data.couple.bride.photo;
  const groomPhoto = data.couple.groom.photo;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative">
      {/* ======================================================== */}
      {/* 1. COVER / HERO WELCOME SCREEN (Full Viewport) */}
      {/* ======================================================== */}
      <section
        className={`fixed inset-0 z-50 flex flex-col items-center justify-between text-white transition-all duration-1000 ${
          isOpen ? "-translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
        }`}
      >
        {/* Background image with slow zoom */}
        <div className="absolute inset-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverUrl}
            alt="Cover"
            className="w-full h-full object-cover object-center animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
        </div>

        {/* Top spacer */}
        <div className="relative z-10 pt-16" />

        {/* Center content */}
        <div className="relative z-10 text-center px-6 space-y-5 animate-fade-in">
          <p className="text-[11px] uppercase tracking-[0.35em] text-[#c9a96e] font-medium">
            The Wedding Of
          </p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-white leading-tight">
            {data.couple.bride.shortName} & {data.couple.groom.shortName}
          </h1>
          <div className="gold-divider w-32 mx-auto" />
          <p className="text-[11px] tracking-widest text-stone-300">
            {data.events.displayDate}
          </p>
        </div>

        {/* Bottom: Guest card + button */}
        <div className="relative z-10 max-w-sm w-full px-6 pb-8 space-y-4">
          <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl p-5 text-center space-y-3">
            <p className="text-[11px] text-stone-400 tracking-wide">Kepada Yth. Bapak/Ibu/Saudara/i:</p>
            <div className="py-1.5 px-4 rounded-lg bg-white/5 border border-[#c9a96e]/30">
              <h2 className="text-lg font-semibold text-white tracking-wide capitalize font-serif-elegant">
                {guestName}
              </h2>
            </div>
            <button
              onClick={handleOpenInvitation}
              className="w-full py-3 px-6 rounded-full bg-gradient-to-r from-[#c9a96e] to-[#a88a4e] hover:from-[#ddc08a] hover:to-[#c9a96e] text-black font-semibold text-sm shadow-lg shadow-amber-900/30 transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
            >
              <span>💌</span>
              <span>Buka Undangan</span>
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. MAIN INVITATION CONTENT */}
      {/* ======================================================== */}
      <div id="main-invitation" className="max-w-xl lg:max-w-none mx-auto bg-[#0a0a0a] min-h-screen relative pb-24">

        {/* ---- SECTION: HERO BANNER (after open) ---- */}
        <section className="relative h-screen w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverUrl}
            alt="Wedding Cover"
            className="w-full h-full object-cover object-center animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
          <div className="absolute bottom-0 inset-x-0 text-center px-6 pb-12 space-y-4">
            <h1 className="font-display text-4xl sm:text-5xl text-white leading-tight drop-shadow-lg">
              {data.couple.bride.shortName} & {data.couple.groom.shortName}
            </h1>
            <div className="gold-divider w-24 mx-auto" />
            <p className="text-xs text-stone-300 italic leading-relaxed max-w-sm mx-auto font-serif-elegant">
              &quot;{data.couple.quote}&quot;
            </p>
            <p className="text-[11px] text-[#c9a96e] font-medium tracking-wide">
              {data.couple.quoteSource}
            </p>
            <p className="text-sm text-white tracking-widest font-light pt-2">
              {data.events.displayDate}
            </p>
          </div>
        </section>

        {/* ---- SECTION: THE BRIDE ---- */}
        <section className="relative min-h-[90vh] w-full overflow-hidden flex items-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bridePhoto}
            alt={data.couple.bride.fullName}
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/50" />
          <div className="relative z-10 p-8 pt-14 space-y-3 max-w-sm">
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#c9a96e]">
              The Bride
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-white leading-snug">
              {data.couple.bride.fullName}
            </h2>
            <div className="gold-divider w-16" />
            <p className="text-sm text-stone-200 leading-relaxed font-serif-elegant">
              <span className="text-[#c9a96e]">Putri dari :</span>
              <br />
              {data.couple.bride.fatherName} & {data.couple.bride.motherName}
            </p>
            {data.couple.bride.instagram && (
              <p className="text-sm text-stone-300 flex items-center gap-1.5 pt-1">
                <svg className="w-4 h-4 text-[#c9a96e]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                <span>{data.couple.bride.instagram}</span>
              </p>
            )}
          </div>
        </section>

        {/* ---- SECTION: THE GROOM ---- */}
        <section className="relative min-h-[90vh] w-full overflow-hidden flex items-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={groomPhoto}
            alt={data.couple.groom.fullName}
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/50" />
          <div className="relative z-10 p-8 pt-14 space-y-3 max-w-sm">
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#c9a96e]">
              The Groom
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-white leading-snug">
              {data.couple.groom.fullName}
            </h2>
            <div className="gold-divider w-16" />
            <p className="text-sm text-stone-200 leading-relaxed font-serif-elegant">
              <span className="text-[#c9a96e]">Putra dari :</span>
              <br />
              {data.couple.groom.fatherName} & {data.couple.groom.motherName}
            </p>
            {data.couple.groom.instagram && (
              <p className="text-sm text-stone-300 flex items-center gap-1.5 pt-1">
                <svg className="w-4 h-4 text-[#c9a96e]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                <span>{data.couple.groom.instagram}</span>
              </p>
            )}
          </div>
        </section>

        {/* ---- SECTION: COUNTDOWN TIMER ---- */}
        <section className="px-6 py-16 text-center space-y-6">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#c9a96e]">
            Menghitung Hari
          </p>
          <h2 className="font-display text-2xl text-white">Menuju Hari Bahagia</h2>
          <div className="gold-divider w-24 mx-auto" />

          <div className="grid grid-cols-4 gap-3 max-w-xs mx-auto pt-4">
            {[
              { value: timeLeft.days, label: "Hari" },
              { value: timeLeft.hours, label: "Jam" },
              { value: timeLeft.minutes, label: "Menit" },
              { value: timeLeft.seconds, label: "Detik" },
            ].map((item, idx) => (
              <div key={idx} className="bg-[#141414] border border-[#c9a96e]/20 p-3 rounded-xl">
                <span className="block font-display text-2xl font-bold text-[#c9a96e]">
                  {String(item.value).padStart(2, "0")}
                </span>
                <span className="text-[10px] text-stone-400 uppercase tracking-wider">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <p className="text-xs text-stone-400 pt-2">
            {data.events.displayDate}
          </p>
        </section>

        {/* ---- SECTION: JADWAL ACARA ---- */}
        <section className="px-6 py-10 space-y-6">
          <div className="text-center space-y-2">
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#c9a96e]">
              Rangkaian Acara
            </p>
            <h2 className="font-display text-2xl text-white">Waktu & Tempat</h2>
            <div className="gold-divider w-24 mx-auto" />
          </div>

          <div className="space-y-4 pt-4">
            {/* Akad Nikah */}
            <div className="p-5 rounded-xl bg-[#141414] border border-[#c9a96e]/20 text-center space-y-2">
              <span className="inline-block px-3 py-1 bg-[#c9a96e]/15 text-[#c9a96e] rounded-full text-xs font-semibold tracking-wide">
                {data.events.akad.title}
              </span>
              <p className="font-serif-elegant text-lg font-medium text-white pt-1">
                {data.events.akad.date}
              </p>
              <p className="text-xs font-semibold text-[#c9a96e]">
                ⏰ {data.events.akad.time}
              </p>
              <div className="pt-2 text-xs text-stone-300 space-y-1">
                <p className="font-bold text-white">{data.events.akad.venue}</p>
                <p className="text-stone-400">{data.events.akad.address}</p>
              </div>
            </div>

            {/* Resepsi */}
            <div className="p-5 rounded-xl bg-[#141414] border border-[#c9a96e]/20 text-center space-y-2">
              <span className="inline-block px-3 py-1 bg-[#c9a96e]/15 text-[#c9a96e] rounded-full text-xs font-semibold tracking-wide">
                {data.events.resepsi.title}
              </span>
              <p className="font-serif-elegant text-lg font-medium text-white pt-1">
                {data.events.resepsi.date}
              </p>
              <p className="text-xs font-semibold text-[#c9a96e]">
                ⏰ {data.events.resepsi.time}
              </p>
              <div className="pt-2 text-xs text-stone-300 space-y-1">
                <p className="font-bold text-white">{data.events.resepsi.venue}</p>
                <p className="text-stone-400">{data.events.resepsi.address}</p>
              </div>
            </div>
          </div>

          {/* Maps Button */}
          <div className="pt-2">
            <a
              href={data.events.resepsi.mapsUrl || "https://maps.google.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-[#c9a96e] hover:bg-[#ddc08a] text-black text-xs font-semibold transition flex items-center justify-center gap-2 shadow-sm"
            >
              <span>📍</span>
              <span>Buka Petunjuk Arah (Google Maps)</span>
            </a>
          </div>
        </section>

        {/* ---- SECTION: OUR GALLERY ---- */}
        <section className="px-4 py-10 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="font-display text-3xl text-white">Our Gallery</h2>
            <div className="gold-divider w-24 mx-auto" />
          </div>

          {/* Masonry Gallery Grid */}
          <div className="gallery-masonry pt-4">
            {data.photos.gallery.map((photoId, idx) => {
              const thumbUrl = getDriveThumbnailUrl(photoId, 800);
              const fullUrl = getDriveFullUrl(photoId);
              // Vary the heights for masonry effect
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
        </section>

        {/* Modal Lightbox Foto */}
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

        {/* ---- SECTION: KISAH CINTA / LOVE STORY ---- */}
        {data.story && data.story.length > 0 && (
          <section className="px-6 py-10 space-y-6">
            <div className="text-center space-y-2">
              <p className="text-[11px] uppercase tracking-[0.3em] text-[#c9a96e]">
                Perjalanan Kami
              </p>
              <h2 className="font-display text-2xl text-white">Kisah Cinta</h2>
              <div className="gold-divider w-24 mx-auto" />
            </div>

            <div className="space-y-4 relative border-l border-[#c9a96e]/30 ml-4 pl-6 pt-4">
              {data.story.map((item, idx) => (
                <div key={idx} className="relative space-y-1 pb-4">
                  <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-[#c9a96e] border-2 border-[#0a0a0a] shadow" />
                  <span className="text-xs font-bold text-[#c9a96e] bg-[#c9a96e]/10 px-2 py-0.5 rounded">
                    {item.year}
                  </span>
                  <h3 className="font-medium text-white text-sm mt-1">{item.title}</h3>
                  <p className="text-xs text-stone-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ---- SECTION: WEDDING GIFT ---- */}
        {data.gifts && data.gifts.length > 0 && (
          <section className="relative min-h-[80vh] w-full overflow-hidden flex items-end">
            {/* Background photo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverUrl}
              alt="Wedding Gift Background"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />

            <div className="relative z-10 w-full p-8 pb-12 space-y-5">
              <h2 className="font-display text-3xl sm:text-4xl text-white text-center">
                Wedding Gift
              </h2>
              <div className="gold-divider w-24 mx-auto" />
              <p className="text-sm text-stone-300 text-center leading-relaxed max-w-sm mx-auto font-serif-elegant">
                Tanpa mengurangi rasa hormat kami bagi tamu yang ingin mengirimkan hadiah kepada kedua mempelai, silahkan klik dibawah ini :
              </p>

              {/* Dropdown + Copy */}
              <div className="flex items-center gap-3 max-w-sm mx-auto pt-2">
                <div className="flex-1 relative">
                  <select
                    value={selectedGiftIdx}
                    onChange={(e) => setSelectedGiftIdx(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-[#c9a96e]/50 font-serif-elegant"
                  >
                    {data.gifts.map((gift, idx) => (
                      <option key={idx} value={idx} className="bg-[#1a1a1a] text-white">
                        {gift.bank} — {gift.holder}
                      </option>
                    ))}
                  </select>
                  {/* Custom dropdown arrow */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const gift = data.gifts![selectedGiftIdx];
                    handleCopyAccount(gift.number, gift.bank);
                  }}
                  className="px-5 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-semibold hover:bg-white/20 transition tracking-wider"
                >
                  {copiedBank === data.gifts[selectedGiftIdx].bank ? "✓ COPIED" : "COPY"}
                </button>
              </div>

              {/* Show selected account number */}
              <div className="text-center">
                <p className="text-lg font-mono text-[#c9a96e] tracking-widest">
                  {data.gifts[selectedGiftIdx].number}
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  a.n. {data.gifts[selectedGiftIdx].holder}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ---- SECTION: BUKU TAMU & UCAPAN ---- */}
        <section className="px-6 py-10 space-y-6">
          <div className="text-center space-y-2">
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#c9a96e]">
              Buku Tamu
            </p>
            <h2 className="font-display text-2xl text-white">Ucapan & Doa Restu</h2>
            <div className="gold-divider w-24 mx-auto" />
            <p className="text-xs text-stone-400 pt-1">
              Kirimkan doa dan ucapan terbaik untuk kedua mempelai
            </p>
          </div>

          {/* Form Ucapan */}
          <form
            onSubmit={handleSubmitWish}
            className="p-5 rounded-xl bg-[#141414] border border-[#c9a96e]/15 space-y-3"
          >
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1">Nama Anda</label>
              <input
                type="text"
                placeholder="Contoh: Budi Santoso"
                required
                value={wishForm.name}
                onChange={(e) => setWishForm({ ...wishForm, name: e.target.value })}
                className="w-full px-3 py-2.5 text-sm bg-[#1a1a1a] border border-white/10 rounded-lg text-white placeholder-stone-600 focus:ring-1 focus:ring-[#c9a96e]/50 focus:border-[#c9a96e]/30 focus:outline-none font-serif-elegant"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1">Konfirmasi Kehadiran</label>
              <select
                value={wishForm.attendance}
                onChange={(e) =>
                  setWishForm({
                    ...wishForm,
                    attendance: e.target.value as "Hadir" | "Tidak Hadir" | "Ragu-ragu",
                  })
                }
                className="w-full px-3 py-2.5 text-sm bg-[#1a1a1a] border border-white/10 rounded-lg text-white focus:ring-1 focus:ring-[#c9a96e]/50 focus:border-[#c9a96e]/30 focus:outline-none appearance-none font-serif-elegant"
              >
                <option value="Hadir">Saya akan Hadir</option>
                <option value="Tidak Hadir">Maaf, Tidak Bisa Hadir</option>
                <option value="Ragu-ragu">Masih Ragu-ragu</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1">Pesan / Doa Restu</label>
              <textarea
                rows={3}
                placeholder="Tuliskan ucapan dan doa terbaik..."
                required
                value={wishForm.message}
                onChange={(e) => setWishForm({ ...wishForm, message: e.target.value })}
                className="w-full px-3 py-2.5 text-sm bg-[#1a1a1a] border border-white/10 rounded-lg text-white placeholder-stone-600 focus:ring-1 focus:ring-[#c9a96e]/50 focus:border-[#c9a96e]/30 focus:outline-none font-serif-elegant"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-[#c9a96e] to-[#a88a4e] hover:from-[#ddc08a] hover:to-[#c9a96e] text-black font-semibold text-sm transition"
            >
              Kirim Ucapan & Doa
            </button>
          </form>

          {/* List Ucapan */}
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {wishes.map((w) => (
              <div key={w.id} className="p-4 rounded-xl bg-[#141414] border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-white font-serif-elegant">{w.name}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      w.attendance === "Hadir"
                        ? "bg-emerald-900/50 text-emerald-400 border border-emerald-800/50"
                        : w.attendance === "Tidak Hadir"
                        ? "bg-stone-800 text-stone-400 border border-stone-700"
                        : "bg-amber-900/50 text-amber-400 border border-amber-800/50"
                    }`}
                  >
                    {w.attendance}
                  </span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">{w.message}</p>
                <span className="text-[10px] text-stone-500 block pt-1">{w.time}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ---- FOOTER ---- */}
        <footer className="pt-10 pb-16 px-6 text-center space-y-4 border-t border-white/5 mt-10">
          <p className="text-xs text-stone-500 leading-relaxed max-w-sm mx-auto">
            Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.
          </p>
          <div className="gold-divider w-16 mx-auto" />
          <p className="font-display text-xl text-white">
            {data.couple.bride.shortName} & {data.couple.groom.shortName}
          </p>
          <p className="text-xs text-[#c9a96e] font-medium tracking-wider">
            {data.couple.hashtag}
          </p>
        </footer>

        {/* Floating Admin Button */}
        <div className="fixed bottom-4 right-4 z-40">
          <Link
            href="/admin"
            className="px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium shadow-lg backdrop-blur-sm flex items-center gap-1.5 transition border border-white/10"
          >
            <span>⚙️</span>
            <span>Edit di Admin</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white font-serif-elegant">Memuat undangan...</div>}>
      <InvitationContent />
    </Suspense>
  );
}
