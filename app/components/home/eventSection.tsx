import { InvitationData } from "@/lib/gdrive";

interface EventSectionProps {
  events: InvitationData["events"];
}

export default function EventSection({ events }: EventSectionProps) {
  return (
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
            {events.akad.title}
          </span>
          <p className="font-serif-elegant text-lg font-medium text-white pt-1">
            {events.akad.date}
          </p>
          <p className="text-xs font-semibold text-[#c9a96e]">
            ⏰ {events.akad.time}
          </p>
          <div className="pt-2 text-xs text-stone-300 space-y-1">
            <p className="font-bold text-white">{events.akad.venue}</p>
            <p className="text-stone-400">{events.akad.address}</p>
          </div>
        </div>

        {/* Resepsi */}
        <div className="p-5 rounded-xl bg-[#141414] border border-[#c9a96e]/20 text-center space-y-2">
          <span className="inline-block px-3 py-1 bg-[#c9a96e]/15 text-[#c9a96e] rounded-full text-xs font-semibold tracking-wide">
            {events.resepsi.title}
          </span>
          <p className="font-serif-elegant text-lg font-medium text-white pt-1">
            {events.resepsi.date}
          </p>
          <p className="text-xs font-semibold text-[#c9a96e]">
            ⏰ {events.resepsi.time}
          </p>
          <div className="pt-2 text-xs text-stone-300 space-y-1">
            <p className="font-bold text-white">{events.resepsi.venue}</p>
            <p className="text-stone-400">{events.resepsi.address}</p>
          </div>
        </div>
      </div>

      {/* Maps Button */}
      <div className="pt-2">
        <a
          href={events.resepsi.mapsUrl || "https://maps.google.com"}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 px-4 rounded-xl bg-[#c9a96e] hover:bg-[#ddc08a] text-black text-xs font-semibold transition flex items-center justify-center gap-2 shadow-sm"
        >
          <span>📍</span>
          <span>Buka Petunjuk Arah (Google Maps)</span>
        </a>
      </div>
    </section>
  );
}