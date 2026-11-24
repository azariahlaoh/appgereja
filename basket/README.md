# Basket 13 Nov — rekap + pendaftaran

Satu halaman publik (tanpa login): lihat daftar peserta, counter vs target, dan daftar langsung.
Next.js (App Router) + Tailwind + Supabase.

- Judul & target: `src/config.ts` (`EVENT_TITLE`, `TARGET`)
- Database: `supabase/migrations/` (schema + RLS), `supabase/seed.sql` (8 peserta awal)
- Env: salin `.env.example` ke `.env.local`

```bash
npm install
npm run dev
```

Deploy ke Vercel: set **Root Directory** = `basket` dan env `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
