"use server";

import { redirect } from "next/navigation";
import { db, images } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { locales } from "@/lib/i18n";

const str = (f: FormData, k: string, max = 500) => String(f.get(k) ?? "").trim().slice(0, max);
const flag = (f: FormData, k: string) => (f.get(k) === "on" ? 1 : 0);
const lines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);
const commas = (s: string) => s.split(",").map((l) => l.trim()).filter(Boolean);

export async function saveProduct(f: FormData) {
  await requireAdmin();
  const isNew = f.get("isNew") === "1";
  const id = str(f, "id", 80).toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  if (!id) redirect("/admin/products?error=id");
  const price = Math.round(parseFloat(str(f, "price", 12).replace(",", ".")) * 100);
  if (!Number.isFinite(price) || price < 0) redirect(`/admin/products/${isNew ? "new" : id}?error=price`);

  const d = await db();
  if (isNew) {
    const exists = await d.prepare("SELECT 1 FROM products WHERE id = ?").bind(id).first();
    if (exists) redirect("/admin/products/new?error=exists");
  }

  const values = [
    str(f, "sku", 40), str(f, "category", 20) || "backpack", price, str(f, "ribbon", 30) || null,
    flag(f, "hot"), flag(f, "fill_photo"), flag(f, "has_fingerprint"), flag(f, "featured"), flag(f, "active"),
    parseInt(str(f, "sort", 6)) || 100, str(f, "dimensions", 60) || null, str(f, "weight", 30) || null, str(f, "volume", 30) || null,
  ];
  const stmts = [
    isNew
      ? d.prepare(
          `INSERT INTO products (sku, category, price_cents, ribbon, hot, fill_photo, has_fingerprint, featured, active, sort, dimensions, weight, volume, id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(...values, id)
      : d.prepare(
          `UPDATE products SET sku = ?, category = ?, price_cents = ?, ribbon = ?, hot = ?, fill_photo = ?, has_fingerprint = ?,
             featured = ?, active = ?, sort = ?, dimensions = ?, weight = ?, volume = ? WHERE id = ?`
        ).bind(...values, id),
  ];
  for (const l of locales) {
    const name = str(f, `${l}_name`, 120);
    if (!name) continue;
    stmts.push(
      d.prepare(
        `INSERT INTO product_translations (product_id, locale, name, description, points, chips, materials, colours)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT (product_id, locale) DO UPDATE SET name = excluded.name, description = excluded.description,
           points = excluded.points, chips = excluded.chips, materials = excluded.materials, colours = excluded.colours`
      ).bind(
        id, l, name, str(f, `${l}_description`, 2000),
        JSON.stringify(lines(str(f, `${l}_points`, 4000))), JSON.stringify(commas(str(f, `${l}_chips`, 500))),
        str(f, `${l}_materials`, 200), str(f, `${l}_colours`, 200)
      )
    );
  }
  await d.batch(stmts);
  redirect(`/admin/products/${id}?saved=1`);
}

export async function deleteProduct(f: FormData) {
  await requireAdmin();
  const id = str(f, "id", 80);
  const d = await db();
  const { results } = await d.prepare("SELECT r2_key FROM product_images WHERE product_id = ?").bind(id).all<{ r2_key: string }>();
  // keep the starting photos (products/...) in storage, delete only uploaded ones
  const uploaded = results.map((r) => r.r2_key).filter((k) => k.startsWith("uploads/"));
  if (uploaded.length) await (await images()).delete(uploaded);
  await d.batch([
    d.prepare("DELETE FROM product_images WHERE product_id = ?").bind(id),
    d.prepare("DELETE FROM product_translations WHERE product_id = ?").bind(id),
    d.prepare("DELETE FROM products WHERE id = ?").bind(id),
  ]);
  redirect("/admin/products?deleted=1");
}

const ALLOWED = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as const;

export async function uploadImages(f: FormData) {
  await requireAdmin();
  const id = str(f, "id", 80);
  const files = f.getAll("files").filter((x): x is File => x instanceof File && x.size > 0);
  const d = await db();
  const r2 = await images();
  const max = await d.prepare("SELECT COALESCE(MAX(sort), -1) AS m FROM product_images WHERE product_id = ?").bind(id).first<{ m: number }>();
  let sort = (max?.m ?? -1) + 1;
  for (const file of files) {
    const ext = ALLOWED[file.type as keyof typeof ALLOWED];
    if (!ext || file.size > 8 * 1024 * 1024) continue;
    const key = `uploads/${id}/${crypto.randomUUID()}.${ext}`;
    await r2.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
    await d.prepare("INSERT INTO product_images (product_id, r2_key, sort) VALUES (?, ?, ?)").bind(id, key, sort++).run();
  }
  redirect(`/admin/products/${id}?uploaded=1#photos`);
}

export async function deleteImage(f: FormData) {
  await requireAdmin();
  const id = str(f, "id", 80);
  const imageId = parseInt(str(f, "imageId", 10));
  const d = await db();
  const img = await d.prepare("SELECT r2_key FROM product_images WHERE id = ? AND product_id = ?").bind(imageId, id).first<{ r2_key: string }>();
  if (img) {
    if (img.r2_key.startsWith("uploads/")) await (await images()).delete(img.r2_key);
    await d.prepare("DELETE FROM product_images WHERE id = ?").bind(imageId).run();
  }
  redirect(`/admin/products/${id}#photos`);
}

export async function makeMainImage(f: FormData) {
  await requireAdmin();
  const id = str(f, "id", 80);
  const imageId = parseInt(str(f, "imageId", 10));
  const d = await db();
  await d.batch([
    d.prepare("UPDATE product_images SET sort = sort + 1 WHERE product_id = ?").bind(id),
    d.prepare("UPDATE product_images SET sort = 0 WHERE id = ? AND product_id = ?").bind(imageId, id),
  ]);
  redirect(`/admin/products/${id}#photos`);
}

const PREORDER_STATUS = ["new", "confirmed", "shipped", "cancelled"];
const QUOTE_STATUS = ["new", "contacted", "won", "lost"];

export async function setPreorderStatus(f: FormData) {
  await requireAdmin();
  const status = str(f, "status", 20);
  if (!PREORDER_STATUS.includes(status)) redirect("/admin/preorders");
  const d = await db();
  const id = parseInt(str(f, "id", 10));
  const order = await d.prepare("SELECT user_id, discount_code FROM preorders WHERE id = ?").bind(id).first<{ user_id: number | null; discount_code: string | null }>();
  await d.prepare("UPDATE preorders SET status = ? WHERE id = ?").bind(status, id).run();
  // once a discounted order is confirmed, the welcome code counts as used
  if (order?.user_id && order.discount_code && (status === "confirmed" || status === "shipped")) {
    await d.prepare("UPDATE users SET welcome_code_used = 1 WHERE id = ?").bind(order.user_id).run();
  }
  redirect("/admin/preorders");
}

export async function setQuoteStatus(f: FormData) {
  await requireAdmin();
  const status = str(f, "status", 20);
  if (!QUOTE_STATUS.includes(status)) redirect("/admin/quotes");
  const d = await db();
  await d.prepare("UPDATE quotes SET status = ? WHERE id = ?").bind(status, parseInt(str(f, "id", 10))).run();
  redirect("/admin/quotes");
}
