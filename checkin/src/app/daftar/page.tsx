"use client";
import { useActionState } from "react";
import { daftar } from "./actions";

export default function DaftarPage() {
  const [state, action, pending] = useActionState(daftar, null);
  return (
    <form action={action} className="space-y-4">
      <h1 className="text-2xl font-bold">Daftar Grow Youth 👋</h1>
      <p className="text-sm text-[#9aa5b8]">Isi sekali aja, nanti dapat QR buat check-in tiap ibadah.</p>

      <div><label className="label">Nama lengkap *</label><input name="full_name" required className="field" autoComplete="name" /></div>
      <div><label className="label">No. WhatsApp *</label><input name="phone" required inputMode="tel" placeholder="0812..." className="field" autoComplete="tel" /></div>
      <div><label className="label">Tanggal lahir *</label><input name="birth_date" type="date" required className="field" /></div>
      <div><label className="label">Sekolah / kampus</label><input name="school" className="field" /></div>
      <div><label className="label">Area tinggal</label><input name="area" className="field" /></div>
      <div>
        <label className="label">Status</label>
        <select name="status" className="field" defaultValue="baru">
          <option value="baru">Jemaat baru</option>
          <option value="lama">Jemaat lama</option>
        </select>
      </div>
      <div><label className="label">Diundang oleh</label><input name="invited_by" className="field" /></div>

      {/* Honeypot: disembunyikan dari manusia */}
      <div aria-hidden className="absolute -left-[9999px]">
        <input name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <label className="flex gap-2 text-sm">
        <input type="checkbox" name="consent" className="mt-1" />
        <span>Saya setuju data saya dipakai untuk keperluan pelayanan Grow Youth.</span>
      </label>

      {state?.error && <p className="rounded-lg bg-red-500/20 p-3 text-sm text-red-300">{state.error}</p>}
      <button disabled={pending} className="btn w-full disabled:opacity-60">{pending ? "Menyimpan..." : "Daftar"}</button>
    </form>
  );
}
