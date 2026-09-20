"use client";
import { youtubeVideoId } from "@/lib/youtube";
import YouTubeMusic from "../home/youtubeMusic";
import type { InvitationData } from "@/lib/gdrive";
export default function MusicEditor({data,onChange}: {data:InvitationData;onChange:(data:InvitationData)=>void}) {
  const music = data.music || {enabled:false,title:"",url:"",volume:0.4,loop:true};
  const youtubeId = youtubeVideoId(music.url);
  const update = (patch:Partial<typeof music>) => onChange({...data,music:{...music,...patch}});
  return <section className="rounded-xl border bg-white p-5 space-y-5">
    <h2 className="text-lg font-semibold">Lagu undangan</h2>
    <label className="flex items-center gap-3"><input type="checkbox" checked={music.enabled} onChange={e=>update({enabled:e.target.checked})} />Aktifkan musik undangan</label>
    <label className="block text-sm">Judul lagu<input className="mt-1 w-full rounded-lg border p-3" value={music.title} onChange={e=>update({title:e.target.value})} placeholder="Judul lagu / nama penyanyi" /></label>
    <label className="block text-sm">Link YouTube atau audio<input type="url" className="mt-1 w-full rounded-lg border p-3" value={music.url} onChange={e=>update({url:e.target.value.trim()})} placeholder="https://contoh.com/lagu.mp3" /></label>
    <p className="text-xs text-stone-500">Bisa memakai link YouTube (watch, youtu.be, Shorts) atau file MP3, M4A, dan OGG. Spotify tidak didukung. File lokal di public/music juga bisa dipakai, misalnya /music/lagu.mp3.</p>
    <label className="block text-sm">Volume awal: {Math.round(music.volume*100)}%<input type="range" min="0" max="1" step="0.05" className="mt-2 block w-full" value={music.volume} onChange={e=>update({volume:Number(e.target.value)})} /></label>
    <label className="flex items-center gap-3"><input type="checkbox" checked={music.loop} onChange={e=>update({loop:e.target.checked})} />Ulangi lagu</label>
    {music.url && <div className="space-y-2"><p className="text-sm font-medium">Preview lagu</p>{youtubeId ? <YouTubeMusic key={`${youtubeId}-${music.loop}`} id={youtubeId} title={music.title} loop={music.loop} volume={music.volume} preview /> : <audio key={music.url} src={music.url} controls preload="none" className="w-full" />}</div>}
    <p className="text-sm text-stone-500">Klik Simpan Perubahan. Musik dicoba otomatis setelah undangan dibuka. Jika browser menahan autoplay, tamu dapat menekan tombol musik. Tidak ada preview video.</p>
  </section>;
}
