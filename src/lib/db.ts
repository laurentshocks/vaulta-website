import { getCloudflareContext } from "@opennextjs/cloudflare";

/** Cloudflare bindings: DB (D1 database) and PHOTOS (R2 photo storage) */
export async function cf() {
  const { env } = await getCloudflareContext({ async: true });
  return env as CloudflareEnv;
}

export async function db() {
  return (await cf()).DB;
}

export async function images(): Promise<R2Bucket> {
  // explicit type: OpenNext reserves the name IMAGES for its own image feature
  return ((await cf()) as unknown as { PHOTOS: R2Bucket }).PHOTOS;
}

export function euro(cents: number, locale = "fr") {
  return new Intl.NumberFormat(locale === "en" ? "en-IE" : locale === "nl" ? "nl-BE" : "fr-BE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export const imgUrl = (key: string) => `/img/${key}`;
