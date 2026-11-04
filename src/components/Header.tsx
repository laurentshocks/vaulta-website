import Link from "next/link";
import type { Dict, Locale } from "@/lib/i18n";
import type { User } from "@/lib/auth";
import LangSwitcher from "./LangSwitcher";
import MobileMenu from "./MobileMenu";

export default function Header({ locale, t, user }: { locale: Locale; t: Dict; user: User | null }) {
  return (
    <header className="site">
      <div className="container nav">
        <Link href={`/${locale}`} className="logo">VAUL<span>TA</span></Link>
        <MobileMenu label={t.nav.menu}>
          <Link href={`/${locale}/shop`}>{t.nav.shop}</Link>
          <Link href={`/${locale}/business`}>{t.nav.business}</Link>
          <Link href={`/${locale}#faq`}>{t.nav.faq}</Link>
          <Link href={user ? `/${locale}/account` : `/${locale}/account/login`}>
            {user ? t.nav.account : t.nav.login}
          </Link>
          {user?.role === "admin" && <Link href="/admin">Admin</Link>}
        </MobileMenu>
        <div className="nav-right">
          <LangSwitcher current={locale} />
          <Link href={`/${locale}/shop`} className="btn btn-primary btn-sm">{t.nav.preorder}</Link>
        </div>
      </div>
    </header>
  );
}
