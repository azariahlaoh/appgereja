# Worship Practice App

Mobile-first web app buat tim musik gereja ngulik lagu: upload/import lagu,
deteksi BPM & key otomatis, pisah jadi stems (vocals/drums/bass/other), lalu
latihan pakai player dengan solo/mute, loop A-B, transpose, dan speed control.

## Status: Milestone 1

Yang sudah jalan sekarang:

- Login via magic link (Supabase Auth, tanpa password)
- Songlist per user, tersimpan di database (cloud sync)
- Upload file MP3/WAV ke Supabase Storage + tersimpan di songlist
- PWA: bisa "Add to Home Screen" dari Chrome/Safari HP

Belum ada (menyusul di milestone berikutnya): import YouTube, deteksi
BPM/key, stem separation, practice player (solo/mute, loop, transpose, speed).

## Setup

1. Buat project baru di [supabase.com](https://supabase.com).
2. Buka **SQL Editor**, jalankan seluruh isi `supabase/schema.sql`. Ini bikin
   tabel `songs`, RLS policies, dan storage bucket `songs` (private).
3. Di **Authentication → URL Configuration**, tambahkan
   `http://localhost:3000/auth/callback` ke Redirect URLs (dan URL produksi
   kamu nanti).
4. Di **Authentication → Providers → Email**, magic link/OTP sudah aktif
   secara default.
5. Copy `.env.local.example` ke `.env.local`, isi dengan URL & anon key dari
   **Project Settings → API**.
6. Install dependencies & jalankan:

   ```bash
   npm install
   npm run dev
   ```

7. Buka `http://localhost:3000` di HP (satu jaringan wifi, pakai IP lokal
   komputer, misal `http://192.168.1.x:3000`) atau di browser desktop.

## Arsitektur & catatan risiko

Stack: Next.js (App Router) + Tailwind, Supabase (Auth + Postgres + Storage),
Tone.js untuk player, Demucs via API pihak ketiga (Replicate) untuk stem
separation, essentia.js/music-tempo untuk BPM & key client-side, yt-dlp di
backend untuk import YouTube. Detail keputusan lihat riwayat percakapan
project ini.

Risiko teknis yang perlu diperhatikan dari awal:

- **Replicate/Demucs cost & latency**: stem separation lewat API pihak
  ketiga bisa makan waktu puluhan detik sampai beberapa menit per lagu, dan
  ditagih per detik compute (biasanya pakai GPU). Untuk beberapa lagu/hari
  ini murah, tapi kalau dipakai ramai-ramai (banyak user, banyak upload)
  cost bisa naik cepat. Makanya hasil separation WAJIB di-cache permanen per
  lagu (kolom `stem_*_path` di tabel `songs`) — tidak pernah diproses ulang
  untuk lagu yang sama. Alur kerjanya async: submit job → polling/webhook →
  update status di database, dengan loading state yang jelas ke user karena
  prosesnya tidak instan.
- **Tone.js untuk speed-independent pitch**: Tone.js punya `Tone.PitchShift`
  bawaan, tapi kualitas time-stretch untuk perubahan speed yang cukup jauh
  (0.5x-1.5x) sambil pitch tetap natural itu non-trivial — biasanya butuh
  tuning parameter (window size, overlap) atau kombinasi dengan library lain
  (mis. SoundTouch.js) supaya tidak terdengar "robotic"/artifact terutama di
  vokal. Ini area yang paling butuh eksperimen & testing telinga langsung,
  bukan sekadar baca dokumentasi — rencanakan waktu ekstra untuk iterasi
  kualitas audio di milestone player nanti.
- **yt-dlp/YouTube extraction**: ini untuk kebutuhan practice pribadi/internal
  tim, bukan redistribusi konten — perlu disebutkan eksplisit ke user
  (sudah dicatat sebagai known limitation, bukan blocker untuk MVP internal).

## Struktur project

```
src/
  app/
    login/page.tsx           # halaman login (magic link)
    auth/callback/route.ts   # tukar OTP code jadi session
    songlist/page.tsx        # songlist + form upload (protected)
  components/
    UploadSongForm.tsx
    SongListItem.tsx
    SignOutButton.tsx
    RegisterServiceWorker.tsx
  lib/
    supabase/{client,server,middleware}.ts
    types.ts
supabase/schema.sql          # jalankan sekali di SQL editor Supabase
public/manifest.json, sw.js  # PWA
```

Data model (`songs` table) sudah didesain lengkap dengan kolom untuk BPM,
key, dan 4 path stem — supaya milestone berikutnya (detection, separation)
tinggal isi kolom yang sudah ada, tanpa migrasi ulang skema.
