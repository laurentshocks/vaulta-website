import { db } from "@/lib/db";
import { setQuoteStatus } from "../actions";

type Row = {
  id: number; company: string; name: string; email: string; country: string | null; product: string | null;
  quantity_range: string | null; message: string | null; locale: string; status: string; created_at: string;
};

export default async function Quotes() {
  const d = await db();
  const { results } = await d
    .prepare(
      `SELECT q.*, COALESCE(t.name, q.product_id) AS product FROM quotes q
       LEFT JOIN product_translations t ON t.product_id = q.product_id AND t.locale = 'en'
       ORDER BY q.id DESC LIMIT 500`
    )
    .all<Row>();

  return (
    <>
      <h1>Business quotes</h1>
      <div className="card" style={{ padding: 8, overflowX: "auto" }}>
        {results.length ? (
          <table className="table">
            <thead>
              <tr><th>#</th><th>Date</th><th>Company</th><th>Contact</th><th>Request</th><th>Status</th></tr>
            </thead>
            <tbody>
              {results.map((q) => (
                <tr key={q.id}>
                  <td>{q.id}</td>
                  <td>{q.created_at.slice(0, 16)}</td>
                  <td>{q.company}<br /><span className="muted" style={{ fontSize: ".8rem" }}>{q.country} · {q.locale.toUpperCase()}</span></td>
                  <td>{q.name}<br /><a href={`mailto:${q.email}`} className="link" style={{ fontSize: ".82rem" }}>{q.email}</a></td>
                  <td>{q.product} · {q.quantity_range}{q.message ? <><br /><span className="muted" style={{ fontSize: ".82rem" }}>{q.message}</span></> : null}</td>
                  <td>
                    <form action={setQuoteStatus} style={{ display: "flex", gap: 6 }}>
                      <input type="hidden" name="id" value={q.id} />
                      <select name="status" defaultValue={q.status} style={{ padding: "6px 8px", width: 120 }}>
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="won">Won</option>
                        <option value="lost">Lost</option>
                      </select>
                      <button className="btn btn-ghost btn-sm" type="submit">Save</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="muted" style={{ padding: 16 }}>No quote requests yet.</p>
        )}
      </div>
    </>
  );
}
