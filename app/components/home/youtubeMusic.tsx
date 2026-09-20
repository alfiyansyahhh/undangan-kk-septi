"use client";
import { useEffect, useRef, useState } from "react";
interface Player {
  playVideo(): void; pauseVideo(): void; destroy(): void; setVolume(value:number): void;
}
interface YouTubeAPI {
  Player: new (element: HTMLElement, options: {
    videoId:string; playerVars:Record<string,string|number>;
    events:{onReady:(event:{target:Player})=>void;onStateChange:(event:{data:number})=>void;onError:()=>void;onAutoplayBlocked:()=>void};
  }) => Player;
}
declare global { interface Window { YT?:YouTubeAPI; onYouTubeIframeAPIReady?:()=>void } }
let apiPromise: Promise<YouTubeAPI> | undefined;
function loadAPI() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!apiPromise) apiPromise = new Promise<YouTubeAPI>((resolve,reject)=> {
    const previous = window.onYouTubeIframeAPIReady;
    const timeout = window.setTimeout(()=>{apiPromise=undefined;reject(new Error("YouTube timeout"));},15000);
    window.onYouTubeIframeAPIReady = ()=>{clearTimeout(timeout);previous?.();if(window.YT)resolve(window.YT);};
    const script=document.createElement("script"); script.src="https://www.youtube.com/iframe_api";
    script.onerror=()=>{clearTimeout(timeout);apiPromise=undefined;script.remove();reject(new Error("YouTube unavailable"));};
    document.head.appendChild(script);
  });
  return apiPromise;
}
export default function YouTubeMusic({id,title,loop,volume=0.4,preview=false}: {id:string;title:string;loop:boolean;volume?:number;preview?:boolean}) {
  const container=useRef<HTMLDivElement>(null);
  const player=useRef<Player | null>(null);
  const [playing,setPlaying]=useState(false);
  const [ready,setReady]=useState(false);
  const [error,setError]=useState("");
  const volumeRef=useRef(volume);
  useEffect(()=>{volumeRef.current=volume;player.current?.setVolume(volume*100);},[volume]);
  useEffect(()=> {
    let cancelled=false;
    let instance:Player | undefined;
    loadAPI().then(api=> {
      if(cancelled || !container.current)return;
      const host=document.createElement("div"); container.current.appendChild(host);
      instance=new api.Player(host,{
        videoId:id,
        playerVars:{playsinline:1,controls:0,origin:window.location.origin,loop:loop?1:0,playlist:loop?id:""},
        events:{
          onReady:({target})=>{if(cancelled)return;player.current=target;target.setVolume(volumeRef.current*100);setReady(true);if(!preview)target.playVideo();},
          onStateChange:({data})=>{if(!cancelled)setPlaying(data===1);},
          onError:()=>{if(!cancelled){setPlaying(false);setError("Lagu YouTube tidak bisa diputar. Coba pilih lagu lain.");}},
          onAutoplayBlocked:()=>{if(!cancelled)setPlaying(false);},
        },
      });
    }).catch(()=>{if(!cancelled)setError("Gagal memuat musik. Muat ulang untuk mencoba lagi.");});
    return ()=>{cancelled=true;instance?.destroy();player.current=null;};
  },[id,loop,preview]);
  function toggle() { if(playing)player.current?.pauseVideo();else player.current?.playVideo(); }
  return <div className={preview?"text-stone-800 font-sans":"fixed bottom-5 left-5 z-40 max-w-[230px] text-white font-sans"}>
    <div ref={container} aria-hidden="true" inert className="pointer-events-none fixed -left-[10000px] top-0 h-[200px] w-[200px] opacity-0" />
    <button type="button" disabled={!ready || !!error} onClick={toggle} aria-label={playing?"Jeda musik":"Putar musik"} aria-pressed={playing} className="flex items-center gap-2 rounded-full border border-white/25 bg-black/80 px-4 py-3 text-xs text-white shadow-lg disabled:opacity-60"><span aria-hidden="true">{playing?"Ⅱ":"▶"}</span><span className="max-w-40 truncate">{ready ? title || "Musik undangan" : error ? "Musik tidak tersedia" : "Memuat musik…"}</span></button>
    {error && <p role="status" className="mt-2 rounded bg-black/80 p-2 text-xs text-white">{error}</p>}
  </div>;
}
