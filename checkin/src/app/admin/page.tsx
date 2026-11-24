import { db } from "@/lib/db";
import { isStaff } from "@/lib/auth";
import { timeJakarta, todayJakarta } from "@/lib/util";
import StaffLogin from "@/components/StaffLogin";
import { logoutStaff } from "../scan/actions";
import { deleteAnnouncement, saveAnnouncement } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin - Grow Youth", robots: { index: false } };

type A = { id: string; title: string; body: string; pinned: boolean; published: boolean };
type Mem = { full_name: string; type: string; is_new: boolean };
type Row = { checked_in_at: string; members: Mem | Mem[] | null };

function AnnForm({ a }: { a?: A }) {
  return (
    <form action={saveAnnouncement} className="space-y-2">
      {a && <input type="hidden" name="id" value={a.id} />}
      <input name="title" required placeholder="Judul" defaultValue={a?.title} className="field" />
      <textarea name="body" rows={3} placeholder="Isi (teks biasa)" defaultValue={a?.body} className="field" />
      <div className="flex gap-4 text-sm">
        <label><input type="checkbox" name="pinned" defaultChecked={a?.pinned ?? false} /> Pinned</label>
        <label><input type="checkbox" name="published" defaultChecked={a?.published ?? true} /> Published</label>
      </div>
      <button className="btn">{a ? "Simpan" : "Tambah"}</button>
    </form>
  );
}

export default async function Admin({ searchParams }: { searchParams: Promise<{ tgl?: string }> }) {
  if (!(await isStaff())) return <StaffLogin />;
  const { tgl } = await searchParams;
  const date = tgl && /^\d{4}-\d{2}-\d{2}$/.test(tgl) ? tgl : todayJakarta();
  const supabase = db();

  const [{ data: anns }, { data: att }] = await Promise.all([
    supabase.from("announcements").select("id, title, body, pinned, published")
      .order("pinned", { ascending: false }).order("created_at", { ascending: false }),
    supabase.from("attendance").select("checked_in_at, members(full_name, type, is_new)")
      .eq("service_date", date).order("checked_in_at"),
  ]);
  const rows = ((att ?? []) as Row[]).map((r) => {
    const m = (Array.isArray(r.members) ? r.members[0] : r.members) as Mem;
    return { ...m, time: timeJakarta(r.checked_in_at) };
  });
  const guests = rows.filter((r) => r.type === "guest").length;
  const baru = rows.filter((r) => r.type === "member" && r.is_new).length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin</h1>
        <form action={logoutStaff}><button className="btn-ghost text-sm">Keluar</button></form>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Rekap kehadiran</h2>
        <form className="flex gap-2">
          <input type="date" name="tgl" defaultValue={date} className="field" />
          <button className="btn-ghost">Lihat</button>
        </form>
        <div className="grid grid-cols-2 gap-2 text-center">
          {[["Total", rows.length], ["Jemaat", rows.length - guests], ["Guest", guests], ["Jemaat baru", baru]].map(([k, v]) => (
            <div key={k} className="rounded-xl border border-[#2a3344] p-3"><div className="text-2xl font-bold text-[#d4ff1f]">{v}</div><div className="text-xs text-[#9aa5b8]">{k}</div></div>
          ))}
        </div>
        <ul className="divide-y divide-[#2a3344] rounded-xl border border-[#2a3344]">
          {rows.length === 0 && <li className="p-3 text-sm text-[#9aa5b8]">Belum ada yang hadir.</li>}
          {rows.map((r, i) => (
            <li key={i} className="flex justify-between p-3 text-sm"><span>{r.full_name}{r.type === "guest" && " (guest)"}{r.type === "member" && r.is_new && " ✨"}</span><span className="text-[#9aa5b8]">{r.time}</span></li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Pengumuman</h2>
        <div className="rounded-xl border border-[#2a3344] p-3"><AnnForm /></div>
        {((anns ?? []) as A[]).map((a) => (
          <details key={a.id} className="rounded-xl border border-[#2a3344] p-3">
            <summary className="cursor-pointer text-sm">{a.pinned && "📌 "}{a.title} {!a.published && <em className="text-[#9aa5b8]">(draft)</em>}</summary>
            <div className="mt-3 space-y-2">
              <AnnForm a={a} />
              <form action={deleteAnnouncement}><input type="hidden" name="id" value={a.id} /><button className="text-sm text-red-400 underline">Hapus</button></form>
            </div>
          </details>
        ))}
      </section>
    </div>
  );
}
