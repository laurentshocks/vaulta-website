import Link from "next/link";
import { redirect } from "next/navigation";
import { getDict } from "@/lib/i18n";
import { getUser } from "@/lib/auth";
import { register } from "@/app/actions";

export default async function Register({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale, t } = await getDict(params);
  const { error } = await searchParams;
  if (await getUser()) redirect(`/${locale}/account`);
  const msg = error ? t.account.errors[error as keyof typeof t.account.errors] : null;

  return (
    <div className="auth">
      <h1>{t.account.registerTitle}</h1>
      <p className="muted">{t.account.registerLead}</p>
      <div className="card" style={{ marginTop: 20 }}>
        {msg && <p className="alert err" style={{ marginBottom: 14 }}>{msg}</p>}
        <form action={register} className="stack">
          <input type="hidden" name="locale" value={locale} />
          <label>{t.account.name}<input name="name" required autoComplete="name" /></label>
          <label>{t.account.email}<input type="email" name="email" required autoComplete="email" /></label>
          <label>{t.account.password}
            <input type="password" name="password" required minLength={8} autoComplete="new-password" placeholder={t.account.passwordHint} />
          </label>
          {/* Marketing consent: separate, optional and unticked (GDPR) */}
          <label className="check"><input type="checkbox" name="marketing" /> {t.account.marketing}</label>
          <p className="muted" style={{ fontSize: ".8rem" }}>{t.account.privacy}</p>
          <button className="btn btn-primary" type="submit">{t.account.registerBtn}</button>
        </form>
      </div>
      <p className="muted" style={{ marginTop: 18, textAlign: "center" }}>
        {t.account.haveAccount} <Link href={`/${locale}/account/login`} className="link">{t.account.loginBtn}</Link>
      </p>
    </div>
  );
}
