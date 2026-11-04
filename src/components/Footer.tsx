import Link from "next/link";
import type { Dict, Locale } from "@/lib/i18n";

export default function Footer({ locale, t }: { locale: Locale; t: Dict }) {
  return (
    <footer className="site">
      <div className="container footer-grid">
        <div>
          <Link href={`/${locale}`} className="logo">VAUL<span>TA</span></Link>
          <p style={{ marginTop: 8 }}>© {new Date().getFullYear()} VAULTA. {t.footer.rights}</p>
        </div>
        <div className="footer-links">
          {/* Legally required in the EU — create these pages before launch */}
          <a href="#">{t.footer.imprint}</a>
          <a href="#">{t.footer.privacy}</a>
          <a href="#">{t.footer.terms}</a>
          <a href="#">{t.footer.returns}</a>
          <a href="mailto:hello@example.com">{t.footer.contact}</a>
        </div>
      </div>
    </footer>
  );
}
