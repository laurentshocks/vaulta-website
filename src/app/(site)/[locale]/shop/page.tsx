import Link from "next/link";
import { getDict } from "@/lib/i18n";
import { listProducts } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

const FILTERS = ["all", "fingerprint", "backpack", "small", "business"] as const;
type Filter = (typeof FILTERS)[number];

export default async function Shop({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ f?: string }>;
}) {
  const { locale, t } = await getDict(params);
  const { f } = await searchParams;
  const filter: Filter = (FILTERS as readonly string[]).includes(f ?? "") ? (f as Filter) : "all";
  const all = await listProducts(locale);
  const products = all.filter((p) =>
    filter === "all" ? true : filter === "fingerprint" ? !!p.has_fingerprint : p.category === filter
  );

  return (
    <section>
      <div className="container">
        <div className="shop-head">
          <div>
            <p className="eyebrow">{t.shop.eyebrow}</p>
            <h1 className="section-title">{t.shop.title}</h1>
            <p className="section-lead">{t.shop.lead}</p>
          </div>
          <div className="filters">
            {FILTERS.map((key) => (
              <Link
                key={key}
                href={key === "all" ? `/${locale}/shop` : `/${locale}/shop?f=${key}`}
                className={`filter${filter === key ? " active" : ""}`}
                scroll={false}
              >
                {t.shop.filters[key]}
              </Link>
            ))}
          </div>
        </div>
        {products.length ? (
          <div className="products">
            {products.map((p) => <ProductCard key={p.id} p={p} locale={locale} t={t} />)}
          </div>
        ) : (
          <p className="muted" style={{ marginTop: 36 }}>{t.shop.empty}</p>
        )}
      </div>
    </section>
  );
}
