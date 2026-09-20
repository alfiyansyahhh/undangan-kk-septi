import type { MotionProps } from "framer-motion";

type RevealKind = "title" | "photo" | "text" | "fade" | "left" | "right" | "zoom";

export function revealMotion(kind: RevealKind = "text", delay = 0): MotionProps {
  const entrances = {
    title: { opacity: 0, y: -20 },
    photo: { opacity: 0, y: 30, scale: 0.9 },
    text: { opacity: 0, y: 24 },
    fade: { opacity: 0 },
    left: { opacity: 0, x: -32 },
    right: { opacity: 0, x: 32 },
    zoom: { opacity: 0, scale: 0.94 },
  };
  return {
    initial: entrances[kind],
    whileInView: { opacity: 1, x: 0, y: 0, scale: 1 },
    viewport: { once: false, amount: 0.3 },
    transition: { duration: kind === "fade" ? 0.9 : 0.7, ease: "easeOut", delay },
  };
}
