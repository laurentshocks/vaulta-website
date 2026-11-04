import Link from "next/link";
import { redirect } from "next/navigation";
import { getDict } from "@/lib/i18n";
import { getUser } from "@/lib/auth";
import { db, euro } from "@/lib/db";
import { deleteAccount, logout, setMarketing } from "@/app/actions";

type Order = {
  id: number; product_id: string; name: string | null; quantity: number;
  unit_price_cents: number; discount_code: string | null; status: string; created_at: string;
};

export default async function Account({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ welcome?: string; error?: string }>;
}) {
  const { locale, t } = await getDict(params);
  const { welcome, error } = await searchParams;
  const user = await getUser();
  if (!user) redirect(`/${locale}/account/login`);

  const d = await db();
  const { results: orders } = await d
    .prepare(
      `SELECT o.id, o.product_id, COALESCE(t.name, o.product_id) AS name, o.quantity, o.unit_price_cents,
              o.discount_code, o.status, o.created_at
       FROM preorders o LEFT JOIN product_translations t ON t.product_id = o.product_id AND t.locale = ?
       WHERE o.user_id = ? ORDER BY o.id DESC`
    )
    .bind(locale, user.id)
    .all<Order>();

  const statusText = (s: string) => t.account.status[s as keyof typeof t.account.status] ?? s;

  return (
    <section>
      <div className="container">
        <p className="eyebrow">{t.nav.account}</p>
        <h1 className="section-title">{t.account.hello} {user.name}</h1>
        {welcome && <p className="alert ok" style={{ maxWidth: 640 }}>{t.account.welcomeNew}</p>}
        {error === "notadmin" && <p className="alert err" style={{ maxWidth: 640 }}>{t.account.errors.notadmin}</p>}
        {user.role === "admin" && <p style={{ marginTop: 10 }}><Link href="/admin" className="link">{t.account.admin}</Link></p>}

        <div className="acc-grid">
          <div className="card">
            <h3>{t.account.codeTitle}</h3>
            <div className="code">{user.welcome_code}</div>
            <p className="muted" style={{ fontSize: ".9rem" }}>
              {user.welcome_code_used ? t.account.codeUsed : t.account.codeText}
            </p>
          </div>

          <div className="card">
            <h3>{t.account.marketingTitle}</h3>
            <p className="muted" style={{ fontSize: ".9rem", margin: "8px 0 16px" }}>
              {user.marketing_consent ? t.account.marketingOn : t.account.marketingOff}
            </p>
            <form action={setMarketing}>
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="on" value={user.marketing_consent ? "0" : "1"} />
              <button className="btn btn-ghost btn-sm" type="submit">
                {user.marketing_consent ? t.account.unsubscribe : t.account.subscribe}
              </button>
            </form>
          </div>
        </div>

        <div className="card" style={{ marginTop: 20 }}>
          <h3 style={{ marginBottom: 12 }}>{t.account.ordersTitle}</h3>
          {orders.length ? (
            <table className="table">
              <tbody>
                {orders.map((o) => {
                  const total = o.unit_price_cents * o.quantity * (o.discount_code ? 0.9 : 1);
                  return (
                    <tr key={o.id}>
                      <td>#{o.id}</td>
                      <td><Link href={`/${locale}/product/${o.product_id}`}>{o.name}</Link> × {o.quantity}</td>
                      <td>{euro(Math.round(total), locale)}{o.discount_code ? " (−10%)" : ""}</td>
                      <td>{o.created_at.slice(0, 10)}</td>
                      <td><span className={`status ${o.status}`}>{statusText(o.status)}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="muted">{t.account.noOrders}</p>
          )}
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap", alignItems: "center" }}>
          <form action={logout}>
            <input type="hidden" name="locale" value={locale} />
            <button className="btn btn-ghost" type="submit">{t.account.logout}</button>
          </form>
        </div>

        <details style={{ marginTop: 40, maxWidth: 640 }}>
          <summary>{t.account.deleteTitle}</summary>
          <p>{t.account.deleteText}</p>
          <form action={deleteAccount} style={{ marginTop: 14 }}>
            <input type="hidden" name="locale" value={locale} />
            <button className="btn btn-danger btn-sm" type="submit">{t.account.deleteBtn}</button>
          </form>
        </details>
      </div>
    </section>
  );
}
