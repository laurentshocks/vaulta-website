import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, type Product } from "@/lib/products";
import { imgUrl } from "@/lib/db";
import { locales } from "@/lib/i18n";
import { deleteImage, deleteProduct, makeMainImage, saveProduct, uploadImages } from "../../actions";

const LANG = { fr: "Français", nl: "Nederlands", en: "English" } as const;

export default async function EditProduct({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; uploaded?: string; error?: string }>;
}) {
  const { id } = await params;
  const { saved, uploaded, error } = await searchParams;
  const isNew = id === "new";

  let base: Product | null = null;
  const tr: Partial<Record<(typeof locales)[number], Product>> = {};
  if (!isNew) {
    base = await getProduct(id, "en", { includeInactive: true });
    if (!base) notFound();
    for (const l of locales) tr[l] = (await getProduct(id, l, { includeInactive: true })) ?? undefined;
  }

  return (
    <>
      <p><Link href="/admin/products" className="muted">← All products</Link></p>
      <h1 style={{ marginTop: 8 }}>{isNew ? "New product" : base!.name}</h1>
      {saved && <p className="alert ok" style={{ marginBottom: 16 }}>Saved. The website is updated.</p>}
      {uploaded && <p className="alert ok" style={{ marginBottom: 16 }}>Photos uploaded.</p>}
      {error && <p className="alert err" style={{ marginBottom: 16 }}>Could not save: {error === "exists" ? "this ID is already used" : error === "price" ? "check the price" : "check the ID"}.</p>}

      <form action={saveProduct} className="stack">
        <input type="hidden" name="isNew" value={isNew ? "1" : "0"} />
        <div className="card stack" style={{ display: "grid", gap: 14 }}>
          <h3>Details</h3>
          <div className="form-row">
            <label>ID (used in the web address){isNew ? <input name="id" required placeholder="e.g. metrosecure-pro" /> : <input name="id" value={id} readOnly />}</label>
            <label>SKU / model number<input name="sku" required defaultValue={base?.sku} /></label>
          </div>
          <div className="form-row">
            <label>Category
              <select name="category" defaultValue={base?.category ?? "backpack"}>
                <option value="backpack">Backpack</option>
                <option value="small">Crossbody & clutch</option>
                <option value="business">Business</option>
              </select>
            </label>
            <label>Price incl. VAT (€)<input name="price" required inputMode="decimal" defaultValue={base ? (base.price_cents / 100).toString() : ""} /></label>
          </div>
          <div className="form-row">
            <label>Ribbon on photo (optional)<input name="ribbon" defaultValue={base?.ribbon ?? ""} placeholder="e.g. New" /></label>
            <label>Order in the shop (lower = first)<input name="sort" type="number" defaultValue={base?.sort ?? 100} /></label>
          </div>
          <div className="form-row">
            <label>Dimensions<input name="dimensions" defaultValue={base?.dimensions ?? ""} /></label>
            <label>Weight<input name="weight" defaultValue={base?.weight ?? ""} /></label>
          </div>
          <div className="form-row">
            <label>Volume<input name="volume" defaultValue={base?.volume ?? ""} /></label>
            <div />
          </div>
          <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
            <label className="check"><input type="checkbox" name="active" defaultChecked={isNew || !!base?.active} /> Visible in the shop</label>
            <label className="check"><input type="checkbox" name="featured" defaultChecked={!!base?.featured} /> Show on home page</label>
            <label className="check"><input type="checkbox" name="has_fingerprint" defaultChecked={!!base?.has_fingerprint} /> Fingerprint lock</label>
            <label className="check"><input type="checkbox" name="hot" defaultChecked={!!base?.hot} /> Orange ribbon</label>
            <label className="check"><input type="checkbox" name="fill_photo" defaultChecked={!!base?.fill_photo} /> Main photo has its own background</label>
          </div>
        </div>

        <div className="tabs3">
          {locales.map((l) => {
            const t = tr[l];
            return (
              <div className="card" key={l} style={{ display: "grid", gap: 12, alignContent: "start" }}>
                <h3>{LANG[l]}</h3>
                <label>Name<input name={`${l}_name`} defaultValue={t?.name ?? ""} required={l === "en"} /></label>
                <label>Short description<textarea name={`${l}_description`} defaultValue={t?.description ?? ""} /></label>
                <label>Bullet points (one per line)<textarea name={`${l}_points`} defaultValue={t?.points.join("\n") ?? ""} style={{ minHeight: 120 }} /></label>
                <label>Tags (comma separated)<input name={`${l}_chips`} defaultValue={t?.chips.join(", ") ?? ""} /></label>
                <label>Materials<input name={`${l}_materials`} defaultValue={t?.materials ?? ""} /></label>
                <label>Colours<input name={`${l}_colours`} defaultValue={t?.colours ?? ""} /></label>
              </div>
            );
          })}
        </div>
        <div><button className="btn btn-primary" type="submit">{isNew ? "Create product" : "Save changes"}</button></div>
      </form>

      {!isNew && base && (
        <>
          <h2 id="photos">Photos</h2>
          <p className="muted" style={{ marginBottom: 14, fontSize: ".9rem" }}>The first photo is the main one in the shop. JPG, PNG or WebP, max 8 MB each.</p>
          <div className="img-grid">
            {base.images.map((img, i) => (
              <div className="img-item" key={img.id}>
                <img src={imgUrl(img.r2_key)} alt="" />
                <div className="row">
                  {i === 0 ? (
                    <span className="status shipped">Main</span>
                  ) : (
                    <form action={makeMainImage}>
                      <input type="hidden" name="id" value={id} />
                      <input type="hidden" name="imageId" value={img.id} />
                      <button className="btn btn-ghost btn-sm" type="submit">Main</button>
                    </form>
                  )}
                  <form action={deleteImage}>
                    <input type="hidden" name="id" value={id} />
                    <input type="hidden" name="imageId" value={img.id} />
                    <button className="btn btn-danger btn-sm" type="submit">Delete</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
          <form action={uploadImages} className="card" style={{ marginTop: 16, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <input type="hidden" name="id" value={id} />
            <input type="file" name="files" accept="image/jpeg,image/png,image/webp" multiple required style={{ maxWidth: 360 }} />
            <button className="btn btn-primary btn-sm" type="submit">Upload photos</button>
          </form>

          <h2>Danger zone</h2>
          <form action={deleteProduct}>
            <input type="hidden" name="id" value={id} />
            <button className="btn btn-danger btn-sm" type="submit">Delete this product</button>
            <span className="muted" style={{ fontSize: ".85rem", marginLeft: 12 }}>Tip: untick "Visible in the shop" to hide it without deleting.</span>
          </form>
        </>
      )}
    </>
  );
}
