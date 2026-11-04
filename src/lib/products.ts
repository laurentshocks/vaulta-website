import { db } from "./db";

export type ProductImage = { id: number; r2_key: string; sort: number };
export type Product = {
  id: string;
  sku: string;
  category: "backpack" | "small" | "business";
  price_cents: number;
  ribbon: string | null;
  hot: number;
  fill_photo: number;
  has_fingerprint: number;
  featured: number;
  active: number;
  sort: number;
  dimensions: string | null;
  weight: string | null;
  volume: string | null;
  name: string;
  description: string;
  points: string[];
  chips: string[];
  materials: string;
  colours: string;
  images: ProductImage[];
};

type Row = Omit<Product, "points" | "chips" | "images"> & { points: string; chips: string };

const SELECT = `
  SELECT p.*,
    COALESCE(t.name, e.name, p.id)      AS name,
    COALESCE(t.description, e.description, '') AS description,
    COALESCE(t.points, e.points, '[]')  AS points,
    COALESCE(t.chips, e.chips, '[]')    AS chips,
    COALESCE(t.materials, e.materials, '') AS materials,
    COALESCE(t.colours, e.colours, '')  AS colours
  FROM products p
  LEFT JOIN product_translations t ON t.product_id = p.id AND t.locale = ?1
  LEFT JOIN product_translations e ON e.product_id = p.id AND e.locale = 'en'`;

const parse = (s: string): string[] => {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
};

async function attachImages(rows: Row[]): Promise<Product[]> {
  if (!rows.length) return [];
  const d = await db();
  const ids = rows.map((r) => r.id);
  const { results } = await d
    .prepare(`SELECT id, product_id, r2_key, sort FROM product_images WHERE product_id IN (${ids.map(() => "?").join(",")}) ORDER BY sort, id`)
    .bind(...ids)
    .all<ProductImage & { product_id: string }>();
  return rows.map((r) => ({
    ...r,
    points: parse(r.points),
    chips: parse(r.chips),
    images: results.filter((i) => i.product_id === r.id),
  }));
}

export async function listProducts(locale: string, opts: { includeInactive?: boolean } = {}) {
  const d = await db();
  const { results } = await d
    .prepare(`${SELECT} ${opts.includeInactive ? "" : "WHERE p.active = 1"} ORDER BY p.sort, p.id`)
    .bind(locale)
    .all<Row>();
  return attachImages(results);
}

export async function getProduct(id: string, locale: string, opts: { includeInactive?: boolean } = {}) {
  const d = await db();
  const row = await d
    .prepare(`${SELECT} WHERE p.id = ?2 ${opts.includeInactive ? "" : "AND p.active = 1"}`)
    .bind(locale, id)
    .first<Row>();
  if (!row) return null;
  return (await attachImages([row]))[0];
}
