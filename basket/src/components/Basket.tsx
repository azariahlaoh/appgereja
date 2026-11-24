"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CATEGORIES, CATEGORY_STYLE, EVENT_TITLE, FORM_URL, TARGET } from "@/config";
import type { Peserta } from "@/lib/sheet";

const REFRESH_MS = 30_000;
const LIME = "#d4ff1f";

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function Ring({ count, reached }: { count: number | null; reached: boolean }) {
  const r = 78;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, (count ?? 0) / TARGET);
  return (
    <div className="relative mx-auto h-56 w-56">
      <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
        <circle cx="100" cy="100" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="16" />
        <circle
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke={LIME}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: "stroke-dashoffset .8s ease", filter: reached ? `drop-shadow(0 0 10px ${LIME})` : undefined }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-6xl font-black leading-none tabular-nums">{count ?? "–"}</span>
        <span className="mt-2 text-sm font-medium text-gray-400">/ {TARGET} minimal</span>
      </div>
    </div>
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

  const cta =
    "flex w-full items-center justify-between rounded-full bg-[#d4ff1f] px-6 py-4 text-base font-extrabold uppercase tracking-wide text-black shadow-[0_0_30px_rgba(212,255,31,0.25)] active:scale-[0.98] transition";

  return (
    <main className="mx-auto w-full max-w-md px-4 pb-12 pt-6">
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#d4ff1f] shadow-[0_0_8px_#d4ff1f]" />
          Rekap peserta
        </span>
        <span>Live</span>
      </div>

      <h1 className="mt-4 text-5xl font-black uppercase leading-[0.95] tracking-tight">
        {EVENT_TITLE.replace("🏀", "").trim().split(" ").map((w, i, a) => (
          <span key={i} className={i === a.length - 1 || /^\d/.test(w) ? "text-[#d4ff1f]" : ""}>
            {w}{" "}
          </span>
        ))}
        <span aria-hidden>🏀</span>
      </h1>

      {/* Counter */}
      <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
        <Ring count={count} reached={reached} />
        {count !== null && (
          <p
            className={`mt-5 text-center text-base font-bold ${
              reached ? "text-[#d4ff1f]" : "text-gray-300"
            }`}
          >
            {reached
              ? `✅ Minimal ${TARGET} tercapai, jadi jalan!`
              : `Kurang ${TARGET - count} orang lagi biar jalan`}
          </p>
        )}
        {perCategory.length > 0 && (
          <div className="mt-5 grid grid-cols-2 gap-2">
            {perCategory.map(({ c, n }) => (
              <div key={c} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
                <p className="text-2xl font-black tabular-nums">{n}</p>
                <p className={`mt-0.5 text-xs font-semibold uppercase tracking-wide ${CATEGORY_STYLE[c].split(" ")[1]}`}>
                  {c}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <a href={FORM_URL} target="_blank" rel="noopener noreferrer" className={`${cta} mt-5`}>
        Daftar sekarang
        <Arrow />
      </a>

      {/* List */}
      <section className="mt-9">
        <div className="mb-3 flex items-center gap-3">
          <h2 className="text-sm font-extrabold uppercase tracking-[0.15em]">Peserta</h2>
          <span className="h-px flex-1 bg-white/15" />
          <span className="text-xs text-gray-400">{count ?? 0} orang</span>
        </div>
        {loadError && (
          <p className="mb-2 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
            Gagal memuat daftar. Akan dicoba lagi otomatis.
          </p>
        )}
        {rows === null && !loadError && <p className="text-sm text-gray-500">Memuat…</p>}
        {rows?.length === 0 && <p className="text-sm text-gray-500">Belum ada yang daftar.</p>}
        <ol className="space-y-2">
          {rows?.map((r, i) => (
            <li
              key={r.id}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
            >
              <span className="w-7 text-right text-lg font-black tabular-nums text-[#d4ff1f]">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="break-words font-semibold">{r.name}</p>
                {r.detail && <p className="break-words text-xs text-gray-400">{r.detail}</p>}
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 ${CATEGORY_STYLE[r.category]}`}
              >
                {r.category}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-9 rounded-[2rem] bg-[#d4ff1f] p-6 text-black">
        <p className="text-2xl font-black uppercase leading-tight">Belum daftar?</p>
        <p className="mt-1 text-sm font-medium text-black/70">
          Isi form, daftar di atas otomatis ter-update.
        </p>
        <a
          href={FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex w-full items-center justify-between rounded-full bg-black px-6 py-3.5 text-sm font-extrabold uppercase tracking-wide text-white"
        >
          Isi form
          <Arrow />
        </a>
      </div>
    </main>
  );
}
