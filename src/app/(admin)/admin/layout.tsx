import type { ReactNode } from "react";
import Link from "next/link";
import "../../globals.css";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "VAULTA Admin", robots: { index: false } };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireAdmin();
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="admin-shell">
          <aside className="admin-side">
            <Link href="/admin" className="logo">VAUL<span>TA</span></Link>
            <Link href="/admin" className="item">Dashboard</Link>
            <Link href="/admin/products" className="item">Products & photos</Link>
            <Link href="/admin/preorders" className="item">Pre-orders</Link>
            <Link href="/admin/quotes" className="item">Business quotes</Link>
            <Link href="/admin/customers" className="item">Customers</Link>
            <Link href="/en" className="item">← View website</Link>
            <span className="muted" style={{ fontSize: ".78rem", margin: "16px 12px 0" }}>{user.email}</span>
          </aside>
          <main className="admin-main">{children}</main>
        </div>
      </body>
    </html>
  );
}
