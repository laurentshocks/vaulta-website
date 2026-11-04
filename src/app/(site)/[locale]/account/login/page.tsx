import Link from "next/link";
import { redirect } from "next/navigation";
import { getDict } from "@/lib/i18n";
import { getUser } from "@/lib/auth";
import { login } from "@/app/actions";

export default async function Login({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { locale, t } = await getDict(params);
  const { error, next } = await searchParams;
  if (await getUser()) redirect(next?.startsWith("/") && !next.startsWith("//") ? next : `/${locale}/account`);
  const msg = error ? t.account.errors[error as keyof typeof t.account.errors] : null;

  return (
    <div className="auth">
      <h1>{t.account.loginTitle}</h1>
      <div className="card" style={{ marginTop: 20 }}>
        {msg && <p className="alert err" style={{ marginBottom: 14 }}>{msg}</p>}
        <form action={login} className="stack">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="next" value={next ?? ""} />
          <label>{t.account.email}<input type="email" name="email" required autoComplete="email" /></label>
          <label>{t.account.password}<input type="password" name="password" required autoComplete="current-password" /></label>
          <button className="btn btn-primary" type="submit">{t.account.loginBtn}</button>
        </form>
      </div>
      <p className="muted" style={{ marginTop: 18, textAlign: "center" }}>
        {t.account.noAccount} <Link href={`/${locale}/account/register`} className="link">{t.account.registerBtn}</Link>
      </p>
    </div>
  );
}
