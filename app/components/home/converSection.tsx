"use client";

interface CoverSectionProps {
  isOpen: boolean;
  coverUrl: string;
  brideShortName: string;
  groomShortName: string;
  displayDate: string;
  guestName: string;
  onOpen: () => void;
}

export default function CoverSection({
  isOpen,
  coverUrl,
  brideShortName,
  groomShortName,
  displayDate,
  guestName,
  onOpen,
}: CoverSectionProps) {
  return (
    <section
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between text-white transition-all duration-1000 ${
        isOpen ? "-translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
      }`}
    >
      <div className="absolute inset-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverUrl}
          alt="Cover"
          className="w-full h-full object-cover object-center animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
      </div>

      <div className="relative z-10 pt-16" />

      <div className="relative z-10 text-center px-6 space-y-5 animate-fade-in">
        <p className="text-[11px] sm:text-xl uppercase tracking-[0.35em] text-[#c9a96e] font-medium">
          The Wedding Of
        </p>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-white leading-tight">
          {brideShortName} & {groomShortName}
        </h1>
        <div className="gold-divider w-32 mx-auto" />
        <p className="text-[11px] tracking-widest sm:text-2xl text-stone-300">
          {displayDate}
        </p>
      </div>

      <div className="relative  z-10 max-w-sm w-full flex items-center justify-center px-6 pb-8 space-y-4">
        <div className="   p-5 text-center space-y-3">
          <p className="text-[11px] sm:text-xl text-stone-400 tracking-wide">Kepada Yth. Bapak/Ibu/Saudara/i:</p>
          <div className="py-1.5 px-4 rounded-lg ">
            <h2 className="text-lg sm:text-2xl font-semibold text-white tracking-wide capitalize font-serif-elegant">
              {guestName}
            </h2>
          </div>
          <button
            onClick={onOpen}
            className="w-auto mx-auto sm:text-lg cursor-pointer item-cen py-3 px-6 rounded-lg bg-gradient-to-r from-[#c9a96e] to-[#a88a4e] hover:from-[#ddc08a] hover:to-[#c9a96e] text-black font-semibold text-sm shadow-lg shadow-amber-900/30 transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
          >
            <span>Buka Undangan</span>
          </button>
        </div>
      </div>
    </section>
  );
}