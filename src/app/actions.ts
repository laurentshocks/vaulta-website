"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { isLocale } from "@/lib/i18n";
import {
  createSession, destroySession, getUser, hashPassword, newWelcomeCode, verifyPassword,
} from "@/lib/auth";

const str = (f: FormData, k: string, max = 200) => String(f.get(k) ?? "").trim().slice(0, max);
const loc = (f: FormData) => {
  const l = str(f, "locale", 5);
  return isLocale(l) ? l : "en";
};
const validEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
/** only allow redirects to our own pages */
const safeNext = (n: string) => (n.startsWith("/") && !n.startsWith("//") ? n : "");

export async function register(f: FormData) {
  const locale = loc(f);
  const email = str(f, "email").toLowerCase();
  const password = String(f.get("password") ?? "");
  const name = str(f, "name", 100);
  const marketing = f.get("marketing") === "on" ? 1 : 0;
  const back = `/${locale}/account/register`;

  if (!validEmail(email) || !name) redirect(`${back}?error=missing`);
  if (password.length < 8) redirect(`${back}?error=weak`);

  const d = await db();
  const exists = await d.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
  if (exists) redirect(`${back}?error=exists`);

  const res = await d
    .prepare(
      `INSERT INTO users (email, password_hash, name, locale, marketing_consent, marketing_consent_at, welcome_code)
       VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id`
    )
    .bind(email, await hashPassword(password), name, locale, marketing, marketing ? new Date().toISOString() : null, newWelcomeCode())
    .first<{ id: number }>();

  await createSession(res!.id);
  redirect(`/${locale}/account?welcome=1`);
}

export async function login(f: FormData) {
  const locale = loc(f);
  const email = str(f, "email").toLowerCase();
  const password = String(f.get("password") ?? "");
  const next = safeNext(str(f, "next", 300));

  const d = await db();
  const user = await d
    .prepare("SELECT id, password_hash FROM users WHERE email = ?")
    .bind(email)
    .first<{ id: number; password_hash: string }>();
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    redirect(`/${locale}/account/login?error=invalid${next ? `&next=${encodeURIComponent(next)}` : ""}`);
  }
  await createSession(user.id);
  redirect(next || `/${locale}/account`);
}

export async function logout(f: FormData) {
  await destroySession();
  redirect(`/${loc(f)}`);
}

export async function setMarketing(f: FormData) {
  const user = await getUser();
  if (!user) redirect(`/${loc(f)}/account/login`);
  const on = f.get("on") === "1" ? 1 : 0;
  const d = await db();
  await d
    .prepare("UPDATE users SET marketing_consent = ?, marketing_consent_at = ? WHERE id = ?")
    .bind(on, on ? new Date().toISOString() : null, user.id)
    .run();
  redirect(`/${loc(f)}/account`);
}

export async function deleteAccount(f: FormData) {
  const user = await getUser();
  if (!user) redirect(`/${loc(f)}`);
  const d = await db();
  await destroySession();
  await d.batch([
    d.prepare("UPDATE preorders SET user_id = NULL WHERE user_id = ?").bind(user.id),
    d.prepare("UPDATE quotes SET user_id = NULL WHERE user_id = ?").bind(user.id),
    d.prepare("DELETE FROM sessions WHERE user_id = ?").bind(user.id),
    d.prepare("DELETE FROM users WHERE id = ?").bind(user.id),
  ]);
  redirect(`/${loc(f)}`);
}

export async function preorder(f: FormData) {
  const locale = loc(f);
  const productId = str(f, "product", 80);
  const back = `/${locale}/product/${encodeURIComponent(productId)}`;
  const name = str(f, "name", 100);
  const email = str(f, "email").toLowerCase();
  const quantity = Math.min(Math.max(parseInt(str(f, "quantity", 3)) || 1, 1), 10);
  if (!name || !validEmail(email) || f.get("consent") !== "on") redirect(`${back}?error=missing#preorder`);

  const d = await db();
  const product = await d
    .prepare("SELECT price_cents FROM products WHERE id = ? AND active = 1")
    .bind(productId)
    .first<{ price_cents: number }>();
  if (!product) redirect(`/${locale}/shop`);

  const user = await getUser();
  const code = user && !user.welcome_code_used ? user.welcome_code : null;
  await d
    .prepare(
      `INSERT INTO preorders (user_id, product_id, quantity, name, email, locale, unit_price_cents, discount_code)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(user?.id ?? null, productId, quantity, name, email, locale, product.price_cents, code)
    .run();
  redirect(`${back}?ok=1#preorder`);
}

export async function requestQuote(f: FormData) {
  const locale = loc(f);
  const back = `/${locale}/business`;
  const company = str(f, "company", 150);
  const name = str(f, "name", 100);
  const email = str(f, "email").toLowerCase();
  if (!company || !name || !validEmail(email) || f.get("consent") !== "on") redirect(`${back}?error=missing#quote`);

  const user = await getUser();
  const d = await db();
  await d
    .prepare(
      `INSERT INTO quotes (user_id, company, name, email, country, product_id, quantity_range, message, locale)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(user?.id ?? null, company, name, email, str(f, "country", 80), str(f, "product", 80), str(f, "quantity", 20), str(f, "message", 2000), locale)
    .run();
  redirect(`${back}?ok=1#quote`);
}
