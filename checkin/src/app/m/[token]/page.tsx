import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { db } from "@/lib/db";
import SaveToken from "./SaveToken";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false } };

export default async function MemberPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[\w-]{10,40}$/.test(token)) notFound();
  const supabase = db();
  const { data: m } = await supabase.from("members").select("full_name").eq("token", token).maybeSingle();
  if (!m) notFound();

  const qr = await QRCode.toDataURL(`GY:${token}`, { width: 600, margin: 2, errorCorrectionLevel: "M" });
  const { data: news } = await supabase
    .from("announcements").select("id, title, body, pinned")
    .eq("published", true).order("pinned", { ascending: false }).order("created_at", { ascending: false }).limit(5);

  return (
    <div className="space-y-6">
      <SaveToken token={token} />
      <div className="text-center">
        <p className="text-sm text-[#9aa5b8]">Halo,</p>
        <h1 className="text-2xl font-bold">{m.full_name}</h1>
      </div>
      <div className="rounded-2xl bg-white p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qr} alt="QR check-in" className="mx-auto w-full max-w-xs" />
      </div>
      <a href={qr} download={`qr-growyouth.png`} className="btn block">Download QR (PNG)</a>
      <p className="text-center text-xs text-[#9aa5b8]">Tunjukkan QR ini ke staff waktu check-in. Jangan dibagikan ke orang lain.</p>

      <section className="space-y-3">
        <h2 className="font-bold">Pengumuman</h2>
        {(news ?? []).length === 0 && <p className="text-sm text-[#9aa5b8]">Belum ada pengumuman.</p>}
        {(news ?? []).map((n) => (
          <article key={n.id} className="rounded-xl border border-[#2a3344] p-3">
            <h3 className="font-semibold">{n.pinned && "📌 "}{n.title}</h3>
            <p className="mt-1 whitespace-pre-wrap text-sm text-[#c5cddb]">{n.body}</p>
          </article>
        ))}
        <a href="/pengumuman" className="text-sm underline">Semua pengumuman</a>
      </section>
    </div>
  );
}
