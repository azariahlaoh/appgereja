"use server";
import { redirect } from "next/navigation";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { normalizePhone, str } from "@/lib/util";

export type DaftarState = { error?: string } | null;

export async function daftar(_prev: DaftarState, fd: FormData): Promise<DaftarState> {
  // Honeypot: bot mengisi field tersembunyi ini. Pura-pura sukses.
  if (str(fd.get("website"))) redirect("/");

  const full_name = str(fd.get("full_name"), 100);
  const phone = normalizePhone(str(fd.get("phone"), 30));
  const birth_date = str(fd.get("birth_date"), 10);
  if (!full_name) return { error: "Nama wajib diisi." };
  if (!phone) return { error: "No. WA tidak valid. Contoh: 0812xxxxxxx" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birth_date)) return { error: "Tanggal lahir wajib diisi." };
  if (fd.get("consent") !== "on") return { error: "Centang persetujuan data dulu ya." };

  const row = {
    full_name,
    phone,
    birth_date,
    school: str(fd.get("school"), 100) || null,
    area: str(fd.get("area"), 100) || null,
    is_new: fd.get("status") !== "lama",
    invited_by: str(fd.get("invited_by"), 100) || null,
    consent_at: new Date().toISOString(),
  };

  const supabase = db();
  const { data: existing } = await supabase.from("members").select("id, token, type").eq("phone", phone).maybeSingle();

  let token: string;
  if (existing) {
    // Guest yang kemudian daftar dengan WA sama -> upgrade record yang ada.
    if (existing.type !== "guest") return { error: "No. WA ini sudah terdaftar. Minta QR ke staff ya." };
    const { error } = await supabase.from("members").update({ ...row, type: "member" }).eq("id", existing.id);
    if (error) return { error: "Gagal menyimpan, coba lagi." };
    token = existing.token;
  } else {
    token = nanoid(21);
    const { error } = await supabase.from("members").insert({ ...row, token, type: "member" });
    if (error) return { error: "Gagal menyimpan, coba lagi." };
  }
  redirect(`/m/${token}`);
}
