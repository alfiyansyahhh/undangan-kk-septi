"use client";

interface CountdownSectionProps {
  timeLeft: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  displayDate: string;
}

export default function CountdownSection({
  timeLeft,
  displayDate,
}: CountdownSectionProps) {
  const timeUnits = [
    { label: "HARI", value: timeLeft.days },
    { label: "JAM", value: timeLeft.hours },
    { label: "MENIT", value: timeLeft.minutes },
    { label: "DETIK", value: timeLeft.seconds },
  ];

  return (
    <section className="px-6 py-12 text-center text-white space-y-6 relative z-10">
      {/* Subtitle / Category Label */}
      <p className="text-[10px] sm:text-xs uppercase tracking-[0.35em] text-stone-300 font-sans font-light">
        MENGHITUNG HARI
      </p>

      {/* Title - Menggunakan font-serif standar */}
      <h2 className="font-serif text-2xl sm:text-3xl text-white tracking-wide">
        Menuju Hari Bahagia
      </h2>

      {/* Divider tipis yang seragam */}
      <div className="w-16 h-[1px] bg-stone-400/50 mx-auto" />

      {/* Countdown Grid dengan gaya Frosted Glass & Font Seragam */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-sm mx-auto pt-2">
        {timeUnits.map((item, idx) => (
          <div
            key={idx}
            className="p-3 sm:p-4 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 flex flex-col items-center justify-center space-y-1 shadow-lg"
          >
            <span className="font-serif text-xl sm:text-2xl font-normal text-white">
              {String(item.value).padStart(2, "0")}
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-stone-400 font-sans">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Display Date */}
      <p className="text-xs sm:text-sm font-serif italic text-stone-300 pt-2 tracking-wide">
        {displayDate}
      </p>
    </section>
  );
}