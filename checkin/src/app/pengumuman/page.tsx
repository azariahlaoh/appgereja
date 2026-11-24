import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pengumuman - Grow Youth" };

export default async function Pengumuman() {
  const { data } = await db().from("announcements").select("id, title, body, pinned, created_at")
    .eq("published", true).order("pinned", { ascending: false }).order("created_at", { ascending: false });
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">Pengumuman</h1>
      {(data ?? []).length === 0 && <p className="text-[#9aa5b8]">Belum ada pengumuman.</p>}
      {(data ?? []).map((n) => (
        <article key={n.id} className="rounded-xl border border-[#2a3344] p-4">
          <h2 className="font-semibold">{n.pinned && "📌 "}{n.title}</h2>
          <p className="mt-1 whitespace-pre-wrap text-sm text-[#c5cddb]">{n.body}</p>
        </article>
      ))}
    </div>
  );
}
