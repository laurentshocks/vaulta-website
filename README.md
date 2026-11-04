# VAULTA — website (Next.js on Cloudflare)

Shop website in **French, Dutch and English** with:

- products and photos stored in a **database**, not in the code (edit them in the admin area)
- **customer accounts**: each new customer gets a personal **10% welcome code**, sees their pre-orders and can opt in or out of marketing emails
- one **admin account** for you: products, prices, translations, photo uploads, pre-orders, business quotes, customers, and a CSV export of everyone who agreed to marketing emails

| Part | Cloudflare service | Free plan |
|---|---|---|
| Website code | Workers | 100,000 requests/day |
| Database | D1 | 5 GB |
| Photos | R2 | 10 GB |

Prices, legal pages and the contact email are still **placeholders**.

---

## 1. One-time setup on your Mac

You need **Node.js** (version 20 or newer). Check in Terminal:

```bash
node -v
```

If you see "command not found", install it with Homebrew: `brew install node`.

Then, in your project folder:

```bash
cd ~/Documents/vaulta-website
npm install
npm run cf-typegen
npm run setup:local
```

`setup:local` creates the local database and loads the 11 products and 26 photos.

## 2. Run the website on your Mac

```bash
npm run dev
```

Open **http://localhost:3000**. It redirects to `/fr`, `/nl` or `/en` depending on your browser language.

Stop it with **Ctrl + C**.

## 3. Create your admin account (local)

1. With `npm run dev` running, open http://localhost:3000/en/account/register and create an account with your email.
2. In a **second** Terminal window:

```bash
cd ~/Documents/vaulta-website
npm run make-admin:local -- you@example.com
```

3. Log out and back in, then open **http://localhost:3000/admin**.

---

## 4. Put it online on Cloudflare (first time)

### 4a. Log in and create the database and photo storage

```bash
npx wrangler login
npx wrangler d1 create vaulta-db
npx wrangler r2 bucket create vaulta-images
```

`d1 create` prints a `database_id` (a long code). Open `wrangler.jsonc` and replace `00000000-0000-0000-0000-000000000000` with it.

R2 may ask you to enable it in the Cloudflare dashboard first (R2 → Purchase/Enable). The free tier is enough; a card may be required.

### 4b. Fill the online database and upload the photos

```bash
npm run db:migrate:remote
npm run seed:remote
```

### 4c. Deploy

```bash
npm run deploy
```

At the end it prints your address, like `https://vaulta.<your-name>.workers.dev`.

### 4d. Create your admin account online

Register on the live site with your email, then:

```bash
npm run make-admin:remote -- you@example.com
```

### Updating the site later

After changing code:

```bash
git add .
git commit -m "What I changed"
git push
npm run deploy
```

Products, prices and photos don't need a deploy: change them in **/admin** and they're live immediately.

If you add a new file in `migrations/` (a database change), run `npm run db:migrate:remote` before deploying.

---

## 5. Connect your OVHcloud domain

The easiest way is to let Cloudflare manage the domain's DNS:

1. In the Cloudflare dashboard: **Add a domain** → type your domain → choose the **Free** plan.
2. Cloudflare shows **two nameservers** (like `xxx.ns.cloudflare.com`).
3. In the **OVHcloud Control Panel**: Web Cloud → Domain names → your domain → **DNS servers** tab → **Modify DNS servers** → replace OVH's servers with Cloudflare's two → confirm.
4. Wait until Cloudflare shows the domain as **Active** (minutes to 24 hours).
5. In Cloudflare: **Workers & Pages → vaulta → Settings → Domains & Routes → Add → Custom domain** → add `yourdomain.eu`, then `www.yourdomain.eu`.

HTTPS is set up automatically.

Email: if you also want `hello@yourdomain.eu`, set up email (OVH email, Google Workspace, or Cloudflare Email Routing) **after** the DNS move, and add the MX records it gives you in Cloudflare's DNS.

---

## 6. Where things are

```
src/app/(site)/[locale]/   public pages: home, shop, product, business, account
src/app/(admin)/admin/     admin area (only for role = admin)
src/app/actions.ts         sign up, log in, pre-order, quote
src/messages/fr|nl|en.ts   all website texts per language
src/lib/auth.ts            passwords (PBKDF2) and login sessions
migrations/                database structure
seed/                      starting products and photos
```

To change a website text, edit it in all three files in `src/messages/`.

## 7. Before you launch (to do)

- [ ] Real prices in /admin
- [ ] Legal pages (legal notice, privacy policy, terms, returns) and the footer links in `src/components/Footer.tsx`
- [ ] Contact email in `src/components/Footer.tsx`
- [ ] **Password reset by email** (needs an email service such as Resend or Brevo)
- [ ] **Order confirmation emails**
- [ ] Payments (Stripe) when you move from pre-orders to real orders
- [ ] Your own branded product photos (the current ones show the supplier's logo)

## Marketing emails and GDPR

- The welcome code is given to **everyone** who creates an account. Agreeing to marketing emails is a **separate, optional, unticked** checkbox, so the consent is freely given.
- The date of consent is saved. Customers can unsubscribe from their account page at any time, and delete their account.
- The CSV export in /admin/customers contains **only** people who agreed. Every campaign email must have an unsubscribe link (email tools add it automatically).
