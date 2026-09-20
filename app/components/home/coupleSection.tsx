import type { InvitationData } from "@/lib/gdrive";
import GroomSection from "./groomSection";
import BrideSection from "./brideSection";

interface CoupleSectionProps {
  couple: InvitationData["couple"];
}

export default function CoupleSection({ couple }: CoupleSectionProps) {
  return (
    <section
      aria-label="Kedua mempelai"
      className="relative space-y-8 bg-black/25 px-6 py-12 backdrop-blur-[8px]"
    >
      <GroomSection {...couple.groom} />
      <BrideSection {...couple.bride} />
    </section>
  );
}
