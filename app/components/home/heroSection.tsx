"use client";

interface HeroSectionProps {
  brideShortName: string;
  groomShortName: string;
  displayDate: string;
}

export default function HeroSection({
  brideShortName,
  groomShortName,
  displayDate,
}: HeroSectionProps) {
  return (
    <section className="relative w-full h-screen min-h-[600px] flex flex-col justify-end text-white bg-transparent">
      {/* Hero Typography Content */}
      <div className="relative z-10 text-center px-6 pb-16 pt-20 space-y-4 max-w-md mx-auto w-full">
        <p className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-stone-300 font-sans font-light">
          THE WEDDING OF
        </p>

        <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white tracking-widest uppercase font-medium">
          {groomShortName} &bull; {brideShortName}
        </h1>

        <p className="text-[10px] sm:text-xs tracking-[0.25em] text-stone-300 uppercase font-sans">
          {displayDate}
        </p>

        {/* Scroll Indicator Icon */}
        <div className="pt-8 animate-bounce opacity-70">
          <svg
            className="w-5 h-5 mx-auto text-stone-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 14l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}