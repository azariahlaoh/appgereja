"use server";
import { db } from "@/lib/db";
import { isStaff, pinOk, setStaffCookie, clearStaffCookie } from "@/lib/auth";
import { recordAttendance, todayStats, type CheckInResult } from "@/lib/attendance";
import { revalidatePath } from "next/cache";

export type LoginState = { error?: string } | null;

export async function loginStaff(_p: LoginState, fd: FormData): Promise<LoginState> {
  const pin = String(fd.get("pin") ?? "");
  if (!pinOk(pin)) return { error: "PIN salah." };
  await setStaffCookie();
  revalidatePath("/scan");
  revalidatePath("/admin");
  return null;
}

export async function logoutStaff() {
  await clearStaffCookie();
  revalidatePath("/scan");
  revalidatePath("/admin");
}

export async function checkIn(raw: string): Promise<CheckInResult | { status: "denied" }> {
  if (!(await isStaff())) return { status: "denied" };
  const code = raw.trim();
  const m = /^GY:([\w-]{10,40})$/.exec(code);
  if (!m) return { status: "unknown", stats: await todayStats() };
  const { data } = await db().from("members").select("id, full_name").eq("token", m[1]).maybeSingle();
  if (!data) return { status: "unknown", stats: await todayStats() };
  return recordAttendance(data, "scan");
}
