"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  GDrivePhoto,
  InvitationData,
  extractDriveId,
  getDriveThumbnailUrl,
  getDriveFullUrl,
} from "@/lib/gdrive";

export default function AdminPage() {
  const [data, setData] = useState<InvitationData | null>(null);
  const [photos, setPhotos] = useState<GDrivePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [activeTab, setActiveTab] = useState<"photos" | "info">("photos");
  const [customLinkInput, setCustomLinkInput] = useState("");

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        const [resData, resPhotos] = await Promise.all([
          fetch("/api/invitation"),
          fetch("/api/photos"),
        ]);
        const jsonInv = await resData.json();
        const jsonPhotos = await resPhotos.json();
        setData(jsonInv);
        setPhotos(jsonPhotos);
      } catch (err) {
        console.error("Gagal memuat data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch("/api/invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        setSaveMessage({ text: "✅ Perubahan berhasil disimpan!", type: "success" });
      } else {
        setSaveMessage({ text: "❌ Gagal menyimpan data.", type: "error" });
      }
    } catch {
      setSaveMessage({ text: "❌ Terjadi kesalahan saat menyimpan.", type: "error" });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 4000);
    }
  };

  // Set Cover Photo
  const setCoverPhoto = (photo: GDrivePhoto) => {
    if (!data) return;
    setData({
      ...data,
      photos: {
        ...data.photos,
        cover: photo.thumbnail,
        coverId: photo.id,
      },
    });
  };

  // Set Groom Photo
  const setGroomPhoto = (photo: GDrivePhoto) => {
    if (!data) return;
    setData({
      ...data,
      couple: {
        ...data.couple,
        groom: {
          ...data.couple.groom,
          photo: photo.thumbnail,
          photoId: photo.id,
        },
      },
    });
  };

  // Set Bride Photo
  const setBridePhoto = (photo: GDrivePhoto) => {
    if (!data) return;
    setData({
      ...data,
      couple: {
        ...data.couple,
        bride: {
          ...data.couple.bride,
          photo: photo.thumbnail,
          photoId: photo.id,
        },
      },
    });
  };

  // Toggle Gallery Photo
  const toggleGalleryPhoto = (photoId: string) => {
    if (!data) return;
    const current = data.photos.gallery || [];
    let updated: string[];
    if (current.includes(photoId)) {
      updated = current.filter((id) => id !== photoId);
    } else {
      updated = [...current, photoId];
    }
    setData({
      ...data,
      photos: {
        ...data.photos,
        gallery: updated,
      },
    });
  };

  // Select all photos to gallery
  const selectAllPhotos = () => {
    if (!data) return;
    setData({
      ...data,
      photos: {
        ...data.photos,
        gallery: photos.map((p) => p.id),
      },
    });
  };

  // Deselect all photos from gallery
  const deselectAllPhotos = () => {
    if (!data) return;
    setData({
      ...data,
      photos: {
        ...data.photos,
        gallery: [],
      },
    });
  };

  // State filter foto di admin
  const [photoFilter, setPhotoFilter] = useState<"all" | "selected" | "unselected">("all");
  const [modalPreviewUrl, setModalPreviewUrl] = useState<string | null>(null);

  // Batch Import state
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchInputText, setBatchInputText] = useState("");
  const [batchImporting, setBatchImporting] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  // Script konsol browser untuk memindai otomatis sampai mentok bawah dan auto-download file
  const bookmarkletScript = `(async () => {
  console.log("🚀 Memulai pemindaian otomatis sampai ujung bawah Google Drive...");
  const scroller = document.querySelector('[role="main"]') || document.documentElement;
  let prevCount = 0;
  let sameStreak = 0;

  while (sameStreak < 4) {
    scroller.scrollTop = scroller.scrollHeight;
    await new Promise(r => setTimeout(r, 700));
    const count = document.querySelectorAll('[data-id]').length;
    console.log(\`📸 Sedang memuat... saat ini terdeteksi: \${count} item\`);
    if (count === prevCount) {
      sameStreak++;
    } else {
      sameStreak = 0;
      prevCount = count;
    }
  }

  const items = Array.from(document.querySelectorAll('[data-id]'))
    .map(el => ({
      id: el.getAttribute('data-id'),
      name: el.querySelector('strong')?.innerText || el.getAttribute('aria-label') || ''
    }))
    .filter(x => x.id && x.id.length > 20 && x.name);

  const unique = Array.from(new Map(items.map(m => [m.id, m])).values());
  console.log(\`🎉 Selesai! Total \${unique.length} foto ditemukan.\`);

  // Download file JSON otomatis
  const blob = new Blob([JSON.stringify(unique, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "gdrive-photos.json";
  document.body.appendChild(a);
  a.click();
  a.remove();

  alert(\`Sukses! \${unique.length} foto berhasil ditemukan.\\nFile "gdrive-photos.json" otomatis terdownload ke folder Downloads Anda!\\n\\nSilakan upload file ini di Admin.\`);
})();`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(bookmarkletScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 3000);
  };

  const handleBatchImport = async () => {
    if (!batchInputText.trim()) return;
    setBatchImporting(true);
    try {
      let parsedPhotos: { id: string; name?: string }[] = [];
      const trimmed = batchInputText.trim();
      if (trimmed.startsWith("[")) {
        parsedPhotos = JSON.parse(trimmed);
      } else {
        const tokens = trimmed.split(/[\n,;\s]+/);
        const seen = new Set<string>();
        for (const token of tokens) {
          const id = extractDriveId(token);
          if (id && !seen.has(id)) {
            seen.add(id);
            parsedPhotos.push({ id });
          }
        }
      }

      if (parsedPhotos.length === 0) {
        alert("Tidak ada ID atau URL Google Drive yang valid ditemukan!");
        setBatchImporting(false);
        return;
      }

      const res = await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photos: parsedPhotos }),
      });
      const result = await res.json();
      if (result.success) {
        setPhotos(result.photos);
        alert(`Berhasil! Total ${result.photos.length} foto sekarang siap dipilih di galeri.`);
        setShowBatchModal(false);
        setBatchInputText("");
      } else {
        alert("Gagal mengimpor: " + result.message);
      }
    } catch (err) {
      alert("Format teks tidak valid: " + String(err));
    } finally {
      setBatchImporting(false);
    }
  };

  const [visibleLimit, setVisibleLimit] = useState(60);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          alert("File JSON tidak berisi daftar foto.");
          return;
        }
        setBatchImporting(true);
        const res = await fetch("/api/photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photos: parsed }),
        });
        const result = await res.json();
        if (result.success) {
          setPhotos(result.photos);
          alert(`Sukses! ${result.photos.length} foto berhasil dimuat ke galeri admin!`);
          setShowBatchModal(false);
        } else {
          alert("Gagal: " + result.message);
        }
      } catch (err) {
        alert("Gagal membaca file JSON: " + String(err));
      } finally {
        setBatchImporting(false);
      }
    };
    reader.readAsText(file);
  };

  // Add custom photo link from outside
  const handleAddCustomPhoto = () => {
    const id = extractDriveId(customLinkInput);
    if (!id) {
      alert("Format link atau ID Google Drive tidak valid!");
      return;
    }
    const newPhoto: GDrivePhoto = {
      id,
      name: `Custom-${id.slice(0, 6)}`,
      thumbnail: getDriveThumbnailUrl(id),
      full: getDriveFullUrl(id),
    };
    if (!photos.some((p) => p.id === id)) {
      setPhotos([newPhoto, ...photos]);
    }
    setCustomLinkInput("");
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100 text-stone-600">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-600 border-t-transparent mb-3"></div>
          <p className="font-medium">Memuat data admin...</p>
        </div>
      </div>
    );
  }

  const galleryList = data.photos.gallery || [];

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800 pb-20">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200 px-4 py-3 shadow-xs">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
              Admin Panel
            </span>
            <h1 className="font-bold text-lg text-stone-900">Undangan Digital</h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="px-3.5 py-1.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 text-sm font-medium transition"
            >
              👁️ Lihat Undangan
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "💾 Simpan Perubahan"}
            </button>
          </div>
        </div>
      </header>

      {/* Floating Save Alert */}
      {saveMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
            saveMessage.type === "success"
              ? "bg-emerald-800 text-emerald-100"
              : "bg-red-800 text-red-100"
          }`}
        >
          {saveMessage.text}
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 pt-6">
        {/* Tab Switcher */}
        <div className="flex border-b border-stone-200 mb-6">
          <button
            onClick={() => setActiveTab("photos")}
            className={`py-2.5 px-5 font-semibold text-sm border-b-2 transition ${
              activeTab === "photos"
                ? "border-amber-600 text-amber-700 bg-amber-50/50"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            📸 Master Foto GDrive ({photos.length} Foto)
          </button>
          <button
            onClick={() => setActiveTab("info")}
            className={`py-2.5 px-5 font-semibold text-sm border-b-2 transition ${
              activeTab === "info"
                ? "border-amber-600 text-amber-700 bg-amber-50/50"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            📝 Data Mempelai & Acara
          </button>
        </div>

        {/* TAB 1: MASTER FOTO GDRIVE */}
        {activeTab === "photos" && (
          <div className="space-y-6">
            {/* Status Foto Terpilih Saat Ini */}
            <section className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
              <h2 className="font-bold text-stone-800 text-base mb-3 flex items-center gap-2">
                <span>🎯</span> Foto Aktif di Undangan
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Cover */}
                <div className="border border-stone-200 rounded-lg p-3 bg-stone-50 flex items-center gap-3">
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-stone-200 shrink-0 border">
                    {data.photos.cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={data.photos.cover}
                        alt="Cover"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">
                        Kosong
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                      Cover Utama
                    </span>
                    <p className="text-xs text-stone-500 truncate mt-1">
                      ID: {data.photos.coverId || "Belum dipilih"}
                    </p>
                  </div>
                </div>

                {/* Groom */}
                <div className="border border-stone-200 rounded-lg p-3 bg-stone-50 flex items-center gap-3">
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-stone-200 shrink-0 border">
                    {data.couple.groom.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={data.couple.groom.photo}
                        alt="Pria"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">
                        Kosong
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                      Mempelai Pria
                    </span>
                    <p className="text-xs text-stone-500 truncate mt-1">
                      {data.couple.groom.shortName}
                    </p>
                  </div>
                </div>

                {/* Bride */}
                <div className="border border-stone-200 rounded-lg p-3 bg-stone-50 flex items-center gap-3">
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-stone-200 shrink-0 border">
                    {data.couple.bride.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={data.couple.bride.photo}
                        alt="Wanita"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">
                        Kosong
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                      Mempelai Wanita
                    </span>
                    <p className="text-xs text-stone-500 truncate mt-1">
                      {data.couple.bride.shortName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Info & Kontrol Cepat Galeri */}
              <div className="mt-4 pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-stone-800">
                    🖼️ {galleryList.length} dari {photos.length} Foto Terpilih untuk Undangan
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBatchModal(true)}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1"
                  >
                    📥 Ambil Sisa Foto dari GDrive
                  </button>
                  <button
                    type="button"
                    onClick={selectAllPhotos}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1"
                  >
                    ✓ Pilih Semua ({photos.length} Foto)
                  </button>
                  <button
                    type="button"
                    onClick={deselectAllPhotos}
                    className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg text-xs font-semibold transition"
                  >
                    ✕ Hapus Semua
                  </button>
                </div>
              </div>
            </section>

            {/* Input Tambah Link Google Drive Manual */}
            <section className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="grow">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Punya Foto Lain di Google Drive? Tempelkan link file atau ID-nya di sini:
                </label>
                <input
                  type="text"
                  placeholder="https://drive.google.com/file/d/1abc.../view?usp=sharing"
                  value={customLinkInput}
                  onChange={(e) => setCustomLinkInput(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50"
                />
              </div>
              <button
                type="button"
                onClick={handleAddCustomPhoto}
                className="self-end sm:self-auto mt-2 sm:mt-5 px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold rounded-md transition"
              >
                + Tambah ke Master
              </button>
            </section>

            {/* Master Photo Grid dengan Filter & Klik Seleksi Langsung */}
            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-stone-200 shadow-xs">
                <div>
                  <h3 className="font-bold text-stone-800 text-sm">
                    Koleksi Foto Google Drive ({photos.length} Foto)
                  </h3>
                  <p className="text-xs text-stone-500">
                    💡 <strong>Tips:</strong> Klik langsung pada gambar foto untuk memilih / membatalkan foto untuk galeri undangan.
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-lg text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setPhotoFilter("all")}
                    className={`px-3 py-1 rounded-md transition ${
                      photoFilter === "all"
                        ? "bg-white text-stone-900 shadow-xs font-semibold"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    Semua ({photos.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoFilter("selected")}
                    className={`px-3 py-1 rounded-md transition ${
                      photoFilter === "selected"
                        ? "bg-emerald-600 text-white shadow-xs font-semibold"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    ✓ Terpilih ({galleryList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoFilter("unselected")}
                    className={`px-3 py-1 rounded-md transition ${
                      photoFilter === "unselected"
                        ? "bg-amber-600 text-white shadow-xs font-semibold"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    Belum ({photos.length - galleryList.length})
                  </button>
                </div>
              </div>

              {/* Grid Foto dengan Pagination Lembut */}
              {(() => {
                const filteredPhotos = photos.filter((photo) => {
                  if (photoFilter === "selected") return galleryList.includes(photo.id);
                  if (photoFilter === "unselected") return !galleryList.includes(photo.id);
                  return true;
                });

                return (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                      {filteredPhotos.slice(0, visibleLimit).map((photo) => {
                        const isCover = data.photos.coverId === photo.id;
                        const isGroom = data.couple.groom.photoId === photo.id;
                        const isBride = data.couple.bride.photoId === photo.id;
                        const inGallery = galleryList.includes(photo.id);

                        return (
                          <div
                            key={photo.id}
                            className={`bg-white rounded-xl border overflow-hidden shadow-xs flex flex-col transition relative ${
                              inGallery
                                ? "border-emerald-500 ring-2 ring-emerald-300"
                                : isCover || isGroom || isBride
                                ? "border-amber-500 ring-2 ring-amber-200"
                                : "border-stone-200 hover:border-stone-300"
                            }`}
                          >
                            {/* Image Thumbnail with Direct Click-to-Select */}
                            <div
                              onClick={() => toggleGalleryPhoto(photo.id)}
                              className="relative aspect-4/5 bg-stone-100 overflow-hidden cursor-pointer group select-none"
                              title="Klik gambar untuk memilih / membatalkan dari galeri"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={photo.thumbnail}
                                alt={photo.name}
                                className={`w-full h-full object-cover transition duration-300 ${
                                  inGallery ? "brightness-100" : "group-hover:scale-105 opacity-90 group-hover:opacity-100"
                                }`}
                                loading="lazy"
                              />

                              {/* Selection Checkbox Circle (Top Right) */}
                              <div className="absolute top-2 right-2 z-20">
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md transition ${
                                    inGallery
                                      ? "bg-emerald-600 text-white ring-2 ring-white"
                                      : "bg-black/40 text-white/70 hover:bg-black/60"
                                  }`}
                                >
                                  {inGallery ? "✓" : "+"}
                                </div>
                              </div>

                              {/* Role Badges (Top Left) */}
                              <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                                {isCover && (
                                  <span className="bg-amber-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                    👑 COVER
                                  </span>
                                )}
                                {isGroom && (
                                  <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                    🤵 PRIA
                                  </span>
                                )}
                                {isBride && (
                                  <span className="bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                    👰 WANITA
                                  </span>
                                )}
                              </div>

                              {/* Overlay Hint on Hover */}
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center pointer-events-none">
                                <span className="text-white text-[11px] font-semibold bg-black/60 px-2.5 py-1 rounded-full">
                                  {inGallery ? "✓ Terpilih di Galeri" : "+ Klik untuk Memilih"}
                                </span>
                              </div>

                              {/* File Name Tag */}
                              <div className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-xs text-white text-[9px] px-1.5 py-0.5 rounded pointer-events-none">
                                {photo.name}
                              </div>
                            </div>

                            {/* Action Buttons for this Photo */}
                            <div className="p-2 space-y-1.5 text-[11px] bg-white mt-auto border-t border-stone-100">
                              <div className="grid grid-cols-3 gap-1">
                                <button
                                  type="button"
                                  onClick={() => setCoverPhoto(photo)}
                                  title="Jadikan Foto Cover Utama"
                                  className={`py-1 rounded text-center font-medium transition ${
                                    isCover
                                      ? "bg-amber-600 text-white font-bold"
                                      : "bg-stone-100 hover:bg-amber-100 text-stone-700"
                                  }`}
                                >
                                  Cover
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setGroomPhoto(photo)}
                                  title="Jadikan Foto Pengantin Pria"
                                  className={`py-1 rounded text-center font-medium transition ${
                                    isGroom
                                      ? "bg-blue-600 text-white font-bold"
                                      : "bg-stone-100 hover:bg-blue-100 text-stone-700"
                                  }`}
                                >
                                  Pria
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setBridePhoto(photo)}
                                  title="Jadikan Foto Pengantin Wanita"
                                  className={`py-1 rounded text-center font-medium transition ${
                                    isBride
                                      ? "bg-rose-600 text-white font-bold"
                                      : "bg-stone-100 hover:bg-rose-100 text-stone-700"
                                  }`}
                                >
                                  Wanita
                                </button>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => toggleGalleryPhoto(photo.id)}
                                  className={`grow py-1 rounded text-center font-semibold transition ${
                                    inGallery
                                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                      : "bg-stone-100 text-stone-700 hover:bg-emerald-50"
                                  }`}
                                >
                                  {inGallery ? "✓ Ada di Galeri" : "+ Pilih Galeri"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setModalPreviewUrl(photo.full)}
                                  title="Perbesar Foto"
                                  className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded text-center transition"
                                >
                                  🔍
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {filteredPhotos.length > visibleLimit && (
                      <div className="text-center pt-6 pb-2">
                        <button
                          type="button"
                          onClick={() => setVisibleLimit((prev) => prev + 60)}
                          className="px-6 py-3 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold shadow-md transition"
                        >
                          ⬇️ Tampilkan 60 Foto Berikutnya (Sisa {filteredPhotos.length - visibleLimit} foto lagi)
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </section>

            {/* Modal Lightbox Preview di Admin */}
            {modalPreviewUrl && (
              <div
                className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => setModalPreviewUrl(null)}
              >
                <div className="relative max-w-3xl w-full max-h-[90vh] flex flex-col items-center">
                  <button
                    onClick={() => setModalPreviewUrl(null)}
                    className="absolute -top-10 right-0 text-white text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition"
                  >
                    ✕ Tutup
                  </button>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={modalPreviewUrl}
                    alt="Preview foto besar"
                    className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
                  />
                </div>
              </div>
            )}

            {/* Modal Batch Import Seluruh Foto GDrive */}
            {showBatchModal && (
              <div
                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
                onClick={() => setShowBatchModal(false)}
              >
                <div
                  className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl relative space-y-4 border border-stone-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <h3 className="font-bold text-base text-stone-900">
                        📥 Ambil Seluruh Foto dari Google Drive
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Ambil semua foto di folder tanpa batas 50 foto Google Drive
                      </p>
                    </div>
                    <button
                      onClick={() => setShowBatchModal(false)}
                      className="text-stone-400 hover:text-stone-700 text-lg font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-stone-700 space-y-2">
                    <p className="font-semibold text-amber-900">
                      ⚡ Cara Cepat 5 Detik Ambil Semua Foto di Folder GDrive:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-stone-600">
                      <li>
                        Buka folder Google Drive Anda di browser (
                        <a
                          href="https://drive.google.com/drive/folders/1p9JPorfFJjM1hzWv4CqHKuHmHeeGVkL3?usp=sharing"
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-700 underline font-medium"
                        >
                          Klik Buka Folder GDrive
                        </a>
                        )
                      </li>
                      <li>
                        Tekan <kbd className="bg-white px-1.5 py-0.5 border rounded font-mono">F12</kbd> (atau <kbd className="bg-white px-1.5 py-0.5 border rounded font-mono">Cmd + Option + J</kbd> di Mac) lalu pilih tab <strong>Console</strong>.
                      </li>
                      <li>
                        Salin script di bawah ini, tempelkan ke Console lalu tekan <strong>Enter</strong>:
                      </li>
                    </ol>

                    <button
                      type="button"
                      onClick={handleCopyScript}
                      className={`mt-1 w-full py-2 rounded-lg text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5 ${
                        copiedScript
                          ? "bg-emerald-700 text-white"
                          : "bg-amber-600 hover:bg-amber-700 text-white"
                      }`}
                    >
                      {copiedScript ? "✓ Script Berhasil Disalin!" : "📋 Klik untuk Salin Script Pemindai"}
                    </button>
                  </div>

                  {/* Opsi 1: Upload File JSON */}
                  <div className="p-3 bg-stone-50 border border-dashed border-stone-300 rounded-xl text-center space-y-1.5">
                    <p className="text-xs font-semibold text-stone-800">
                      📁 Opsi 1: Upload File &quot;gdrive-photos.json&quot;
                    </p>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="block w-full text-xs text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-stone-800 file:text-white hover:file:bg-black cursor-pointer"
                    />
                  </div>

                  <div className="relative flex items-center justify-center my-1">
                    <div className="border-t border-stone-200 w-full" />
                    <span className="bg-white px-3 text-[11px] text-stone-400 font-medium uppercase">
                      Atau Opsi 2: Tempel Teks
                    </span>
                    <div className="border-t border-stone-200 w-full" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Tempelkan Hasil Salinan (JSON atau kumpulan link / ID file) di sini:
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Paste hasil salinan dari Google Drive di sini..."
                      value={batchInputText}
                      onChange={(e) => setBatchInputText(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono bg-stone-50"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t">
                    <button
                      type="button"
                      onClick={() => setShowBatchModal(false)}
                      className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 text-xs font-medium hover:bg-stone-50"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      disabled={batchImporting || !batchInputText.trim()}
                      onClick={handleBatchImport}
                      className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition disabled:opacity-50"
                    >
                      {batchImporting ? "Memproses..." : "✓ Tambahkan Semua Foto"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INFORMASI MEMPELAI & ACARA */}
        {activeTab === "info" && (
          <div className="space-y-6">
            {/* Mempelai */}
            <section className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
              <h2 className="font-bold text-stone-900 text-base mb-4 flex items-center gap-2">
                <span>💑</span> Data Mempelai
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mempelai Wanita */}
                <div className="space-y-3 p-4 bg-rose-50/40 rounded-lg border border-rose-100">
                  <h3 className="font-semibold text-rose-900 text-sm">Mempelai Wanita (Bride)</h3>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Nama Panggilan</label>
                    <input
                      type="text"
                      value={data.couple.bride.shortName}
                      onChange={(e) =>
                        setData({
                          ...data,
                          couple: {
                            ...data.couple,
                            bride: { ...data.couple.bride, shortName: e.target.value },
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-md bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Nama Lengkap & Gelar</label>
                    <input
                      type="text"
                      value={data.couple.bride.fullName}
                      onChange={(e) =>
                        setData({
                          ...data,
                          couple: {
                            ...data.couple,
                            bride: { ...data.couple.bride, fullName: e.target.value },
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-md bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1">Nama Ayah</label>
                      <input
                        type="text"
                        value={data.couple.bride.fatherName}
                        onChange={(e) =>
                          setData({
                            ...data,
                            couple: {
                              ...data.couple,
                              bride: { ...data.couple.bride, fatherName: e.target.value },
                            },
                          })
                        }
                        className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-md bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1">Nama Ibu</label>
                      <input
                        type="text"
                        value={data.couple.bride.motherName}
                        onChange={(e) =>
                          setData({
                            ...data,
                            couple: {
                              ...data.couple,
                              bride: { ...data.couple.bride, motherName: e.target.value },
                            },
                          })
                        }
                        className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-md bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Instagram</label>
                    <input
                      type="text"
                      value={data.couple.bride.instagram}
                      onChange={(e) =>
                        setData({
                          ...data,
                          couple: {
                            ...data.couple,
                            bride: { ...data.couple.bride, instagram: e.target.value },
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-md bg-white"
                    />
                  </div>
                </div>

                {/* Mempelai Pria */}
                <div className="space-y-3 p-4 bg-blue-50/40 rounded-lg border border-blue-100">
                  <h3 className="font-semibold text-blue-900 text-sm">Mempelai Pria (Groom)</h3>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Nama Panggilan</label>
                    <input
                      type="text"
                      value={data.couple.groom.shortName}
                      onChange={(e) =>
                        setData({
                          ...data,
                          couple: {
                            ...data.couple,
                            groom: { ...data.couple.groom, shortName: e.target.value },
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-md bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Nama Lengkap & Gelar</label>
                    <input
                      type="text"
                      value={data.couple.groom.fullName}
                      onChange={(e) =>
                        setData({
                          ...data,
                          couple: {
                            ...data.couple,
                            groom: { ...data.couple.groom, fullName: e.target.value },
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-md bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1">Nama Ayah</label>
                      <input
                        type="text"
                        value={data.couple.groom.fatherName}
                        onChange={(e) =>
                          setData({
                            ...data,
                            couple: {
                              ...data.couple,
                              groom: { ...data.couple.groom, fatherName: e.target.value },
                            },
                          })
                        }
                        className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-md bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1">Nama Ibu</label>
                      <input
                        type="text"
                        value={data.couple.groom.motherName}
                        onChange={(e) =>
                          setData({
                            ...data,
                            couple: {
                              ...data.couple,
                              groom: { ...data.couple.groom, motherName: e.target.value },
                            },
                          })
                        }
                        className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-md bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Instagram</label>
                    <input
                      type="text"
                      value={data.couple.groom.instagram}
                      onChange={(e) =>
                        setData({
                          ...data,
                          couple: {
                            ...data.couple,
                            groom: { ...data.couple.groom, instagram: e.target.value },
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-md bg-white"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Jadwal Acara */}
            <section className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
              <h2 className="font-bold text-stone-900 text-base mb-4 flex items-center gap-2">
                <span>🗓️</span> Jadwal & Tempat Acara
              </h2>

              <div className="mb-4">
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Target Waktu Hitung Mundur (ISO Date Format: YYYY-MM-DDTHH:MM:SS)
                </label>
                <input
                  type="text"
                  value={data.events.targetDate}
                  onChange={(e) =>
                    setData({
                      ...data,
                      events: { ...data.events, targetDate: e.target.value },
                    })
                  }
                  className="w-full max-w-sm px-3 py-1.5 text-sm border border-stone-300 rounded-md bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Akad */}
                <div className="space-y-3 p-4 bg-stone-50 rounded-lg border border-stone-200">
                  <h3 className="font-semibold text-stone-800 text-sm">Akad Nikah</h3>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Hari & Tanggal</label>
                    <input
                      type="text"
                      value={data.events.akad.date}
                      onChange={(e) =>
                        setData({
                          ...data,
                          events: {
                            ...data.events,
                            akad: { ...data.events.akad, date: e.target.value },
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-md bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Waktu</label>
                    <input
                      type="text"
                      value={data.events.akad.time}
                      onChange={(e) =>
                        setData({
                          ...data,
                          events: {
                            ...data.events,
                            akad: { ...data.events.akad, time: e.target.value },
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-md bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Nama Tempat / Masjid</label>
                    <input
                      type="text"
                      value={data.events.akad.venue}
                      onChange={(e) =>
                        setData({
                          ...data,
                          events: {
                            ...data.events,
                            akad: { ...data.events.akad, venue: e.target.value },
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-md bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Alamat Lengkap</label>
                    <textarea
                      rows={2}
                      value={data.events.akad.address}
                      onChange={(e) =>
                        setData({
                          ...data,
                          events: {
                            ...data.events,
                            akad: { ...data.events.akad, address: e.target.value },
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-md bg-white"
                    />
                  </div>
                </div>

                {/* Resepsi */}
                <div className="space-y-3 p-4 bg-stone-50 rounded-lg border border-stone-200">
                  <h3 className="font-semibold text-stone-800 text-sm">Resepsi Pernikahan</h3>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Hari & Tanggal</label>
                    <input
                      type="text"
                      value={data.events.resepsi.date}
                      onChange={(e) =>
                        setData({
                          ...data,
                          events: {
                            ...data.events,
                            resepsi: { ...data.events.resepsi, date: e.target.value },
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-md bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Waktu</label>
                    <input
                      type="text"
                      value={data.events.resepsi.time}
                      onChange={(e) =>
                        setData({
                          ...data,
                          events: {
                            ...data.events,
                            resepsi: { ...data.events.resepsi, time: e.target.value },
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-md bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Nama Gedung / Tempat</label>
                    <input
                      type="text"
                      value={data.events.resepsi.venue}
                      onChange={(e) =>
                        setData({
                          ...data,
                          events: {
                            ...data.events,
                            resepsi: { ...data.events.resepsi, venue: e.target.value },
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-md bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Alamat Lengkap</label>
                    <textarea
                      rows={2}
                      value={data.events.resepsi.address}
                      onChange={(e) =>
                        setData({
                          ...data,
                          events: {
                            ...data.events,
                            resepsi: { ...data.events.resepsi, address: e.target.value },
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-md bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Link Google Maps (untuk tombol penunjuk arah di undangan)
                </label>
                <input
                  type="text"
                  value={data.events.resepsi.mapsUrl}
                  onChange={(e) =>
                    setData({
                      ...data,
                      events: {
                        ...data.events,
                        akad: { ...data.events.akad, mapsUrl: e.target.value },
                        resepsi: { ...data.events.resepsi, mapsUrl: e.target.value },
                      },
                    })
                  }
                  className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-md bg-white"
                />
              </div>
            </section>

            {/* Kutipan & Pesan */}
            <section className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-3">
              <h2 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <span>📖</span> Kutipan / Ayat
              </h2>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Isi Kutipan</label>
                <textarea
                  rows={3}
                  value={data.couple.quote}
                  onChange={(e) =>
                    setData({
                      ...data,
                      couple: { ...data.couple, quote: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-md bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Sumber Kutipan</label>
                  <input
                    type="text"
                    value={data.couple.quoteSource}
                    onChange={(e) =>
                      setData({
                        ...data,
                        couple: { ...data.couple, quoteSource: e.target.value },
                      })
                    }
                    className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-md bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Hashtag Acara</label>
                  <input
                    type="text"
                    value={data.couple.hashtag}
                    onChange={(e) =>
                      setData({
                        ...data,
                        couple: { ...data.couple, hashtag: e.target.value },
                      })
                    }
                    className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-md bg-white"
                  />
                </div>
              </div>
            </section>

            {/* Rekening Hadiah */}
            <section className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-3">
              <h2 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <span>🎁</span> Rekening Hadiah / Amplop Digital
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.gifts?.map((gift, idx) => (
                  <div key={idx} className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1">Nama Bank / Dompet Digital</label>
                      <input
                        type="text"
                        value={gift.bank}
                        onChange={(e) => {
                          const newGifts = [...(data.gifts || [])];
                          newGifts[idx].bank = e.target.value;
                          setData({ ...data, gifts: newGifts });
                        }}
                        className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-md bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1">Nomor Rekening</label>
                      <input
                        type="text"
                        value={gift.number}
                        onChange={(e) => {
                          const newGifts = [...(data.gifts || [])];
                          newGifts[idx].number = e.target.value;
                          setData({ ...data, gifts: newGifts });
                        }}
                        className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-md bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1">Atas Nama (Holder)</label>
                      <input
                        type="text"
                        value={gift.holder}
                        onChange={(e) => {
                          const newGifts = [...(data.gifts || [])];
                          newGifts[idx].holder = e.target.value;
                          setData({ ...data, gifts: newGifts });
                        }}
                        className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-md bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
