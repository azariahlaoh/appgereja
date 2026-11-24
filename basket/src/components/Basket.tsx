"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CATEGORIES, EVENT_TITLE, FORM_URL, TARGET } from "@/config";
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

  const count = rows?.length ?? null;
  const reached = (count ?? 0) >= TARGET;
  const pct = Math.min(100, ((count ?? 0) / TARGET) * 100);

  const summary = useMemo(
    () =>
      CATEGORIES.map((c) => [c, rows?.filter((r) => r.category === c).length ?? 0] as const)
        .filter(([, n]) => n > 0)
        .map(([c, n]) => `${c} ${n}`)
        .join(" · "),
    [rows],
  );

  return (
    <main className="mx-auto w-full max-w-md px-6 pb-16 pt-10">
      <h1 className="text-3xl font-semibold tracking-tight">{EVENT_TITLE}</h1>

      <section className="mt-10">
        <p className="flex items-baseline gap-2">
          <span className="text-7xl font-semibold tabular-nums tracking-tight">{count ?? "–"}</span>
          <span className="text-lg text-neutral-500">/ {TARGET} minimal</span>
        </p>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-lime transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        {count !== null && (
          <p className={`mt-3 text-[15px] ${reached ? "font-medium text-lime" : "text-neutral-400"}`}>
            {reached ? `✅ Minimal ${TARGET} tercapai, jadi jalan!` : `Kurang ${TARGET - count} orang lagi biar jalan`}
          </p>
        )}
        {summary && <p className="mt-1 text-sm text-neutral-500">{summary}</p>}
      </section>

      <a
        href={FORM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 block rounded-xl bg-lime py-3.5 text-center text-[17px] font-semibold text-black active:opacity-70"
      >
        Daftar sekarang
      </a>

      <section className="mt-12">
        {loadError && <p className="mb-3 text-sm text-red-400">Gagal memuat daftar. Dicoba lagi otomatis.</p>}
        {rows === null && !loadError && <p className="text-sm text-neutral-500">Memuat…</p>}
        {rows?.length === 0 && <p className="text-sm text-neutral-500">Belum ada yang daftar.</p>}
        <ol className="divide-y divide-white/10 border-y border-white/10">
          {rows?.map((r, i) => (
            <li key={r.id} className="flex items-baseline gap-4 py-3.5">
              <span className="w-5 text-right text-sm tabular-nums text-neutral-600">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="break-words text-[17px] leading-snug">{r.name}</p>
                {r.detail && <p className="break-words text-sm text-neutral-500">{r.detail}</p>}
              </div>
              <span className="shrink-0 text-sm text-neutral-400">{r.category}</span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
