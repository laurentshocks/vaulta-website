import { db, euro } from "@/lib/db";
import { setPreorderStatus } from "../actions";

type Row = {
  id: number; product: string; quantity: number; name: string; email: string; locale: string;
  unit_price_cents: number; discount_code: string | null; status: string; created_at: string; user_id: number | null;
};

export default async function Preorders() {
  const d = await db();
  const { results } = await d
    .prepare(
      `SELECT o.*, COALESCE(t.name, o.product_id) AS product FROM preorders o
       LEFT JOIN product_translations t ON t.product_id = o.product_id AND t.locale = 'en'
       ORDER BY o.id DESC LIMIT 500`
    )
    .all<Row>();

  return (
    <>
      <h1>Pre-orders</h1>
      <div className="card" style={{ padding: 8, overflowX: "auto" }}>
        {results.length ? (
          <table className="table">
            <thead>
              <tr><th>#</th><th>Date</th><th>Customer</th><th>Product</th><th>Total</th><th>Lang</th><th>Status</th></tr>
            </thead>
            <tbody>
              {results.map((o) => {
                const total = o.unit_price_cents * o.quantity * (o.discount_code ? 0.9 : 1);
                return (
                  <tr key={o.id}>
                    <td>{o.id}</td>
                    <td>{o.created_at.slice(0, 16)}</td>
                    <td>{o.name}<br /><a href={`mailto:${o.email}`} className="link" style={{ fontSize: ".82rem" }}>{o.email}</a>{o.user_id ? <span className="muted" style={{ fontSize: ".75rem" }}> · account</span> : null}</td>
                    <td>{o.product} × {o.quantity}</td>
                    <td>{euro(Math.round(total), "en")}{o.discount_code ? <><br /><span className="muted" style={{ fontSize: ".75rem" }}>{o.discount_code} (−10%)</span></> : null}</td>
                    <td>{o.locale.toUpperCase()}</td>
                    <td>
                      <form action={setPreorderStatus} style={{ display: "flex", gap: 6 }}>
                        <input type="hidden" name="id" value={o.id} />
                        <select name="status" defaultValue={o.status} style={{ padding: "6px 8px", width: 120 }}>
                          <option value="new">New</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button className="btn btn-ghost btn-sm" type="submit">Save</button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="muted" style={{ padding: 16 }}>No pre-orders yet.</p>
        )}
      </div>
    </>
  );
}
