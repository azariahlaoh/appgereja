export const EVENT_TITLE = "🏀 Basket 13 Nov";
export const TARGET = 15;

export const CATEGORIES = ["Youth", "College", "Cool", "Luar komunitas"] as const;
export type Category = (typeof CATEGORIES)[number];

export const DETAIL_FIELD: Record<Category, { label: string; placeholder: string } | null> = {
  Youth: { label: "Huddle kelas berapa?", placeholder: "Huddle 10M" },
  College: { label: "Huddle apa?", placeholder: "TEH, SSM" },
  Cool: { label: "Cool apa?", placeholder: "Cool PIM 5" },
  "Luar komunitas": null,
};

// Titik + label kategori (selaras emoji di form: biru/oranye/ungu).
export const CATEGORY_STYLE: Record<Category, string> = {
  Youth: "bg-sky-400 text-sky-300",
  College: "bg-orange-400 text-orange-300",
  Cool: "bg-fuchsia-400 text-fuchsia-300",
  "Luar komunitas": "bg-lime-300 text-lime-200",
};

export const FORM_URL = "https://forms.gle/nCCyMemwBSW7J7Gp9";
export const SHEET_ID = "14ztDMrMDGEzFAs0NnDyB7D4QKHjtKvUv42p8dalQRWc";
export const SHEET_NAME = "Form Responses 1";
