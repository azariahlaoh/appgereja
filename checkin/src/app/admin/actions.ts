"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { isStaff } from "@/lib/auth";
import { str } from "@/lib/util";

function fields(fd: FormData) {
  return {
    title: str(fd.get("title"), 150),
    body: str(fd.get("body"), 5000),
    pinned: fd.get("pinned") === "on",
    published: fd.get("published") === "on",
  };
}

function done() {
  revalidatePath("/admin");
  revalidatePath("/pengumuman");
}

export async function saveAnnouncement(fd: FormData) {
  if (!(await isStaff())) return;
  const f = fields(fd);
  if (!f.title) return;
  const id = str(fd.get("id"), 50);
  if (id) await db().from("announcements").update(f).eq("id", id);
  else await db().from("announcements").insert(f);
  done();
}

export async function deleteAnnouncement(fd: FormData) {
  if (!(await isStaff())) return;
  await db().from("announcements").delete().eq("id", str(fd.get("id"), 50));
  done();
}
