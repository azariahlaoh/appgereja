"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CATEGORIES, CATEGORY_STYLE, EVENT_TITLE, FORM_URL, TARGET } from "@/config";
import type { Peserta } from "@/lib/sheet";

const REFRESH_MS = 30_000;

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 12h15M13 5l7 7-7 7" />
    </svg>
  );
}

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

  const perCategory = useMemo(
    () =>
      CATEGORIES.map((c) => ({ c, n: rows?.filter((r) => r.category === c).length ?? 0 })).filter(
        (x) => x.n > 0,
      ),
    [rows],
  );

  const emoji = EVENT_TITLE.match(/^\p{Extended_Pictographic}/u)?.[0] ?? "";
  const words = EVENT_TITLE.replace(emoji, "").trim().split(" ");
  const head = words.slice(0, -2).join(" ");
  const date = words.slice(-2).join(" ");

  return (
    <>
      {/* Latar gradient mesh: bahan blur untuk efek glass */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-lime/30 blur-[110px]" />
        <div className="absolute -right-32 top-[28rem] h-96 w-96 rounded-full bg-sky-500/25 blur-[120px]" />
        <div className="absolute -left-20 top-[62rem] h-96 w-96 rounded-full bg-fuchsia-500/20 blur-[120px]" />
      </div>

      <main className="mx-auto w-full max-w-md px-5 pb-14 pt-7">
        <p className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
          <span>{emoji} Rekap peserta</span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-lime shadow-[0_0_10px_2px_rgba(212,255,31,0.8)]" />
            Live
          </span>
        </p>

        <h1 className="mt-3 font-display text-[5.5rem] font-extrabold uppercase leading-[0.82] tracking-tight">
          {head}
          <br />
          <span className="glow-text text-lime">{date}</span>
        </h1>

        {/* Counter */}
        <section className="glass mt-8 rounded-[1.75rem] p-5">
          <div className="flex items-end gap-3">
            <span className={`font-display text-[8.5rem] font-extrabold leading-[0.78] tabular-nums ${reached ? "glow-text text-lime" : ""}`}>
              {count ?? "–"}
            </span>
            <span className="pb-1 font-display text-3xl font-bold uppercase leading-none text-neutral-400">
              / {TARGET}
              <br />
              minimal
            </span>
          </div>

          <div className="mt-5 grid gap-1" style={{ gridTemplateColumns: `repeat(${TARGET}, minmax(0, 1fr))` }}>
            {Array.from({ length: TARGET }, (_, i) => (
              <span
                key={i}
                className={`h-7 rounded-[3px] ${
                  i < (count ?? 0)
                    ? "bg-gradient-to-b from-lime to-lime/70 shadow-[0_0_14px_rgba(212,255,31,0.6)]"
                    : "bg-white/10"
                }`}
                style={{ transform: "skewX(-14deg)" }}
              />
            ))}
          </div>

          {count !== null && (
            <p className={`mt-4 font-display text-2xl font-bold uppercase ${reached ? "text-lime" : "text-neutral-200"}`}>
              {reached ? `✅ Minimal ${TARGET} tercapai, jadi jalan!` : `Kurang ${TARGET - count} orang lagi biar jalan`}
            </p>
          )}

          {perCategory.length > 0 && (
            <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-neutral-300">
              {perCategory.map(({ c, n }) => (
                <span key={c} className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full shadow-[0_0_8px_currentColor] ${CATEGORY_STYLE[c].split(" ")[0]} ${CATEGORY_STYLE[c].split(" ")[1]}`} />
                  {c} <b className="font-semibold text-white">{n}</b>
                </span>
              ))}
            </p>
          )}
        </section>

        <a
          href={FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex items-center justify-between rounded-2xl bg-gradient-to-br from-lime to-lime/75 px-5 py-4 font-display text-2xl font-extrabold uppercase text-black shadow-[0_10px_40px_-8px_rgba(212,255,31,0.55)] active:opacity-80"
        >
          Daftar sekarang
          <Arrow />
        </a>

        {/* List */}
        <section className="mt-9">
          <h2 className="mb-3 px-1 font-display text-xl font-bold uppercase tracking-wide text-neutral-400">
            Peserta
          </h2>
          {loadError && <p className="mb-3 px-1 text-sm text-red-400">Gagal memuat daftar. Dicoba lagi otomatis.</p>}
          {rows === null && !loadError && <p className="px-1 text-sm text-neutral-500">Memuat…</p>}
          {rows?.length === 0 && <p className="px-1 text-sm text-neutral-500">Belum ada yang daftar.</p>}
          {rows && rows.length > 0 && (
            <ol className="glass divide-y divide-white/10 rounded-[1.75rem] px-4">
              {rows.map((r, i) => (
                <li key={r.id} className="flex items-baseline gap-4 py-3.5">
                  <span className="w-8 text-right font-display text-3xl font-bold leading-none tabular-nums text-lime">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-[17px] font-medium leading-tight">{r.name}</p>
                    {r.detail && <p className="mt-0.5 break-words text-sm text-neutral-400">{r.detail}</p>}
                  </div>
                  <span className={`flex shrink-0 items-center gap-1.5 font-display text-base font-semibold uppercase tracking-wide ${CATEGORY_STYLE[r.category].split(" ")[1]}`}>
                    <span className={`h-2 w-2 rounded-full shadow-[0_0_8px_currentColor] ${CATEGORY_STYLE[r.category].split(" ")[0]}`} />
                    {r.category}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </main>
    </>
  );
}
