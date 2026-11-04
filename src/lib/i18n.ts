import { notFound } from "next/navigation";
import en from "@/messages/en";
import fr from "@/messages/fr";
import nl from "@/messages/nl";

export const locales = ["fr", "nl", "en"] as const;
export type Locale = (typeof locales)[number];
export type Dict = typeof en;

const dicts: Record<Locale, Dict> = { en, fr, nl };

export const localeNames: Record<Locale, string> = { fr: "FR", nl: "NL", en: "EN" };

export function isLocale(v: string): v is Locale {
  return (locales as readonly string[]).includes(v);
}

/** Validates the [locale] part of the URL and returns the matching texts */
export async function getDict(params: Promise<{ locale: string }>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return { locale, t: dicts[locale] };
}

export function dictFor(locale: string): Dict {
  return isLocale(locale) ? dicts[locale] : en;
}

/** Picks fr / nl / en from the browser's Accept-Language header */
export function pickLocale(acceptLanguage: string | null): Locale {
  const prefs = (acceptLanguage ?? "")
    .split(",")
    .map((p) => p.trim().slice(0, 2).toLowerCase());
  return (prefs.find((p) => isLocale(p)) as Locale) ?? "fr";
}
