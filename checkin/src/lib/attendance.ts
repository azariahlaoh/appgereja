import "server-only";
import { db } from "@/lib/db";
import { timeJakarta, todayJakarta } from "@/lib/util";

export type Recent = { name: string; time: string; type: string };
export type Stats = { count: number; recent: Recent[] };

type Row = { checked_in_at: string; members: { full_name: string; type: string } | { full_name: string; type: string }[] | null };

export async function todayStats(): Promise<Stats> {
  const supabase = db();
  const date = todayJakarta();
  const [{ count }, { data }] = await Promise.all([
    supabase.from("attendance").select("id", { count: "exact", head: true }).eq("service_date", date),
    supabase.from("attendance").select("checked_in_at, members(full_name, type)").eq("service_date", date)
      .order("checked_in_at", { ascending: false }).limit(5),
  ]);
  const recent = ((data ?? []) as Row[]).map((r) => {
    const m = Array.isArray(r.members) ? r.members[0] : r.members;
    return { name: m?.full_name ?? "?", type: m?.type ?? "member", time: timeJakarta(r.checked_in_at) };
  });
  return { count: count ?? 0, recent };
}

export type CheckInResult =
  | { status: "ok"; name: string; time: string; stats: Stats }
  | { status: "dup"; name: string; time: string; stats: Stats }
  | { status: "unknown"; stats: Stats };

/** Catat hadir hari ini. Idempoten: UNIQUE(member_id, service_date). */
export async function recordAttendance(member: { id: string; full_name: string }, source: string): Promise<CheckInResult> {
  const supabase = db();
  const date = todayJakarta();
  const { data, error } = await supabase
    .from("attendance")
    .insert({ member_id: member.id, service_date: date, source })
    .select("checked_in_at").single();
  if (!error && data) {
    return { status: "ok", name: member.full_name, time: timeJakarta(data.checked_in_at), stats: await todayStats() };
  }
  // 23505 = unique violation -> sudah check-in
  const { data: prev } = await supabase.from("attendance").select("checked_in_at")
    .eq("member_id", member.id).eq("service_date", date).maybeSingle();
  if (prev) return { status: "dup", name: member.full_name, time: timeJakarta(prev.checked_in_at), stats: await todayStats() };
  throw new Error(error?.message ?? "gagal check-in");
}
