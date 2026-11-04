import { pickLocale } from "@/lib/i18n";

/** "/" → sends visitors to /fr, /nl or /en based on their browser language */
export function GET(req: Request) {
  const locale = pickLocale(req.headers.get("accept-language"));
  return Response.redirect(new URL(`/${locale}`, req.url), 307);
}
