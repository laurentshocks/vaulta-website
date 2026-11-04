"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, localeNames, type Locale } from "@/lib/i18n";

/** FR / NL / EN buttons: keep the same page, swap the language part of the URL */
export default function LangSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname() || `/${current}`;
  const rest = pathname.split("/").slice(2).join("/");
  return (
    <div className="langs">
      {locales.map((l) => (
        <Link key={l} href={`/${l}${rest ? "/" + rest : ""}`} className={l === current ? "active" : ""} hrefLang={l}>
          {localeNames[l]}
        </Link>
      ))}
    </div>
  );
}
