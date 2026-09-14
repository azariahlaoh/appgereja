import type { Song } from "@/lib/types";

const STATUS_LABEL: Record<Song["status"], string> = {
  uploaded: "Menunggu diproses",
  analyzing: "Deteksi BPM/key...",
  analyzed: "BPM/key selesai",
  separating: "Memisah stem...",
  ready: "Siap latihan",
  error: "Gagal diproses",
};

export function SongListItem({ song }: { song: Song }) {
  return (
    <li className="flex items-center justify-between rounded-xl border border-neutral-200 p-4">
      <div className="min-w-0">
        <p className="truncate font-medium">{song.title}</p>
        <p className="text-xs text-neutral-500">
          {song.bpm ? `${song.bpm} BPM` : "BPM belum diketahui"}
          {" · "}
          {song.musical_key ?? "Key belum diketahui"}
        </p>
      </div>
      <span className="ml-3 shrink-0 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
        {STATUS_LABEL[song.status]}
      </span>
    </li>
  );
}
