"use client";
import { useActionState } from "react";
import { loginStaff } from "@/app/scan/actions";

export default function StaffLogin() {
  const [state, action, pending] = useActionState(loginStaff, null);
  return (
    <form action={action} className="space-y-4">
      <h1 className="text-2xl font-bold">Khusus staff 🔒</h1>
      <input name="pin" type="password" inputMode="numeric" autoComplete="off" placeholder="PIN staff" className="field" required />
      {state?.error && <p className="rounded-lg bg-red-500/20 p-3 text-sm text-red-300">{state.error}</p>}
      <button disabled={pending} className="btn w-full">{pending ? "..." : "Masuk"}</button>
    </form>
  );
}
