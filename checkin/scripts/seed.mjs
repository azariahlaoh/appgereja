// Seed 3 data tes: npm run seed  (butuh .env.local)
import { createClient } from "@supabase/supabase-js";
const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const rows = [
  { token: "tes-token-budi-0000001", type: "member", full_name: "Budi Tes", phone: "6281200000001", birth_date: "2008-05-01", is_new: false, consent_at: new Date().toISOString() },
  { token: "tes-token-sari-0000002", type: "member", full_name: "Sari Tes", phone: "6281200000002", birth_date: "2009-08-17", is_new: true, consent_at: new Date().toISOString() },
  { token: "tes-token-guest-000003", type: "guest", full_name: "Guest Tes", invited_by: "Budi" },
];
const { error } = await db.from("members").upsert(rows, { onConflict: "token" });
if (error) { console.error(error.message); process.exit(1); }
await db.from("announcements").insert({ title: "Selamat datang!", body: "Ibadah Grow Youth tiap Sabtu.", pinned: true, published: true });
console.log("Seed OK. Coba scan: GY:" + rows.map((r) => r.token).join("  GY:"));
