"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    setStatus("sent");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-2xl font-bold">Worship Practice</h1>
        <p className="mb-8 text-sm text-neutral-500">
          Masuk dengan email tim musik kamu. Kami kirim link login, tanpa
          password.
        </p>

        {status === "sent" ? (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            Link login sudah dikirim ke <strong>{email}</strong>. Cek inbox
            (atau folder spam) dan buka linknya di HP ini.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              required
              placeholder="nama@gereja.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-neutral-300 px-4 py-3 text-base outline-none focus:border-neutral-900"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="rounded-lg bg-neutral-900 px-4 py-3 text-base font-medium text-white disabled:opacity-50"
            >
              {status === "sending" ? "Mengirim..." : "Kirim Link Login"}
            </button>
            {status === "error" && (
              <p className="text-sm text-red-600">{errorMessage}</p>
            )}
          </form>
        )}
      </div>
    </main>
  );
}
