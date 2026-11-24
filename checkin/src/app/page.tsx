"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    let token: string | null = null;
    try { token = localStorage.getItem("gy_token"); } catch {}
    router.replace(token ? `/m/${token}` : "/daftar");
  }, [router]);
  return <p className="text-center text-[#9aa5b8]">Memuat...</p>;
}
