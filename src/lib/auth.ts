import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";

const COOKIE = "vaulta_session";
const SESSION_DAYS = 30;
const ITERATIONS = 100_000; // PBKDF2 maximum allowed on Cloudflare Workers

export type User = {
  id: number;
  email: string;
  name: string;
  company: string | null;
  vat_number: string | null;
  role: "customer" | "admin";
  locale: string;
  marketing_consent: number;
  welcome_code: string;
  welcome_code_used: number;
  created_at: string;
};

const enc = new TextEncoder();
const toB64 = (buf: ArrayBuffer | Uint8Array) => {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s);
};
const fromB64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const toHex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");

async function pbkdf2(password: string, salt: Uint8Array, iterations: number) {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  return crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: new Uint8Array(salt), iterations }, key, 256);
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2(password, salt, ITERATIONS);
  return `pbkdf2$${ITERATIONS}$${toB64(salt)}$${toB64(hash)}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, iter, saltB64, hashB64] = stored.split("$");
  if (scheme !== "pbkdf2") return false;
  const expected = fromB64(hashB64);
  const actual = new Uint8Array(await pbkdf2(password, fromB64(saltB64), Number(iter)));
  if (actual.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expected[i];
  return diff === 0;
}

async function sha256(text: string) {
  return toHex(await crypto.subtle.digest("SHA-256", enc.encode(text)));
}

export function newWelcomeCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return "WELCOME-" + [...bytes].map((b) => chars[b % chars.length]).join("");
}

export async function createSession(userId: number) {
  const token = toHex(crypto.getRandomValues(new Uint8Array(32)).buffer as ArrayBuffer);
  const expires = new Date(Date.now() + SESSION_DAYS * 86400_000);
  const d = await db();
  await d.prepare("DELETE FROM sessions WHERE expires_at < datetime('now')").run();
  await d
    .prepare("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)")
    .bind(await sha256(token), userId, expires.toISOString().replace("T", " ").slice(0, 19))
    .run();
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function getUser(): Promise<User | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return null;
  const d = await db();
  return (
    (await d
      .prepare(
        `SELECT u.id, u.email, u.name, u.company, u.vat_number, u.role, u.locale, u.marketing_consent,
                u.welcome_code, u.welcome_code_used, u.created_at
         FROM sessions s JOIN users u ON u.id = s.user_id
         WHERE s.id = ? AND s.expires_at > datetime('now')`
      )
      .bind(await sha256(token))
      .first<User>()) ?? null
  );
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) {
    const d = await db();
    await d.prepare("DELETE FROM sessions WHERE id = ?").bind(await sha256(token)).run();
  }
  jar.delete(COOKIE);
}

/** Use at the top of every admin page and admin action */
export async function requireAdmin() {
  const user = await getUser();
  if (!user) redirect("/en/account/login?next=/admin");
  if (user.role !== "admin") redirect("/en/account?error=notadmin");
  return user;
}
