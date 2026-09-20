# Penyimpanan undangan

Aplikasi memakai SQLite bawaan Node.js. Jalankan dengan Node.js 24 LTS atau lebih baru. Tidak perlu server MongoDB atau MySQL.

Saat API pertama kali diakses, aplikasi membuat `storage/invitation.sqlite`, mengimpor `data/invitation-data.json` dan `data/gdrive-photos.json` satu kali, lalu membaca/menulis database. File JSON lama tidak diubah. Restart dan build ulang tidak mereset database.

Data tersimpan: informasi undangan, pengaturan section, pilihan foto, pustaka foto Google Drive, cerita, rekening, dan ucapan. Foto aslinya tetap di Google Drive; database menyimpan ID/URL, bukan salinan gambar. Pastikan file Drive tetap tersedia.

## Menjalankan

```sh
npm install
npm run dev
```

Buka `/admin`. Tab **Section, Foto & Cerita** mengatur foto independen untuk cover, background, slider kutipan, akad, resepsi, gift, foto utama galeri, serta foto tiap cerita. Pemilihan slideshow bisa diurutkan. Tab data mempelai mengatur kutipan, jadwal, nama dan rekening. Klik **Simpan Perubahan** setelah mengedit undangan. Import foto dan moderasi buku tamu langsung disimpan.

Ucapan baru tersimpan lewat `/api/wishes` dan dapat dibaca pengunjung lain. Ucapan lama di localStorage dipindahkan saat browser pemilik membukanya kembali; salinan lokal tetap dipertahankan.

## Deployment dan backup

SQLite memerlukan disk persisten. Pada VPS/container, arahkan `DATABASE_PATH` ke volume permanen di luar folder release, misalnya `/var/lib/undangan/invitation.sqlite`, dan beri proses Node izin menulis folder tersebut. Gunakan satu instance aplikasi pada volume lokal itu.

**Jangan menyimpan database ini di filesystem sementara Vercel/serverless**: file lokal bisa hilang saat deployment/instance berganti. Untuk hosting tersebut gunakan database eksternal (misalnya MongoDB Atlas atau layanan SQLite eksternal); adapter aplikasi ini saat ini memakai SQLite lokal.

```sh
npm run db:backup
# atau pilih lokasi backup di volume lain
npm run db:backup -- /lokasi-backup/undangan.sqlite
```

Backup memakai API SQLite sehingga aman ketika database aktif dalam mode WAL. Simpan backup di lokasi lain secara berkala. Untuk restore, hentikan aplikasi, simpan salinan database lama beserta berkas `-wal`/`-shm` jika ada, lalu gunakan file backup sebagai `DATABASE_PATH` baru. Jangan menimpa database yang sedang aktif.

Panel admin dan endpoint tulis undangan/foto/moderasi belum memiliki login, mengikuti aplikasi awal. Batasi akses `/admin`, POST `/api/invitation`, POST `/api/photos`, dan DELETE `/api/wishes` di reverse proxy sebelum dipublikasikan. GET publik dan POST ucapan perlu tetap dapat diakses tamu.

## Pemeriksaan

```sh
npm test
npm run lint
npm run build
```

Tes memakai database sementara, menguji migrasi awal, persistensi lintas proses, validasi, pengaturan section, import foto, dan simpan/hapus ucapan. Database undangan asli tidak disentuh oleh tes.
