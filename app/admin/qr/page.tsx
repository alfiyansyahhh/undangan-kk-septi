import { cookies } from "next/headers";
import { ADMIN_COOKIE, QR_COOKIE, validSession } from "@/lib/adminAuth";
import AdminLogin from "@/app/components/admin/adminLogin";
import QrDashboard from "@/app/components/admin/qrDashboard";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export default async function QrPage() {
  const store = await cookies();
  const qr = await validSession(store.get(QR_COOKIE)?.value, "qr");
  const admin = await validSession(store.get(ADMIN_COOKIE)?.value);
  return qr || admin ? <QrDashboard staff={qr} /> : <AdminLogin qr />;
}
