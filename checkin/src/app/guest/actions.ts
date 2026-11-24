"use server";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { isStaff } from "@/lib/auth";
import { recordAttendance, todayStats, type Stats } from "@/lib/attendance";
import { normalizePhone, str } from "@/lib/util";

export type GuestState = { error?: string; ok?: string } | null;

async function addGuest(name: string, phoneRaw: string, invited: string) {
  const supabase = db();
  const phone = phoneRaw ? normalizePhone(phoneRaw) : null;
  if (phoneRaw && !phone) return { error: "No. WA tidak valid." } as const;

  // Kalau WA sudah ada (guest/member), pakai record yang ada, jangan duplikat.
  if (phone) {
    const { data } = await supabase.from("members").select("id, full_name").eq("phone", phone).maybeSingle();
    if (data) return { member: data } as const;
  }
  const { data, error } = await supabase.from("members")
    .insert({ token: nanoid(21), type: "guest", full_name: name, phone, invited_by: invited || null })
    .select("id, full_name").single();
  if (error || !data) return { error: "Gagal menyimpan, coba lagi." } as const;
  return { member: data } as const;
}

// Form publik /guest
export async function guestPublic(_p: GuestState, fd: FormData): Promise<GuestState> {
  if (str(fd.get("website"))) return { ok: "Selamat datang!" };
  const name = str(fd.get("full_name"), 100);
  if (!name) return { error: "Nama wajib diisi." };
  const r = await addGuest(name, str(fd.get("phone"), 30), str(fd.get("invited_by"), 100));
  if ("error" in r) return { error: r.error };
  await recordAttendance(r.member, "guest");
  return { ok: `Selamat datang, ${r.member.full_name}! Kehadiranmu sudah tercatat 🎉` };
}

// Tombol "Tambah guest" di /scan (staff, cukup nama)
export async function guestStaff(name: string): Promise<{ error?: string; stats?: Stats; name?: string }> {
  if (!(await isStaff())) return { error: "Sesi habis, muat ulang." };
  const n = name.trim().slice(0, 100);
  if (!n) return { error: "Nama kosong." };
  const r = await addGuest(n, "", "");
  if ("error" in r) return { error: r.error };
  await recordAttendance(r.member, "guest");
  return { stats: await todayStats(), name: r.member.full_name };
}
