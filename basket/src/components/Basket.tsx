"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CATEGORIES,
  CATEGORY_STYLE,
  DETAIL_FIELD,
  EVENT_TITLE,
  TARGET,
  type Category,
} from "@/config";
import { supabase, type Registration } from "@/lib/supabase";

const REFRESH_MS = 30_000;

export default function Basket() {
  const [rows, setRows] = useState<Registration[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [detail, setDetail] = useState("");
  const [honey, setHoney] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("registrations")
      .select("id,name,category,detail,created_at")
      .order("created_at", { ascending: true });
    if (error) {
      setLoadError(true);
      return;
    }
    setLoadError(false);
    setRows(data);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const t = setInterval(load, REFRESH_MS);
    return () => clearInterval(t);
  }, [load]);

  const count = rows?.length ?? 0;
  const reached = count >= TARGET;
  const pct = Math.min(100, Math.round((count / TARGET) * 100));

  const perCategory = useMemo(
    () =>
      CATEGORIES.map((c) => ({
        c,
        n: rows?.filter((r) => r.category === c).length ?? 0,
      })).filter((x) => x.n > 0),
    [rows],
  );

  const detailField = category ? DETAIL_FIELD[category] : null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const cleanName = name.trim().replace(/\s+/g, " ");
    if (cleanName.length < 2 || cleanName.length > 60) {
      setError("Nama harus 2–60 karakter.");
      return;
    }
    if (!category) {
      setError("Pilih kategori dulu.");
      return;
    }

    // Honeypot: bot mengisi field tersembunyi -> pura-pura sukses, tidak kirim apa-apa.
    if (honey) {
      setSuccess(true);
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("registrations").insert({
      name: cleanName,
      category,
      detail: detailField ? detail.trim().slice(0, 100) || null : null,
    });
    setSubmitting(false);

    if (error) {
      setError(
        error.code === "23505"
          ? "Nama ini sudah terdaftar"
          : "Gagal daftar, coba lagi sebentar ya.",
      );
      return;
    }

    setName("");
    setCategory("");
    setDetail("");
    setSuccess(true);
    await load();
  }

  const input =
    "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base outline-none placeholder:text-gray-500 focus:border-orange-400";

  return (
    <main className="mx-auto w-full max-w-md px-4 py-6">
      <h1 className="text-2xl font-bold">{EVENT_TITLE}</h1>

      {/* Counter */}
      <section className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-extrabold tabular-nums">{rows ? count : "–"}</span>
          <span className="text-xl text-gray-400">/ {TARGET} minimal</span>
        </div>
        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full transition-all ${reached ? "bg-green-500" : "bg-orange-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {rows && (
          <p className={`mt-3 text-sm ${reached ? "font-semibold text-green-400" : "text-gray-300"}`}>
            {reached
              ? `✅ Minimal ${TARGET} tercapai, jadi jalan!`
              : `Kurang ${TARGET - count} orang lagi biar jalan`}
          </p>
        )}
      </section>

      {/* Chips */}
      {perCategory.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {perCategory.map(({ c, n }) => (
            <span key={c} className={`rounded-full px-3 py-1 text-sm ring-1 ${CATEGORY_STYLE[c]}`}>
              {c}: {n}
            </span>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
        className="mt-5 w-full rounded-xl bg-orange-500 px-4 py-3 text-base font-semibold text-black active:bg-orange-600"
      >
        Daftar sekarang
      </button>

      {/* List */}
      <section className="mt-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Peserta
        </h2>
        {loadError && (
          <p className="mb-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
            Gagal memuat daftar. Akan dicoba lagi otomatis.
          </p>
        )}
        {rows === null && !loadError && <p className="text-sm text-gray-500">Memuat…</p>}
        {rows?.length === 0 && <p className="text-sm text-gray-500">Belum ada yang daftar.</p>}
        <ol className="divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10">
          {rows?.map((r, i) => (
            <li key={r.id} className="flex items-start gap-3 bg-white/[0.03] px-4 py-3">
              <span className="w-6 pt-0.5 text-right text-sm tabular-nums text-gray-500">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="break-words font-medium">{r.name}</p>
                {r.detail && <p className="break-words text-xs text-gray-400">{r.detail}</p>}
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs ring-1 ${
                  CATEGORY_STYLE[r.category as Category] ?? "bg-white/10 text-gray-300 ring-white/20"
                }`}
              >
                {r.category}
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* Form */}
      <form ref={formRef} onSubmit={onSubmit} className="mt-8 scroll-mt-4 space-y-4 pb-10" noValidate>
        <h2 className="text-lg font-semibold">Daftar</h2>

        {success && (
          <p role="status" className="rounded-xl bg-green-500/10 px-4 py-3 text-sm text-green-300">
            Berhasil daftar, ditunggu di lapangan!
          </p>
        )}
        {error && (
          <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <label className="block">
          <span className="mb-1 block text-sm text-gray-300">Nama</span>
          <input
            className={input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            autoComplete="name"
            placeholder="Nama lengkap"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-gray-300">Kategori</span>
          <select
            className={input}
            value={category}
            onChange={(e) => {
              setCategory(e.target.value as Category | "");
              setDetail("");
            }}
          >
            <option value="">Pilih kategori…</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        {detailField && (
          <label className="block">
            <span className="mb-1 block text-sm text-gray-300">{detailField.label}</span>
            <input
              className={input}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              maxLength={100}
              placeholder={`Contoh: ${detailField.placeholder}`}
            />
          </label>
        )}

        {/* Honeypot: disembunyikan dari manusia & screen reader */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Website
            <input tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} />
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-orange-500 px-4 py-3 text-base font-semibold text-black disabled:opacity-50"
        >
          {submitting ? "Mengirim…" : "Daftar"}
        </button>
      </form>
    </main>
  );
}
