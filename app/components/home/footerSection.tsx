"use client";

import { revealMotion } from "./revealMotion";
import { motion } from "framer-motion";



interface FooterSectionProps {
  text?: string;
  brideShortName: string;
  groomShortName: string;
  hashtag: string;
}

export default function FooterSection({
  text,
  brideShortName,
  groomShortName,
  hashtag,
}: FooterSectionProps) {
  return (
    <>
      <footer className="pt-10 pb-16 px-6 text-center space-y-4 border-t border-white/5 mt-10">
        <motion.p {...revealMotion("fade", 0)} className="text-xs text-stone-500 leading-relaxed max-w-sm mx-auto">
          {text || "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu."}
        </motion.p>
        <div className="gold-divider w-16 mx-auto" />
        <motion.p {...revealMotion("fade", 0.1)} className="font-serif text-2xl sm:text-3xl tracking-wide text-white">
          {brideShortName} & {groomShortName}
        </motion.p>
        <motion.p {...revealMotion("text", 0.2)} className="text-xs text-[#c9a96e] font-medium tracking-wider">
          {hashtag}
        </motion.p>
      </footer>

    </>
  );
}