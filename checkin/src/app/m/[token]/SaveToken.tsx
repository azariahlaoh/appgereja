"use client";
import { useEffect } from "react";

export default function SaveToken({ token }: { token: string }) {
  useEffect(() => { try { localStorage.setItem("gy_token", token); } catch {} }, [token]);
  return null;
}
