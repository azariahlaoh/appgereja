import { fetchPeserta } from "@/lib/sheet";

export async function GET() {
  try {
    return Response.json(await fetchPeserta());
  } catch {
    return Response.json({ error: "gagal memuat" }, { status: 502 });
  }
}
