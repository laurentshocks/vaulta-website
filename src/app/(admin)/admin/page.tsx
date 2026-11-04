import Link from "next/link";
import { db } from "@/lib/db";

export default async function Dashboard() {
  const d = await db();
  const [products, customers, consented, preorders, newPre, quotes, newQuotes] = await Promise.all([
    d.prepare("SELECT COUNT(*) AS n FROM products WHERE active = 1").first<{ n: number }>(),
    d.prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'customer'").first<{ n: number }>(),
    d.prepare("SELECT COUNT(*) AS n FROM users WHERE marketing_consent = 1").first<{ n: number }>(),
    d.prepare("SELECT COUNT(*) AS n FROM preorders").first<{ n: number }>(),
    d.prepare("SELECT COUNT(*) AS n FROM preorders WHERE status = 'new'").first<{ n: number }>(),
    d.prepare("SELECT COUNT(*) AS n FROM quotes").first<{ n: number }>(),
    d.prepare("SELECT COUNT(*) AS n FROM quotes WHERE status = 'new'").first<{ n: number }>(),
  ]);

  return (
    <>
      <h1>Dashboard</h1>
      <div className="stats">
        <Link href="/admin/preorders" className="stat"><b>{preorders?.n ?? 0}</b><span>Pre-orders ({newPre?.n ?? 0} new)</span></Link>
        <Link href="/admin/quotes" className="stat"><b>{quotes?.n ?? 0}</b><span>Business quotes ({newQuotes?.n ?? 0} new)</span></Link>
        <Link href="/admin/customers" className="stat"><b>{customers?.n ?? 0}</b><span>Customer accounts</span></Link>
        <Link href="/admin/customers" className="stat"><b>{consented?.n ?? 0}</b><span>Agreed to marketing emails</span></Link>
      </div>
      <h2>Shop</h2>
      <p className="muted">{products?.n ?? 0} active products. <Link href="/admin/products" className="link">Manage products & photos →</Link></p>
    </>
  );
}
