import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "gy_staff";
const TTL_MS = 12 * 60 * 60 * 1000;

function secret() {
  return `${process.env.STAFF_PIN ?? ""}|${process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""}`;
}
function sign(exp: string) {
  return createHmac("sha256", secret()).update(exp).digest("hex");
}
function safeEq(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function pinOk(pin: string) {
  const real = process.env.STAFF_PIN;
  return !!real && safeEq(pin, real);
}

export async function setStaffCookie() {
  const exp = String(Date.now() + TTL_MS);
  (await cookies()).set(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: TTL_MS / 1000,
  });
}

export async function clearStaffCookie() {
  (await cookies()).delete(COOKIE);
}

export async function isStaff(): Promise<boolean> {
  if (!process.env.STAFF_PIN) return false;
  const v = (await cookies()).get(COOKIE)?.value;
  if (!v) return false;
  const [exp, sig] = v.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return safeEq(sig, sign(exp));
}
