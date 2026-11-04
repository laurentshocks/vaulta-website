import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";

/** CSV of customers who agreed to marketing emails (admin only) */
export async function GET() {
  const user = await getUser();
  if (!user || user.role !== "admin") return new Response("Forbidden", { status: 403 });

  const d = await db();
  const { results } = await d
    .prepare(
      `SELECT email, name, locale, marketing_consent_at, created_at FROM users
       WHERE marketing_consent = 1 ORDER BY id`
    )
    .all<{ email: string; name: string; locale: string; marketing_consent_at: string | null; created_at: string }>();

  // quote every value; prefix formula characters so spreadsheets don't run them
  const cell = (v: string | null) => {
    let s = String(v ?? "");
    if (/^[=+\-@]/.test(s)) s = "'" + s;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const csv = [
    "email,name,language,consent_date,account_created",
    ...results.map((r) => [r.email, r.name, r.locale, r.marketing_consent_at, r.created_at].map(cell).join(",")),
  ].join("\n");

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="vaulta-marketing-${new Date().toISOString().slice(0, 10)}.csv"`,
      "cache-control": "no-store",
    },
  });
}
