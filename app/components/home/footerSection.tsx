import Link from "next/link";

interface FooterSectionProps {
  brideShortName: string;
  groomShortName: string;
  hashtag: string;
}

export default function FooterSection({
  brideShortName,
  groomShortName,
  hashtag,
}: FooterSectionProps) {
  return (
    <>
      <footer className="pt-10 pb-16 px-6 text-center space-y-4 border-t border-white/5 mt-10">
        <p className="text-xs text-stone-500 leading-relaxed max-w-sm mx-auto">
          Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.
        </p>
        <div className="gold-divider w-16 mx-auto" />
        <p className="font-display text-xl text-white">
          {brideShortName} & {groomShortName}
        </p>
        <p className="text-xs text-[#c9a96e] font-medium tracking-wider">
          {hashtag}
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
    </>
  );
}