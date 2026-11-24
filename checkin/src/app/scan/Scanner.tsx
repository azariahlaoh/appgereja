"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { checkIn } from "./actions";
import type { Stats } from "@/lib/attendance";

const QrScanner = dynamic(() => import("@yudiel/react-qr-scanner").then((m) => m.Scanner), { ssr: false });

type Shown = { kind: "ok" | "dup" | "unknown" | "denied"; name?: string; time?: string } | null;

function beep(freq: number, ms = 150) {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    o.frequency.value = freq;
    o.connect(ctx.destination);
    o.start();
    setTimeout(() => { o.stop(); ctx.close(); }, ms);
  } catch {}
}

export default function Scanner({ initial }: { initial: Stats }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const busy = useRef(false);
  const [shown, setShown] = useState<Shown>(null);
  const [stats, setStats] = useState(initial);
  const [camera, setCamera] = useState(false);

  const focus = useCallback(() => inputRef.current?.focus(), []);
  useEffect(() => { focus(); }, [focus, camera]);

  const process = useCallback(async (code: string) => {
    if (busy.current || !code.trim()) return;
    busy.current = true;
    try {
      const r = await checkIn(code);
      if (r.status === "denied") { setShown({ kind: "denied" }); beep(200, 400); }
      else {
        setStats(r.stats);
        if (r.status === "ok") { setShown({ kind: "ok", name: r.name, time: r.time }); beep(880); }
        else if (r.status === "dup") { setShown({ kind: "dup", name: r.name, time: r.time }); beep(440, 250); }
        else { setShown({ kind: "unknown" }); beep(200, 400); }
      }
    } catch {
      setShown({ kind: "unknown" });
    }
    setTimeout(() => { setShown(null); busy.current = false; focus(); }, 2000);
  }, [focus]);

  const bg = shown?.kind === "ok" ? "bg-green-600" : shown?.kind === "dup" ? "bg-yellow-500 text-black" : shown ? "bg-red-600" : "";

  return (
    <div className="space-y-5">
      {shown && (
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 p-6 text-center ${bg}`}>
          {shown.kind === "ok" && (<><div className="text-6xl">✅</div><div className="text-3xl font-bold">{shown.name}</div><div>Berhasil check-in</div></>)}
          {shown.kind === "dup" && (<><div className="text-6xl">⚠️</div><div className="text-3xl font-bold">{shown.name}</div><div>Sudah check-in jam {shown.time}</div></>)}
          {shown.kind === "unknown" && (<><div className="text-6xl">❌</div><div className="text-3xl font-bold">QR tidak dikenal</div></>)}
          {shown.kind === "denied" && (<><div className="text-6xl">🔒</div><div className="text-2xl font-bold">Sesi habis, muat ulang halaman</div></>)}
        </div>
      )}

      <div className="rounded-2xl border border-[#2a3344] p-4 text-center">
        <div className="text-5xl font-bold text-[#d4ff1f]">{stats.count}</div>
        <div className="text-sm text-[#9aa5b8]">hadir hari ini</div>
      </div>

      <input
        ref={inputRef}
        autoFocus
        autoComplete="off"
        placeholder="Scan di sini (GY:...)"
        className="field"
        onBlur={() => setTimeout(() => { if (!camera) focus(); }, 50)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const el = e.currentTarget;
            const v = el.value;
            el.value = "";
            process(v);
          }
        }}
      />

      <button onClick={() => setCamera((c) => !c)} className="btn-ghost w-full">{camera ? "Tutup kamera" : "Pakai kamera"}</button>
      {camera && (
        <div className="overflow-hidden rounded-2xl">
          <QrScanner
            onScan={(codes) => { const v = codes[0]?.rawValue; if (v) process(v); }}
            constraints={{ facingMode: "environment" }}
            scanDelay={300}
            sound={false}
          />
        </div>
      )}

      <GuestQuick onDone={(s) => { setStats(s); }} />

      <section>
        <h2 className="mb-2 font-bold">5 check-in terakhir</h2>
        <ul className="divide-y divide-[#2a3344] rounded-xl border border-[#2a3344]">
          {stats.recent.length === 0 && <li className="p-3 text-sm text-[#9aa5b8]">Belum ada.</li>}
          {stats.recent.map((r, i) => (
            <li key={i} className="flex justify-between p-3 text-sm"><span>{r.name}{r.type === "guest" && " (guest)"}</span><span className="text-[#9aa5b8]">{r.time}</span></li>
          ))}
        </ul>
      </section>
    </div>
  );
}

// Diganti di tahap (d): tombol "Tambah guest".
function GuestQuick(_: { onDone: (s: Stats) => void }) { return null; }
