import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { dictFor, getDict } from "@/lib/i18n";
import { getProduct } from "@/lib/products";
import { getUser } from "@/lib/auth";
import { euro, imgUrl } from "@/lib/db";
import Gallery from "@/components/Gallery";
import { preorder } from "@/app/actions";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const p = await getProduct(slug, locale);
  return p ? { title: `${p.name} — VAULTA`, description: p.description } : { title: dictFor(locale).meta.title };
}

export default async function ProductPage({ params, searchParams }: Props) {
  const { locale, t } = await getDict(params);
  const { slug } = await params;
  const { ok, error } = await searchParams;
  const [p, user] = await Promise.all([getProduct(slug, locale), getUser()]);
  if (!p) notFound();

  const hasCode = user && !user.welcome_code_used;
  const specs: [string, string | null][] = [
    [t.product.specs.dimensions, p.dimensions],
    [t.product.specs.weight, p.weight],
    [t.product.specs.volume, p.volume],
    [t.product.specs.materials, p.materials],
    [t.product.specs.colours, p.colours],
  ];

  return (
    <section style={{ paddingTop: 0 }}>
      <div className="container">
        <p style={{ paddingTop: 28 }}>
          <Link href={`/${locale}/shop`} className="muted">{t.product.back}</Link>
        </p>
        <div className="pdp">
          <Gallery images={p.images.map((i) => imgUrl(i.r2_key))} name={p.name} fillFirst={!!p.fill_photo} />

          <div>
            <span className="sku">{p.sku}</span>
            <h1>{p.name}</h1>
            <div className="chips">
              {p.chips.map((c, i) => <span key={c} className={`chip${i > 1 ? " grey" : ""}`}>{c}</span>)}
            </div>
            <p className="muted">{p.description}</p>
            <ul className="points">{p.points.map((pt) => <li key={pt}>{pt}</li>)}</ul>
            <table className="specs">
              <tbody>
                {specs.filter(([, v]) => v).map(([k, v]) => (
                  <tr key={k}><th>{k}</th><td>{v}</td></tr>
                ))}
              </tbody>
            </table>

            <div className="card" id="preorder">
              <div className="price-row" style={{ marginBottom: 6 }}>
                <div>
                  <div className="big-price">{euro(p.price_cents, locale)}</div>
                  <span className="muted" style={{ fontSize: ".8rem" }}>{t.shop.inclVat}</span>
                </div>
                {hasCode ? (
                  <div className="discount" style={{ textAlign: "right" }}>
                    {t.product.withCode}<br />
                    <strong>{euro(Math.round(p.price_cents * 0.9), locale)}</strong> (−10%)
                  </div>
                ) : !user ? (
                  <Link href={`/${locale}/account/register`} className="link" style={{ fontSize: ".9rem" }}>{t.product.loginForDiscount}</Link>
                ) : null}
              </div>
              <h3 style={{ margin: "18px 0 4px" }}>{t.product.preorderTitle}</h3>
              <p className="muted" style={{ fontSize: ".9rem", marginBottom: 16 }}>{t.product.preorderLead}</p>

              {ok && <p className="alert ok" style={{ marginBottom: 14 }}>{t.product.ok}</p>}
              {error && <p className="alert err" style={{ marginBottom: 14 }}>{t.account.errors.missing}</p>}

              <form action={preorder} className="stack">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="product" value={p.id} />
                <div className="form-row">
                  <label>{t.product.name}<input name="name" required defaultValue={user?.name ?? ""} /></label>
                  <label>{t.product.email}<input type="email" name="email" required defaultValue={user?.email ?? ""} /></label>
                </div>
                <label>{t.product.quantity}
                  <select name="quantity" defaultValue="1">
                    {Array.from({ length: 10 }, (_, i) => <option key={i + 1}>{i + 1}</option>)}
                  </select>
                </label>
                <label className="check"><input type="checkbox" name="consent" required /> {t.product.consent}</label>
                <button className="btn btn-primary" type="submit">{t.product.submit}</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
