"use client";
import { useEffect, useRef, useState } from "react";
import { youtubeVideoId } from "@/lib/youtube";
import MusicIcon from "./musicIcon";
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
    if (isOpen && enabled && !document.hidden) void player.play().catch(()=>{/* Browser may require a tap on the play button. */});
    else player.pause();
    return ()=>player.pause();
  },[isOpen,enabled,music?.url,youtubeId]);
  useEffect(() => {
    let resumeOnReturn = false;
    const pause = () => {
      const player = audio.current;
      if (!player) return;
      resumeOnReturn = resumeOnReturn || (!player.paused && !player.ended);
      player.pause();
    };
    const resume = () => {
      if (document.hidden || !resumeOnReturn) return;
      resumeOnReturn = false;
      if (isOpen && enabled) void audio.current?.play().catch(() => setPlaying(false));
    };
    const onVisibility = () => { if (document.hidden) pause(); else resume(); };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", pause);
    window.addEventListener("pageshow", resume);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", pause);
      window.removeEventListener("pageshow", resume);
    };
  }, [isOpen, enabled, music?.url, youtubeId]);
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
    <audio ref={audio} src={music!.url} loop={music!.loop} preload="none" onPlay={()=>{if(document.hidden)audio.current?.pause();else setPlaying(true);}} onPause={()=>setPlaying(false)} onEnded={()=>setPlaying(false)} onError={()=>{setPlaying(false);setError("Lagu tidak dapat dimuat.");}} />
    {isOpen && <div className="fixed bottom-5 right-5 z-40 max-w-[230px] font-sans">
      <button type="button" onClick={toggle} aria-label={error || (playing?"Jeda musik":"Putar musik")} title={error || (playing?"Jeda musik":"Putar musik")} aria-pressed={playing} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/75 text-white shadow-lg backdrop-blur-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"><MusicIcon playing={playing} /></button>
      {error && <p role="status" className="sr-only">{error}</p>}
    </div>}
  </>;
}
