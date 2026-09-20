"use client";
import { useEffect, useRef, useState } from "react";
import { youtubeVideoId } from "@/lib/youtube";
import YouTubeMusic from "./youtubeMusic";
import type { InvitationData } from "@/lib/gdrive";
export default function MusicPlayer({music,isOpen}: {music:InvitationData["music"];isOpen:boolean}) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing,setPlaying] = useState(false);
  const [error,setError] = useState("");
  const youtubeId = youtubeVideoId(music?.url || "");
  const enabled = !!music?.enabled && !!music.url;
  useEffect(()=> {
    const player = audio.current;
    if (!player) return;
    player.volume = music?.volume ?? 0.4;
  },[music?.volume,enabled,youtubeId]);
  useEffect(()=> {
    const player = audio.current;
    if (!player) return;
    if (isOpen && enabled) void player.play().catch(()=>{/* Browser may require a tap on the play button. */});
    else player.pause();
    return ()=>player.pause();
  },[isOpen,enabled,music?.url,youtubeId]);
  if (!enabled) return null;
  if (youtubeId) return isOpen ? <YouTubeMusic key={`${youtubeId}-${music!.loop}`} id={youtubeId} title={music!.title} loop={music!.loop} volume={music!.volume} /> : null;
  async function toggle() {
    const player = audio.current;
    if (!player) return;
    setError("");
    if (!player.paused) player.pause();
    else {
      try { await player.play(); } catch { setError("Lagu belum bisa diputar. Coba lagi."); }
    }
  }
  return <>
    <audio ref={audio} src={music!.url} loop={music!.loop} preload="none" onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onEnded={()=>setPlaying(false)} onError={()=>{setPlaying(false);setError("Lagu tidak dapat dimuat.");}} />
    {isOpen && <div className="fixed bottom-5 left-5 z-40 max-w-[230px] font-sans">
      <button type="button" onClick={toggle} aria-label={playing?"Jeda musik":"Putar musik"} aria-pressed={playing} className="flex items-center gap-2 rounded-full border border-white/25 bg-black/75 px-4 py-3 text-xs text-white shadow-lg backdrop-blur-md"><span aria-hidden="true">{playing?"Ⅱ":"▶"}</span><span className="max-w-40 truncate">{music?.title || "Musik undangan"}</span></button>
      {error && <p role="status" className="mt-2 rounded bg-black/80 p-2 text-xs text-white">{error}</p>}
    </div>}
  </>;
}
