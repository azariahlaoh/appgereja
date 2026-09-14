export type SongSource = "upload" | "youtube";

export type SongStatus =
  | "uploaded"
  | "analyzing"
  | "analyzed"
  | "separating"
  | "ready"
  | "error";

export interface Song {
  id: string;
  user_id: string;
  title: string;
  source: SongSource;
  source_url: string | null;
  original_filename: string | null;
  storage_path: string | null;
  bpm: number | null;
  musical_key: string | null;
  duration_seconds: number | null;
  stem_vocals_path: string | null;
  stem_drums_path: string | null;
  stem_bass_path: string | null;
  stem_other_path: string | null;
  status: SongStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}
