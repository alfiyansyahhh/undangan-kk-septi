import { cookies } from "next/headers";
import { ADMIN_COOKIE, validSession } from "@/lib/adminAuth";
import AdminDashboard from "@/app/components/admin/adminDashboard";
import AdminLogin from "@/app/components/admin/adminLogin";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export default async function AdminPage() {
  const cookieStore = await cookies();
  return await validSession(cookieStore.get(ADMIN_COOKIE)?.value) ? <AdminDashboard /> : <AdminLogin />;
}
