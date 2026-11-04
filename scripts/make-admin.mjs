// Turns an existing account into the admin account.
// 1) Create a normal account on the website with your email
// 2) Run: npm run make-admin:local -- you@example.com     (or make-admin:remote for the live site)

import { execFileSync } from "node:child_process";

const target = process.argv.includes("--remote") ? "--remote" : "--local";
const email = process.argv.slice(2).find((a) => a.includes("@"));
if (!email || !/^[^\s'"@]+@[^\s'"@]+\.[^\s'"@]+$/.test(email)) {
  console.error("Usage: npm run make-admin:local -- you@example.com");
  process.exit(1);
}
execFileSync(
  "npx",
  ["wrangler", "d1", "execute", "vaulta-db", target, "--yes", "--command",
   `UPDATE users SET role = 'admin' WHERE email = '${email.toLowerCase()}'; SELECT id, email, role FROM users WHERE email = '${email.toLowerCase()}';`],
  { stdio: "inherit" }
);
console.log("\nIf a row with role = admin is shown above, log out and in again, then open /admin.");
