import { InvitationData } from "@/lib/gdrive";

interface StorySectionProps {
  story?: InvitationData["story"];
}

export default function StorySection({ story }: StorySectionProps) {
  if (!story || story.length === 0) return null;

  return (
    <section className="px-6 py-10 space-y-6">
      <div className="text-center space-y-2">
        <p className="text-[11px] uppercase tracking-[0.3em] text-[#c9a96e]">
          Perjalanan Kami
        </p>
        <h2 className="font-display text-2xl text-white">Kisah Cinta</h2>
        <div className="gold-divider w-24 mx-auto" />
      </div>

      <div className="space-y-4 relative border-l border-[#c9a96e]/30 ml-4 pl-6 pt-4">
        {story.map((item, idx) => (
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
  );
}