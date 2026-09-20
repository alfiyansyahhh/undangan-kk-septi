"use client";
import { useEffect, useRef, useState } from "react";
import type { GDrivePhoto, InvitationData } from "@/lib/gdrive";
import { getDriveThumbnailUrl } from "@/lib/gdrive";

const input = "mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm";
function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block text-sm text-stone-700">{label}<textarea rows={2} className={input} value={value} onChange={e => onChange(e.target.value)} /></label>;
}
function PhotoPreview({ src, label, onClose }: { src: string; label: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { element?.close(); document.body.style.overflow = previous; };
  }, []);
  return <dialog ref={dialog} aria-label={`Preview ${label}`} onClose={() => { if (!dialog.current?.open) onClose(); }}
    onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}
    className="fixed inset-0 m-auto max-h-[95dvh] w-[min(94vw,1000px)] max-w-none overflow-auto rounded-xl bg-stone-950 p-4 text-white shadow-2xl backdrop:bg-black/80">
    <div className="mb-3 flex items-center justify-between gap-4"><p className="min-w-0 truncate text-sm">{label}</p><button type="button" autoFocus onClick={() => dialog.current?.close()} className="shrink-0 rounded-lg bg-white/15 px-4 py-2">Tutup ✕</button></div>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={getDriveThumbnailUrl(src, 1600)} alt={label} className="mx-auto max-h-[78dvh] max-w-full object-contain" />
  </dialog>;
}
function PhotoPicker({ label, value, photos, onChange, multiple = false }: { label: string; value: string[]; photos: GDrivePhoto[]; onChange: (value: string[]) => void; multiple?: boolean }) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<{ src: string; label: string } | null>(null);
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(30);
  const filtered = photos.filter(p => `${p.name} ${p.id}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="min-w-0 self-start rounded-lg border border-stone-200 p-3 space-y-3">
    <div className="flex justify-between gap-3"><strong className="text-sm">{label}</strong><button type="button" aria-expanded={open} className="text-sm text-amber-700" onClick={() => setOpen(!open)}>{open ? "Tutup" : "Pilih foto"}</button></div>
    <div className="flex gap-2 overflow-x-auto">
      {value.map((src, index) => <div key={`${src}-${index}`} className="shrink-0 space-y-1">
        <button type="button" aria-label={`Perbesar ${label} ${index + 1}`} onClick={() => setPreview({ src, label: `${label} ${index + 1}` })}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={getDriveThumbnailUrl(src, 200)} alt={`${label} ${index + 1}`} className="h-20 w-16 rounded object-cover" />
        </button>
        <button type="button" className="block text-xs text-amber-800 underline" onClick={() => setPreview({ src, label: `${label} ${index + 1}` })}>Perbesar</button>
        <div className="flex gap-2 text-xs"><button type="button" aria-label="Hapus foto" onClick={() => onChange(value.filter((_, i) => i !== index))}>Hapus</button>{multiple && index > 0 && <button type="button" aria-label="Geser foto ke kiri" onClick={() => { const next = [...value]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; onChange(next); }}>←</button>}</div>
      </div>)}
      {!value.length && <p className="text-xs text-stone-500">Belum dipilih; memakai foto bawaan section.</p>}
    </div>
    {open && <div className="space-y-3"><input aria-label={`Cari foto ${label}`} placeholder="Cari nama foto…" value={query} onChange={e => { setQuery(e.target.value); setLimit(30); }} className={input} />
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 max-h-80 overflow-y-auto">
        {filtered.slice(0, limit).map(photo => <div key={photo.id} className={`min-w-0 rounded border-2 p-1 ${value.includes(photo.id) ? "border-amber-600" : "border-transparent"}`}>
          <button type="button" className="block w-full cursor-zoom-in" aria-label={`Perbesar ${photo.name}`} onClick={() => setPreview({ src: photo.id, label: photo.name })}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.thumbnail} alt={photo.name} loading="lazy" className="h-24 w-full rounded object-cover" />
          </button>
          <span className="block truncate text-xs" title={photo.name}>{photo.name}</span>
          <button type="button" className="mt-1 min-h-9 w-full cursor-zoom-in rounded border border-stone-300 bg-white px-1 py-1 text-xs font-medium text-stone-700 hover:bg-stone-100" onClick={() => setPreview({ src: photo.id, label: photo.name })}>⤢ Perbesar</button>
          <button type="button" aria-pressed={value.includes(photo.id)} className="mt-1 w-full rounded bg-amber-50 py-1 text-xs text-amber-900" onClick={() => { onChange(multiple ? value.includes(photo.id) ? value.filter(v => v !== photo.id) : [...value, photo.id] : [photo.id]); if (!multiple) setOpen(false); }}>{value.includes(photo.id) ? "✓ Dipilih" : "Pilih"}</button>
        </div>)}
      </div>{filtered.length > limit && <button type="button" onClick={() => setLimit(limit + 30)}>Tampilkan lebih banyak</button>}
    </div>}
    {preview && <PhotoPreview src={preview.src} label={preview.label} onClose={() => setPreview(null)} />}
  </div>;
}
export default function SectionEditor({ data, photos, onChange }: { data: InvitationData; photos: GDrivePhoto[]; onChange: (data: InvitationData) => void }) {
  const section = (key: keyof NonNullable<InvitationData["sections"]>, value: string) => onChange({ ...data, sections: { ...data.sections, [key]: value } });
  const story = data.story || [];
  return <div className="space-y-6">
    <section className="rounded-xl bg-white border p-5 space-y-4"><h2 className="font-bold">Foto per section</h2><p className="text-sm text-stone-500">Pilih dari pustaka foto. Foto tetap tersedia untuk galeri; pilihan section disimpan terpisah. Untuk slideshow, urutan pilihan menjadi urutan tampil.</p>
      <div className="grid items-start md:grid-cols-2 gap-4">
        {([['coverSlides','Slideshow cover & background / hero'],['quoteSlides','Slider kutipan']] as const).map(([key,label]) => <PhotoPicker key={key} label={label} photos={photos} multiple value={data.photos[key] || []} onChange={value => onChange({ ...data, photos: { ...data.photos, [key]: value } })} />)}
        {([['akad','Foto akad'],['resepsi','Foto resepsi'],['gift','Background hadiah'],['galleryCover','Foto utama galeri']] as const).map(([key,label]) => <PhotoPicker key={key} label={label} photos={photos} value={data.photos[key] ? [data.photos[key]!] : []} onChange={value => onChange({ ...data, photos: { ...data.photos, [key]: value[0] || '' } })} />)}
      </div>
    </section>
    <section className="rounded-xl bg-white border p-5 space-y-4"><h2 className="font-bold">Teks section</h2>
      <Field label="Judul undangan" value={data.couple.title} onChange={value => onChange({ ...data, couple: { ...data.couple, title: value } })} />
      <Field label="Tanggal yang ditampilkan" value={data.events.displayDate} onChange={value => onChange({ ...data, events: { ...data.events, displayDate: value } })} />
      {([['galleryTitle','Judul galeri'],['galleryVideo','URL video embed galeri (kosongkan untuk foto)'],['storyTitle','Judul cerita'],['giftTitle','Judul hadiah'],['giftDescription','Pesan hadiah'],['wishTitle','Judul buku tamu'],['wishDescription','Pesan buku tamu'],['footerText','Pesan penutup']] as const).map(([key,label]) => <Field key={key} label={label} value={data.sections?.[key] || ''} onChange={value => section(key,value)} />)}
      <p className="text-xs text-stone-500">Teks kosong memakai teks bawaan. Kutipan dan rekening ada di tab Data Mempelai &amp; Acara.</p>
      {(['akad','resepsi'] as const).map(key => <div key={key} className="grid sm:grid-cols-2 gap-3"><Field label={`Judul ${key}`} value={data.events[key].title} onChange={value => onChange({ ...data, events: { ...data.events, [key]: { ...data.events[key], title: value } } })} /><Field label={`Link Maps ${key}`} value={data.events[key].mapsUrl} onChange={value => onChange({ ...data, events: { ...data.events, [key]: { ...data.events[key], mapsUrl: value } } })} /></div>)}
    </section>
    <section className="rounded-xl bg-white border p-5 space-y-4"><h2 className="font-bold">Cerita perjalanan</h2>
      {story.map((item,index) => <div key={index} className="rounded-lg border p-4 space-y-3">
        {(['year','title','desc'] as const).map(key => <Field key={key} label={{ year:'Tahun',title:'Judul cerita',desc:'Cerita' }[key]} value={item[key]} onChange={value => onChange({ ...data, story: story.map((row,i) => i === index ? { ...row, [key]:value } : row) })} />)}
        <PhotoPicker label="Foto cerita" photos={photos} value={item.image ? [item.image] : []} onChange={value => onChange({ ...data, story: story.map((row,i) => i === index ? { ...row, image: value[0] || '' } : row) })} />
        <div className="flex gap-4 text-sm">{index > 0 && <button type="button" onClick={() => { const next = [...story]; [next[index-1],next[index]] = [next[index],next[index-1]]; onChange({ ...data, story:next }); }}>↑ Naik</button>}<button type="button" className="text-red-700" onClick={() => onChange({ ...data, story:story.filter((_,i) => i !== index) })}>Hapus cerita</button></div>
      </div>)}
      <button type="button" className="rounded bg-amber-100 px-4 py-2 text-amber-900" onClick={() => onChange({ ...data, story:[...story,{year:'',title:'',desc:'',image:''}] })}>+ Tambah cerita</button>
    </section>
  </div>;
}
