"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const ACCEPTED_TYPES = [".mp3", ".wav"];

export function UploadSongForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    if (selected && !title) {
      setTitle(selected.name.replace(/\.[^/.]+$/, ""));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setErrorMessage("Pilih file MP3/WAV dulu.");
      setStatus("error");
      return;
    }

    setStatus("uploading");
    setErrorMessage("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setStatus("error");
      setErrorMessage("Sesi login habis, silakan login ulang.");
      return;
    }

    const ext = file.name.split(".").pop();
    const storagePath = `${user.id}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("songs")
      .upload(storagePath, file, { upsert: false });

    if (uploadError) {
      setStatus("error");
      setErrorMessage(`Gagal upload file: ${uploadError.message}`);
      return;
    }

    const { error: insertError } = await supabase.from("songs").insert({
      user_id: user.id,
      title: title.trim() || file.name,
      source: "upload",
      original_filename: file.name,
      storage_path: storagePath,
      status: "uploaded",
    });

    if (insertError) {
      setStatus("error");
      setErrorMessage(`Gagal simpan data lagu: ${insertError.message}`);
      return;
    }

    setStatus("idle");
    setTitle("");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-neutral-200 p-4"
    >
      <h2 className="text-base font-semibold">Upload Lagu</h2>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleFileChange}
        className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
      />

      <input
        type="text"
        placeholder="Judul lagu"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
      />

      <button
        type="submit"
        disabled={status === "uploading"}
        className="rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {status === "uploading" ? "Mengupload..." : "Upload"}
      </button>

      {status === "error" && (
        <p className="text-sm text-red-600">{errorMessage}</p>
      )}
    </form>
  );
}
