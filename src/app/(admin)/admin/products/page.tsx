import Link from "next/link";
import { listProducts } from "@/lib/products";
import { euro, imgUrl } from "@/lib/db";

export default async function AdminProducts({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const { deleted } = await searchParams;
  const products = await listProducts("en", { includeInactive: true });
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Products & photos</h1>
        <Link href="/admin/products/new" className="btn btn-primary btn-sm">+ New product</Link>
      </div>
      {deleted && <p className="alert ok" style={{ marginBottom: 16 }}>Product deleted.</p>}
      <div className="card" style={{ padding: 8 }}>
        <table className="table">
          <thead>
            <tr><th></th><th>Product</th><th>SKU</th><th>Category</th><th>Price</th><th>Photos</th><th>Status</th></tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.images[0] && <img className="thumb" src={imgUrl(p.images[0].r2_key)} alt="" />}</td>
                <td><Link href={`/admin/products/${p.id}`} className="link">{p.name}</Link></td>
                <td>{p.sku}</td>
                <td>{p.category}</td>
                <td>{euro(p.price_cents, "en")}</td>
                <td>{p.images.length}</td>
                <td>{p.active ? <span className="status shipped">Live</span> : <span className="status">Hidden</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
