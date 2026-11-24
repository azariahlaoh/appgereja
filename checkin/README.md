# Grow Youth Check-in

MVP check-in ibadah: daftar → dapat QR → di-scan staff. 100% gratis (Vercel Hobby + Supabase Free).

## Setup

1. Buat project di [supabase.com](https://supabase.com) (Free).
2. **SQL Editor** → paste seluruh isi `supabase/schema.sql` → Run.
3. `cp .env.example .env.local`, isi:
   - `SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API; **service role = rahasia**, jangan dipublish)
   - `STAFF_PIN` (PIN untuk `/scan` & `/admin`)
   - `NEXT_PUBLIC_SITE_URL` (URL situs)
4. `npm install && npm run dev` → buka http://localhost:3000
5. (opsional) `npm run seed` untuk 3 data tes.
6. Deploy: push ke GitHub → import di Vercel (**Root Directory: `checkin`**) → isi env vars yang sama.

## Halaman

| URL | Fungsi |
|---|---|
| `/daftar` | Daftar jemaat → redirect ke `/m/[token]` |
| `/m/[token]` | QR pribadi + pengumuman |
| `/guest` | Tamu, langsung tercatat hadir |
| `/scan` | Staff (PIN): scanner USB/kamera |
| `/pengumuman` | Daftar publik |
| `/admin` | Staff (PIN): pengumuman + rekap |

## Catatan keputusan

- Semua akses DB lewat server dengan service role; RLS aktif tanpa policy (anon key tidak bisa apa-apa).
- Cookie staff: httpOnly, ditandatangani HMAC, berlaku 12 jam. Belum ada pembatasan percobaan PIN (pakai PIN yang tidak mudah ditebak).
- Daftar dengan WA yang sudah jadi **member** ditolak (tidak membocorkan QR). Kalau WA-nya guest, record di-upgrade jadi member.
- Guest tanpa WA selalu jadi record baru; guest dengan WA yang sudah ada dipakai ulang.
- Tanggal ibadah = tanggal Asia/Jakarta.

## Checklist tes 5 menit

1. `/daftar` isi form → muncul QR di `/m/...`; refresh `/` → langsung ke QR.
2. Daftar lagi dengan WA sama → ditolak.
3. `/scan` masuk PIN → ketik `GY:<token>` + Enter → HIJAU + beep, counter +1.
4. Ulangi kode yang sama → KUNING "sudah check-in jam ...".
5. Ketik `GY:ngawur` → MERAH. Layar balik siap scan ±2 detik.
6. "Tambah guest" (nama) → counter +1; `/guest` form publik juga tercatat.
7. `/admin` → buat pengumuman pinned → tampil di `/pengumuman` & `/m/...`; rekap hari ini cocok.
8. Kamera: buka `/m/<token>` di HP A, scan dari `/scan` di HP B ("Pakai kamera").
