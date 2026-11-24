"use client";
import { useActionState } from "react";
import { guestPublic } from "./actions";

export default function GuestPage() {
  const [state, action, pending] = useActionState(guestPublic, null);
  if (state?.ok) return <p className="rounded-xl bg-green-600/20 p-4 text-center text-lg">{state.ok}</p>;
  return (
    <form action={action} className="space-y-4">
      <h1 className="text-2xl font-bold">Selamat datang, tamu! 🙌</h1>
      <div><label className="label">Nama *</label><input name="full_name" required className="field" /></div>
      <div><label className="label">No. WhatsApp (opsional)</label><input name="phone" inputMode="tel" className="field" /></div>
      <div><label className="label">Diundang oleh</label><input name="invited_by" className="field" /></div>
      <div aria-hidden className="absolute -left-[9999px]"><input name="website" tabIndex={-1} autoComplete="off" /></div>
      {state?.error && <p className="rounded-lg bg-red-500/20 p-3 text-sm text-red-300">{state.error}</p>}
      <button disabled={pending} className="btn w-full">{pending ? "..." : "Catat kehadiran"}</button>
    </form>
  );
}
