import { isStaff } from "@/lib/auth";
import { todayStats } from "@/lib/attendance";
import StaffLogin from "@/components/StaffLogin";
import Scanner from "./Scanner";

export const dynamic = "force-dynamic";
export const metadata = { title: "Scan - Grow Youth", robots: { index: false } };

export default async function ScanPage() {
  if (!(await isStaff())) return <StaffLogin />;
  return <Scanner initial={await todayStats()} />;
}
