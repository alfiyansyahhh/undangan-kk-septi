"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { InvitationData } from "@/lib/gdrive";
import { defaultShareTemplate, guestMessage, invitationLink, whatsappPhone } from "@/lib/share";
const subscribe = () => () => {};
export default function ShareEditor({ data, onChange }: { data: InvitationData; onChange: (data: InvitationData) => void }) {
  const origin = useSyncExternalStore(subscribe, () => window.location.origin, () => "");
  const [base, setBase] = useState("");
  const [names, setNames] = useState("");
  const [notice, setNotice] = useState("");
  const [guests, setGuests] = useState<Array<{name:string;phone:string;token:string}>>([]);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    fetch("/api/guests").then(async res => { if (!res.ok) throw new Error(); setGuests(await res.json()); }).catch(() => setNotice("Gagal memuat daftar tamu. Silakan login ulang atau muat ulang."));
  }, []);
  async function generate() {
    setBusy(true); setNotice("");
    try {
      const list = [...new Set(names.split("\n").map(v => v.trim()).filter(Boolean))].map(line => { const [name, phone = ""] = line.split("|").map(v => v.trim()); return {name,phone}; });
      const res = await fetch("/api/guests", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({guests:list})});
      const result = await res.json(); if (!res.ok) throw new Error(result.message);
      setGuests(result); setNames(""); setNotice("Link tamu berhasil disimpan. Nama RSVP terkunci sesuai link.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Gagal membuat link tamu."); }
    finally { setBusy(false); }
  }
  const template = data.sections?.shareTemplate || defaultShareTemplate;
  const rows = guests.map(({name,phone,token}) => {
    let link = "";
    try { link = invitationLink(base || origin, token); } catch { /* Show URL validation below. */ }
    const message = guestMessage(template, { nama:name, mempelai:`${data.couple.bride.shortName} & ${data.couple.groom.shortName}`, tanggal:data.events.displayDate, link });
    const number = whatsappPhone(phone);
    return { token, name, phone, number, link, message, whatsapp:`https://wa.me/${number}?text=${encodeURIComponent(message)}` };
  }).filter(row => row.name);
  async function copy(value: string) {
    try { await navigator.clipboard.writeText(value); setNotice("Berhasil disalin."); }
    catch { setNotice("Tidak bisa menyalin otomatis. Pilih teks preview lalu salin manual."); }
  }
  return <section className="rounded-xl border bg-white p-5 space-y-5">
    <h2 className="text-lg font-semibold">Bagikan undangan</h2>
    <p className="text-sm text-stone-500">Satu baris per tamu. Opsional: tulis Nama | 081234567890. Tombol WhatsApp membuka pesan untuk kamu periksa dan kirim sendiri.</p>
    <label className="block text-sm">Alamat website undangan<input type="url" className="mt-1 w-full rounded-lg border p-3" placeholder={origin || "https://undangan.example.com"} value={base} onChange={e => setBase(e.target.value)} /></label>
    <p className="text-xs text-stone-500">Gunakan alamat website yang sudah online agar bisa dibuka tamu.</p>
    <div className="grid gap-4 md:grid-cols-2 items-start">
      <label className="block text-sm">Daftar tamu<textarea rows={9} className="mt-1 w-full rounded-lg border p-3" placeholder={'Budi & Keluarga | 081234567890\nDinda Lestari'} value={names} onChange={e => setNames(e.target.value)} /></label>
      <label className="block text-sm">Template pesan<textarea rows={9} className="mt-1 w-full rounded-lg border p-3" value={template} onChange={e => onChange({ ...data, sections:{ ...data.sections, shareTemplate:e.target.value } })} /><span className="text-xs text-stone-500">Gunakan {'{nama}, {mempelai}, {tanggal}, {link}'}. Klik Simpan Perubahan untuk menyimpan template.</span></label>
    </div>
    <button type="button" disabled={busy || !names.trim()} onClick={generate} className="rounded-lg bg-amber-700 px-4 py-3 text-white disabled:opacity-50">{busy ? "Membuat…" : "Simpan tamu & buat link"}</button>
    {notice && <p role="status" className="text-sm text-amber-800">{notice}</p>}
    {!!rows.length && <><div className="flex items-center justify-between gap-3"><strong>{rows.length} tamu</strong><button type="button" disabled={rows.some(row => !row.link)} onClick={() => copy(rows.map(row => `${row.name}\t${row.link}`).join("\n"))} className="rounded border px-3 py-2 text-sm">Salin semua nama &amp; link</button></div>
    <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-stone-50"><tr><th className="p-3 text-left">Nama tamu</th><th className="p-3 text-left">Link personal</th><th className="p-3 text-left">Bagikan</th></tr></thead><tbody>{rows.map(row => <tr key={row.token} className="border-t"><td className="p-3">{row.name}{row.phone && <p className="text-xs text-stone-500">{row.phone}</p>}</td><td className="p-3 max-w-xs break-all">{row.link ? <a href={row.link} target="_blank" rel="noopener noreferrer" className="text-amber-800 underline">{row.link}</a> : <span className="text-red-700">Alamat website tidak valid</span>}</td><td className="p-3"><div className="flex flex-wrap gap-2"><button type="button" disabled={!row.link} onClick={() => copy(row.link)} className="rounded border px-3 py-2">Salin link</button><button type="button" disabled={!row.link} onClick={() => copy(row.message)} className="rounded border px-3 py-2">Salin pesan</button>{row.link && (!row.phone || row.number) && <a href={row.whatsapp} target="_blank" rel="noopener noreferrer" className="rounded bg-emerald-700 px-3 py-2 text-white">WhatsApp</a>}{row.phone && !row.number && <span className="text-xs text-red-700">Nomor tidak valid</span>}</div></td></tr>)}</tbody></table></div>
    <details className="rounded border p-3" open><summary className="cursor-pointer text-sm font-medium">Preview pesan: {rows[0].name}</summary><pre className="mt-3 whitespace-pre-wrap break-words font-sans text-sm">{rows[0].message}</pre></details></>}
  </section>;
}
