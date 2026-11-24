export const EVENT_TITLE = "🏀 Basket 27 Nov";
export const TARGET = 15;

// Tanggal event (WIB) untuk hitung mundur.
export const EVENT_DATE = "2026-11-27"; // YYYY-MM-DD
export const EVENT_END_HOUR = 20; // setelah jam ini (WIB) dianggap selesai

export const EVENT_INFO = {
  when: "Jumat, 27 Nov · 18.00 – 20.00",
  place: "Grafika Sports Arena, Lebak Bulus",
  mapsUrl: "https://maps.app.goo.gl/Aaeh8bMFWUNWCn3U9",
};

export const CATEGORIES = ["Youth", "College", "Cool", "Belum bergabung"] as const;
export type Category = (typeof CATEGORIES)[number];

export const DETAIL_FIELD: Record<Category, { label: string; placeholder: string } | null> = {
  Youth: { label: "Huddle kelas berapa?", placeholder: "Huddle 10M" },
  College: { label: "Huddle apa?", placeholder: "TEH, SSM" },
  Cool: { label: "Cool apa?", placeholder: "Cool PIM 5" },
  "Belum bergabung": null,
};

// Titik + label kategori (selaras emoji di form: biru/oranye/ungu).
export const CATEGORY_STYLE: Record<Category, string> = {
  Youth: "bg-sky-400 text-sky-300",
  College: "bg-orange-400 text-orange-300",
  Cool: "bg-fuchsia-400 text-fuchsia-300",
  "Belum bergabung": "bg-lime-300 text-lime-200",
};

// Logo komunitas (public/logo). Belum bergabung tidak punya logo.
export const CATEGORY_LOGO: Record<Category, string | null> = {
  Youth: "/logo/youth.png",
  College: "/logo/college.png",
  Cool: "/logo/cool.png",
  "Belum bergabung": null,
};

export const FORM_URL = "https://forms.gle/hMYPRh6GLWmZhPcr7";
export const SHEET_ID = "1aCbDHcrrc4QKGrmKdDl2oLIIPN5uSZ1AdFknzqrwlzE";
export const SHEET_NAME = "Form Responses 1";
