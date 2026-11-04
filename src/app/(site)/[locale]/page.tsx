import Link from "next/link";
import { getDict } from "@/lib/i18n";
import { listProducts } from "@/lib/products";
import { getUser } from "@/lib/auth";
import { imgUrl } from "@/lib/db";
import ProductCard from "@/components/ProductCard";

const protectImages = [
  "products/leather-lock.jpg",
  "products/securetrack-cut.jpg",
  "products/metrosecure-findmy.jpg",
  "products/shield-rfid.jpg",
];

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, t } = await getDict(params);
  const [products, user] = await Promise.all([listProducts(locale), getUser()]);
  const featured = products.filter((p) => p.featured).slice(0, 3);

  return (
    <>
      <section className="hero">
        <div className="hero-img" style={{ backgroundImage: `url(${imgUrl("site/hero.jpg")})` }} role="img" aria-label="" />
        <div className="container">
          <p className="eyebrow">{t.hero.eyebrow}</p>
          <h1>
            {t.hero.title1} <em>{t.hero.accent}</em>
            <br />
            {t.hero.title2}
          </h1>
          <p className="lead">{t.hero.lead}</p>
          <div className="hero-ctas">
            <Link href={`/${locale}/shop`} className="btn btn-primary">{t.hero.ctaShop}</Link>
            <Link href={`/${locale}/business`} className="btn btn-ghost">{t.hero.ctaBusiness}</Link>
          </div>
          <div className="badges">
            {t.hero.badges.map((b) => <span key={b} className="badge">{b}</span>)}
          </div>
        </div>
      </section>

      <section className="soft">
        <div className="container">
          <p className="eyebrow">{t.protect.eyebrow}</p>
          <h2 className="section-title">{t.protect.title}</h2>
          <p className="section-lead">{t.protect.lead}</p>
          <div className="protect-grid">
            {t.protect.items.map((item, i) => (
              <article className="protect" key={item.title}>
                <img src={imgUrl(protectImages[i])} alt={item.title} loading="lazy" />
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="shop-head">
            <div>
              <p className="eyebrow">{t.featured.eyebrow}</p>
              <h2 className="section-title">{t.featured.title}</h2>
            </div>
            <Link href={`/${locale}/shop`} className="btn btn-ghost">{t.featured.all}</Link>
          </div>
          <div className="products">
            {featured.map((p) => <ProductCard key={p.id} p={p} locale={locale} t={t} />)}
          </div>
          {!user && (
            <div className="welcome" style={{ marginTop: 40 }}>
              <div>
                <h3>{t.welcome.title}</h3>
                <p>{t.welcome.text}</p>
              </div>
              <Link href={`/${locale}/account/register`} className="btn btn-primary">{t.welcome.cta}</Link>
            </div>
          )}
        </div>
      </section>

      <section className="soft">
        <div className="container biz-grid">
          <div>
            <p className="eyebrow">{t.biz.eyebrow}</p>
            <h2 className="section-title">{t.biz.title}</h2>
            <p className="section-lead">{t.biz.lead}</p>
            <Link href={`/${locale}/business`} className="btn btn-primary" style={{ marginTop: 24 }}>{t.biz.formTitle}</Link>
          </div>
          <div className="biz-photo" style={{ marginTop: 0 }}>
            <img src={imgUrl("products/commuter-lifestyle.jpg")} alt="" loading="lazy" />
          </div>
        </div>
      </section>

      <section id="faq">
        <div className="container">
          <p className="eyebrow">{t.faq.eyebrow}</p>
          <h2 className="section-title">{t.faq.title}</h2>
          <div className="faq-list">
            {t.faq.items.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
