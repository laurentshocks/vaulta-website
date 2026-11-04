import { db } from "@/lib/db";

type Row = {
  id: number; email: string; name: string; role: string; locale: string; marketing_consent: number;
  marketing_consent_at: string | null; welcome_code: string; welcome_code_used: number; created_at: string; orders: number;
};

export default async function Customers() {
  const d = await db();
  const { results } = await d
    .prepare(
      `SELECT u.id, u.email, u.name, u.role, u.locale, u.marketing_consent, u.marketing_consent_at,
              u.welcome_code, u.welcome_code_used, u.created_at,
              (SELECT COUNT(*) FROM preorders o WHERE o.user_id = u.id) AS orders
       FROM users u ORDER BY u.id DESC LIMIT 1000`
    )
    .all<Row>();
  const consented = results.filter((r) => r.marketing_consent).length;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h1>Customers</h1>
        <a href="/admin/export" className="btn btn-primary btn-sm">Download marketing list (CSV)</a>
      </div>
      <p className="muted" style={{ marginBottom: 16, fontSize: ".9rem" }}>
        {results.length} accounts · {consented} agreed to marketing emails. The CSV only contains people who agreed, by language,
        ready to import into an email tool (e.g. Brevo, Mailchimp).
      </p>
      <div className="card" style={{ padding: 8, overflowX: "auto" }}>
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Lang</th><th>Marketing</th><th>10% code</th><th>Pre-orders</th><th>Joined</th></tr>
          </thead>
          <tbody>
            {results.map((u) => (
              <tr key={u.id}>
                <td>{u.name}{u.role === "admin" && <span className="status confirmed" style={{ marginLeft: 6 }}>admin</span>}</td>
                <td>{u.email}</td>
                <td>{u.locale.toUpperCase()}</td>
                <td>{u.marketing_consent ? <span className="status shipped">Yes</span> : <span className="status">No</span>}</td>
                <td>{u.welcome_code}{u.welcome_code_used ? " (used)" : ""}</td>
                <td>{u.orders}</td>
                <td>{u.created_at.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
