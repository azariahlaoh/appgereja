const TZ = "Asia/Jakarta";

/** Tanggal hari ini di Jakarta, format YYYY-MM-DD. */
export function todayJakarta(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}

/** Jam HH:MM di Jakarta. */
export function timeJakarta(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false })
    .format(new Date(iso))
    .replace(".", ":");
}

/** Normalisasi nomor WA ke 62xxxxxxxx. Return null kalau tidak valid. */
export function normalizePhone(raw: string): string | null {
  let d = raw.replace(/[^\d]/g, "");
  if (d.startsWith("0")) d = "62" + d.slice(1);
  else if (d.startsWith("8")) d = "62" + d;
  if (!/^62\d{8,13}$/.test(d)) return null;
  return d;
}

export function str(v: FormDataEntryValue | null, max = 200): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}
