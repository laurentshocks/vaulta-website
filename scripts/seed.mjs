// Fills the database with the starting products and uploads the product photos.
// Usage: npm run seed:local   (your computer)   |   npm run seed:remote   (Cloudflare)
// Safe to run again: existing products are NOT overwritten (edit them in /admin instead).

import { execFileSync } from "node:child_process";
import { writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { products, siteImages } from "../seed/products.mjs";

const target = process.argv.includes("--remote") ? "--remote" : "--local";
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const imgDir = path.join(root, "seed", "images");
const q = (v) => (v === null || v === undefined ? "NULL" : `'${String(v).replace(/'/g, "''")}'`);

const sql = [];
for (const p of products) {
  sql.push(
    `INSERT OR IGNORE INTO products (id, sku, category, price_cents, ribbon, hot, fill_photo, has_fingerprint, featured, active, sort, dimensions, weight, volume) VALUES (${q(p.id)}, ${q(p.sku)}, ${q(p.category)}, ${p.price * 100}, ${q(p.ribbon)}, ${p.hot}, ${p.fill}, ${p.fingerprint}, ${p.featured}, 1, ${p.sort}, ${q(p.dimensions)}, ${q(p.weight)}, ${q(p.volume)});`
  );
  for (const [locale, t] of Object.entries(p.t)) {
    sql.push(
      `INSERT OR IGNORE INTO product_translations (product_id, locale, name, description, points, chips, materials, colours) VALUES (${q(p.id)}, ${q(locale)}, ${q(t.name)}, ${q(t.description)}, ${q(JSON.stringify(t.points))}, ${q(JSON.stringify(t.chips))}, ${q(t.materials)}, ${q(t.colours)});`
    );
  }
  // photos: only add if the product has none yet
  p.images.forEach((file, i) => {
    sql.push(
      `INSERT INTO product_images (product_id, r2_key, sort) SELECT ${q(p.id)}, ${q("products/" + file)}, ${i} WHERE NOT EXISTS (SELECT 1 FROM product_images WHERE product_id = ${q(p.id)} AND r2_key = ${q("products/" + file)});`
    );
  });
}

const sqlFile = path.join(root, "seed", ".seed.sql");
writeFileSync(sqlFile, sql.join("\n"));

const wrangler = (args) => execFileSync("npx", ["wrangler", ...args], { stdio: "inherit", cwd: root });

console.log(`\n▶ Adding products to the database (${target})…`);
wrangler(["d1", "execute", "vaulta-db", target, "--file", sqlFile, "--yes"]);

const uploads = new Set();
for (const p of products) p.images.forEach((f) => uploads.add("products/" + f));
for (const f of siteImages) uploads.add("site/" + f);

console.log(`\n▶ Uploading ${uploads.size} photos to image storage (${target})…`);
for (const key of uploads) {
  const file = path.join(imgDir, path.basename(key));
  if (!existsSync(file)) { console.warn("  missing", file); continue; }
  wrangler(["r2", "object", "put", `vaulta-images/${key}`, "--file", file, "--content-type", "image/jpeg", target]);
}
console.log("\n✔ Done.");
