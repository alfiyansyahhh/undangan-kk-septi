interface CountdownSectionProps {
  timeLeft: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  displayDate: string;
}

export default function CountdownSection({ timeLeft, displayDate }: CountdownSectionProps) {
  return (
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

      <p className="text-xs text-stone-400 pt-2">{displayDate}</p>
    </section>
  );
}