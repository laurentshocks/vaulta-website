import { getDict } from "@/lib/i18n";
import { listProducts } from "@/lib/products";
import { getUser } from "@/lib/auth";
import { imgUrl } from "@/lib/db";
import { requestQuote } from "@/app/actions";

export default async function Business({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { locale, t } = await getDict(params);
  const { ok, error } = await searchParams;
  const [products, user] = await Promise.all([listProducts(locale), getUser()]);

  return (
    <section>
      <div className="container biz-grid">
        <div>
          <p className="eyebrow">{t.biz.eyebrow}</p>
          <h1 className="section-title">{t.biz.title}</h1>
          <p className="section-lead">{t.biz.lead}</p>
          <ul className="biz-list">
            {t.biz.points.map((pt) => (
              <li key={pt.title}>
                <div className="dot" />
                <div><strong>{pt.title}</strong><span>{pt.text}</span></div>
              </li>
            ))}
          </ul>
          <div className="biz-photo">
            <img src={imgUrl("products/commuter-lifestyle.jpg")} alt="" loading="lazy" />
          </div>
        </div>

        <div className="card" id="quote">
          <h2 style={{ fontSize: "1.3rem", marginBottom: 6 }}>{t.biz.formTitle}</h2>
          <p className="muted" style={{ fontSize: ".9rem", marginBottom: 20 }}>{t.biz.formLead}</p>
          {ok && <p className="alert ok" style={{ marginBottom: 14 }}>{t.biz.ok}</p>}
          {error && <p className="alert err" style={{ marginBottom: 14 }}>{t.account.errors.missing}</p>}
          <form action={requestQuote} className="stack">
            <input type="hidden" name="locale" value={locale} />
            <div className="form-row">
              <label>{t.biz.company}<input name="company" required defaultValue={user?.company ?? ""} /></label>
              <label>{t.biz.name}<input name="name" required defaultValue={user?.name ?? ""} /></label>
            </div>
            <div className="form-row">
              <label>{t.biz.email}<input type="email" name="email" required defaultValue={user?.email ?? ""} /></label>
              <label>{t.biz.country}<input name="country" /></label>
            </div>
            <div className="form-row">
              <label>{t.biz.model}
                <select name="product">
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                </select>
              </label>
              <label>{t.biz.quantity}
                <select name="quantity">
                  <option>10–49</option><option>50–199</option><option>200–999</option><option>1000+</option>
                </select>
              </label>
            </div>
            <label>{t.biz.message}<textarea name="message" /></label>
            <label className="check"><input type="checkbox" name="consent" required /> {t.biz.consent}</label>
            <button className="btn btn-primary" type="submit">{t.biz.submit}</button>
          </form>
        </div>
      </div>
    </section>
  );
}
