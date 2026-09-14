import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UploadSongForm } from "@/components/UploadSongForm";
import { SongListItem } from "@/components/SongListItem";
import { SignOutButton } from "@/components/SignOutButton";
import type { Song } from "@/lib/types";

export default async function SonglistPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: songs, error } = await supabase
    .from("songs")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Song[]>();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-6 px-4 py-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Songlist Saya</h1>
          <p className="text-sm text-neutral-500">{user.email}</p>
        </div>
        <SignOutButton />
      </header>

      <UploadSongForm />

      <section className="flex flex-col gap-3">
        {error && (
          <p className="text-sm text-red-600">
            Gagal memuat songlist: {error.message}
          </p>
        )}

        {songs && songs.length === 0 && (
          <div className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
            Belum ada lagu. Upload MP3/WAV pertamamu di atas.
          </div>
        )}

        {songs && songs.length > 0 && (
          <ul className="flex flex-col gap-3">
            {songs.map((song) => (
              <SongListItem key={song.id} song={song} />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
