"use client";

import { useEffect, useRef } from "react";

export default function PhotoLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    const body = document.body;
    const root = document.documentElement;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const previous = { position: body.style.position, top: body.style.top, left: body.style.left, width: body.style.width, overflow: body.style.overflow, rootOverflow: root.style.overflow };
    element?.showModal();
    Object.assign(body.style, { position: "fixed", top: `-${scrollY}px`, left: `-${scrollX}px`, width: "100%", overflow: "hidden" });
    root.style.overflow = "hidden";
    return () => {
      element?.close();
      Object.assign(body.style, { position: previous.position, top: previous.top, left: previous.left, width: previous.width, overflow: previous.overflow });
      root.style.overflow = previous.rootOverflow;
      window.scrollTo({ left: scrollX, top: scrollY, behavior: "instant" });
    };
  }, []);
  return <dialog ref={dialog} aria-label="Preview foto" onClose={() => { if (!dialog.current?.open) onClose(); }}
    onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}
    className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overscroll-none border-0 bg-black/95 p-4 text-white backdrop:bg-black/80 open:flex open:flex-col open:items-center open:justify-center">
    <button type="button" autoFocus onClick={() => dialog.current?.close()} className="absolute right-5 top-5 z-10 rounded-full bg-white/15 px-4 py-2 text-sm focus-visible:outline-2 focus-visible:outline-white">✕ Tutup</button>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={src} alt="Foto diperbesar" className="max-h-[80dvh] max-w-full rounded-lg object-contain" />
  </dialog>;
}
