"use client";
import { calendarSchedule } from "@/lib/calendar";
import type { InvitationData } from "@/lib/gdrive";

export default function CalendarButtons({ events }: { events: InvitationData["events"] }) {
  const available = (["akad", "resepsi"] as const).filter(key => calendarSchedule(events[key]));
  if (!available.length) return null;
  return (
    <details className="group pt-2 text-center">
      <summary className="mx-auto flex min-h-12 w-fit cursor-pointer list-none items-center justify-center gap-3 rounded-full border border-[#ddc08a]/40 bg-gradient-to-r from-[#c9a96e] to-[#b3945c] px-7 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[#19150e] shadow-lg transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ddc08a] [&::-webkit-details-marker]:hidden">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 shrink-0"><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M16 3v4M8 3v4M3 11h18m-13 5h2m4 0h2" /></svg>
        Simpan ke Kalender
        <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3 w-3 transition-transform group-open:rotate-180"><path d="m4 6 4 4 4-4" /></svg>
      </summary>
      <div className="mt-4 rounded-2xl border border-[#c9a96e]/25 bg-[#171410]/95 p-5 text-left shadow-xl backdrop-blur-md">
        <p className="mb-4 text-center text-xs text-stone-400">Pilih acara dan kalender Anda</p>
        <div className="divide-y divide-[#c9a96e]/15">
          {available.map(key => <div key={key} className="space-y-3 py-4 first:pt-0 last:pb-0">
            <div><h3 className="font-serif text-lg text-[#eee5d5]">{events[key].title}</h3><p className="mt-1 text-xs leading-5 text-stone-400">{events[key].date} · {events[key].time}</p></div>
            <div className="flex flex-wrap gap-2">
              <a href={`/api/calendar?event=${key}&provider=google`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-[#c9a96e]/30 bg-[#c9a96e]/10 px-4 py-3 text-xs text-[#e0c99f] transition hover:bg-[#c9a96e]/20 focus-visible:outline-2 focus-visible:outline-[#ddc08a]">Google Calendar</a>
              <a href={`/api/calendar?event=${key}`} className="rounded-lg border border-white/15 px-4 py-3 text-xs text-stone-200 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-[#ddc08a]">Apple / Outlook</a>
            </div>
          </div>)}
        </div>
      </div>
    </details>
  );
}
