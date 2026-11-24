"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CATEGORIES, CATEGORY_LOGO, CATEGORY_STYLE, EVENT_DATE, EVENT_END_HOUR, EVENT_INFO, EVENT_TITLE, FORM_URL, TARGET } from "@/config";
import PhotoBackground from "@/components/PhotoBackground";
import type { Peserta } from "@/lib/sheet";

const REFRESH_MS = 30_000;

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 12h15M13 5l7 7-7 7" />
    </svg>
  );
}

function Logo({ c, size }: { c: (typeof CATEGORIES)[number]; size: number }) {
  const src = CATEGORY_LOGO[c];
  if (!src) {
    // Belum bergabung: bullet point polos
    return (
      <span className="grid shrink-0 place-items-center" style={{ width: size, height: size }}>
        <span className="h-2 w-2 rounded-full bg-lime-300 shadow-[0_0_8px_rgba(190,242,100,0.8)]" />
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" width={size} height={size} className="shrink-0 object-contain" style={{ width: size, height: size }} />;
}

// Label hitung mundur berdasarkan tanggal & jam di WIB (Asia/Jakarta).
function countdownLabel(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  const today = Date.UTC(+get("year"), +get("month") - 1, +get("day"));
  const [y, m, d] = EVENT_DATE.split("-").map(Number);
  const days = Math.round((Date.UTC(y, m - 1, d) - today) / 86_400_000);
  if (days > 1) return `${days} hari lagi`;
  if (days === 1) return "Besok!";
  if (days === 0) return +get("hour") >= EVENT_END_HOUR ? "Sudah selesai" : "Hari ini!";
  return "Sudah selesai";
}

export default function Basket() {
  const [countdown, setCountdown] = useState<string | null>(null);
  useEffect(() => {
    // Dihitung di browser supaya tidak basi pada halaman yang di-prerender.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCountdown(countdownLabel());
    const t = setInterval(() => setCountdown(countdownLabel()), 60_000);
    return () => clearInterval(t);
  }, []);

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
      <PhotoBackground />

      <main className="mx-auto w-full max-w-md px-5 pb-14 pt-7">
        <p className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
          <span>{emoji} Basket Registration</span>
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

        {/* Jadwal & lokasi */}
        <div className="mt-5 space-y-1.5 text-[15px] text-neutral-200">
          <p className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-lime" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
            {EVENT_INFO.when}
            {countdown && (
              <span className="ml-auto shrink-0 rounded-full bg-lime px-3 py-0.5 font-display text-base font-extrabold uppercase leading-6 tracking-wide text-black shadow-[0_0_18px_rgba(212,255,31,0.45)]">
                {countdown}
              </span>
            )}
          </p>
          <a
            href={EVENT_INFO.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 underline decoration-white/30 underline-offset-4 active:opacity-70"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-lime" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            {EVENT_INFO.place}
          </a>
        </div>

        {/* Counter */}
        <section className="glass mt-6 rounded-[1.75rem] p-5">
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
                  <Logo c={c} size={18} />
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
            <div className="glass overflow-hidden rounded-[1.75rem]">
              {/* Header kolom */}
              <div className="grid grid-cols-[2.5rem_1fr_8.5rem] bg-white/[0.06] font-display text-sm font-bold uppercase tracking-[0.14em] text-neutral-400">
                <span className="px-2 py-2 text-center">No</span>
                <span className="border-l border-white/10 px-3 py-2">Nama</span>
                <span className="border-l border-white/10 px-3 py-2">Komunitas</span>
              </div>
              <ol>
                {rows.map((r, i) => (
                  <li key={r.id} className="grid grid-cols-[2.5rem_1fr_8.5rem] border-t border-white/10">
                    <span className="flex items-center justify-center px-2 py-3 font-display text-2xl font-bold leading-none tabular-nums text-lime">
                      {i + 1}
                    </span>
                    <div className="flex min-w-0 flex-col justify-center border-l border-white/10 px-3 py-3">
                      <p className="break-words font-serif text-[1.45rem] italic leading-[1.1] tracking-[0.005em]">{r.name}</p>
                      {r.detail && <p className="mt-0.5 break-words text-[13px] leading-snug text-neutral-400">{r.detail}</p>}
                    </div>
                    <div className="flex items-center gap-2 border-l border-white/10 px-3 py-3">
                      <Logo c={r.category} size={26} />
                      <span className={`font-display text-[0.95rem] font-semibold uppercase leading-[1.05] tracking-wide ${CATEGORY_STYLE[r.category].split(" ")[1]}`}>
                        {r.category}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
