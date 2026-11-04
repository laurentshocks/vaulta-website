import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { dictFor, isLocale, locales } from "@/lib/i18n";
import { getUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Props = { children: ReactNode; params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = dictFor(locale);
  return {
    title: t.meta.title,
    description: t.meta.description,
    alternates: { languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])) },
  };
}

export default async function SiteLayout({ children, params }: Props) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : "en";
  const t = dictFor(locale);
  const user = await getUser();
  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Header locale={locale} t={t} user={user} />
        <main>{children}</main>
        <Footer locale={locale} t={t} />
      </body>
    </html>
  );
}
