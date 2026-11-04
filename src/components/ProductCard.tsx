import Link from "next/link";
import type { Product } from "@/lib/products";
import type { Dict, Locale } from "@/lib/i18n";
import { euro, imgUrl } from "@/lib/db";

export default function ProductCard({ p, locale, t }: { p: Product; locale: Locale; t: Dict }) {
  const href = `/${locale}/product/${p.id}`;
  const main = p.images[0];
  return (
    <article className="product">
      <Link href={href} className={`photo${p.fill_photo ? " fill" : ""}`}>
        {p.ribbon && <span className={`ribbon${p.hot ? " hot" : ""}`}>{p.ribbon}</span>}
        {main && <img src={imgUrl(main.r2_key)} alt={p.name} loading="lazy" />}
      </Link>
      <div className="product-body">
        <span className="sku">{p.sku}</span>
        <h3>{p.name}</h3>
        <p className="desc">{p.description}</p>
        <div className="chips">
          {p.chips.map((c, i) => (
            <span key={c} className={`chip${i > 1 ? " grey" : ""}`}>{c}</span>
          ))}
        </div>
        <div className="price-row">
          <div className="price">
            {euro(p.price_cents, locale)}
            <small>{t.shop.inclVat}</small>
          </div>
          <Link href={href} className="btn btn-primary btn-sm">{t.shop.details}</Link>
        </div>
      </div>
    </article>
  );
}
