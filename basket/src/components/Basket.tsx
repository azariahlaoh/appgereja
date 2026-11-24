"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CATEGORIES, CATEGORY_STYLE, EVENT_TITLE, FORM_URL, TARGET } from "@/config";
import type { Peserta } from "@/lib/sheet";

const REFRESH_MS = 30_000;

export default function Basket() {
  const [rows, setRows] = useState<Peserta[] | null>(null);
  const [loadError, setLoadError] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/peserta");
      if (!res.ok) throw new Error();
      setRows(await res.json());
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
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

      <a
        href={FORM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 block w-full rounded-xl bg-orange-500 px-4 py-3 text-center text-base font-semibold text-black active:bg-orange-600"
      >
        Daftar sekarang
      </a>

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
                  CATEGORY_STYLE[r.category] ?? "bg-white/10 text-gray-300 ring-white/20"
                }`}
              >
                {r.category}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-6 pb-10 text-center text-sm text-gray-400">
        Belum daftar?{" "}
        <a href={FORM_URL} target="_blank" rel="noopener noreferrer" className="text-orange-400 underline">
          Isi form pendaftaran
        </a>
        . Daftar di sini otomatis ter-update setelah form dikirim.
      </p>
    </main>
  );
}
