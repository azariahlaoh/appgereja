import { SHEET_ID, SHEET_NAME, type Category } from "@/config";

export type Peserta = {
  id: string;
  name: string;
  category: Category;
  detail: string | null;
};

// CSV parser kecil (mendukung kutip, koma, dan newline di dalam sel).
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else q = false;
      } else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

function toCategory(huddleApa: string): Category | null {
  const s = huddleApa.toUpperCase();
  if (s.includes("YOUTH")) return "Youth";
  if (s.includes("COLLEGE")) return "College";
  if (s.includes("COOL")) return "Cool";
  if (s.includes("BELUM")) return "Belum bergabung";
  return null;
}

// Kolom: A Timestamp, B Nama, C Huddle Apa?, D Huddle kelas berapa?, F Huddle?, H Cool apa?
export async function fetchPeserta(): Promise<Peserta[]> {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;
  const res = await fetch(url, { next: { revalidate: 30 } });
  if (!res.ok) throw new Error(`Sheet HTTP ${res.status}`);
  const text = await res.text();
  if (text.trimStart().startsWith("<")) throw new Error("Sheet tidak publik");

  const seen = new Set<string>();
  const out: Peserta[] = [];
  parseCsv(text)
    .slice(1)
    .forEach((r, i) => {
      const name = (r[1] ?? "").trim().replace(/\s+/g, " ");
      const category = toCategory(r[2] ?? "");
      if (!name || !category) return;
      const key = name.toLowerCase();
      if (seen.has(key)) return; // submit ganda -> ambil yang pertama
      seen.add(key);
      const raw = category === "Youth" ? r[3] : category === "College" ? r[5] : category === "Cool" ? r[7] : "";
      out.push({ id: `${i}-${key}`, name, category, detail: (raw ?? "").trim() || null });
    });
  return out;
}
