# VAULTA — Website

Shop page for anti-theft bags: fingerprint locks, cut-resistant fabric, tracking and RFID protection.
Products, specs and photos come from the **Kingsons Autumn/Winter 2026 catalog**.

```
vaulta-website/
├── index.html      ← the whole website (design, products, forms)
├── images/         ← product photos taken from the catalog
└── README.md       ← this guide
```

> ⚠️ **Placeholders to replace before going live:** the brand name "VAULTA", **all prices**, the contact email and the Formspree form ID.

---

## 1. Update your folder and GitHub with this new version

1. Download `vaulta-website.zip` from the chat.
2. In Terminal:

```bash
cd ~/Documents/vaulta-website
unzip -o ~/Downloads/vaulta-website.zip -d .
ls
```

You should see `index.html  README.md  images`.

3. See it in your browser:

```bash
open index.html
```

4. Send it to GitHub (if your repository already exists):

```bash
git add .
git commit -m "Website with real products from the catalog"
git push
```

If the repository doesn't exist yet, run this instead of `git push`:

```bash
git branch -M main
gh repo create vaulta-website --public --source=. --remote=origin --push
```

**Important:** always upload the `images` folder together with `index.html`, otherwise the photos won't show.

---

## 2. Publish it online for free (GitHub Pages)

1. On github.com, open your `vaulta-website` repository → **Settings** → **Pages**.
2. **Source:** Deploy from a branch. **Branch:** `main`, folder `/ (root)` → **Save**.
3. After 1–2 minutes your site is live at `https://YOUR-USERNAME.github.io/vaulta-website/`.

Every `git push` updates the live site automatically.

---

## 3. Edit products and prices

All products are in **one list** near the bottom of `index.html`. Search for `const PRODUCTS` (Cmd+F).

Each product looks like this:

```js
{
  id: "metrosecure-pro", sku: "K25834", name: "MetroSecure Pro", category: "backpack",
  ribbon: "Flagship", hot: true, price: 179,
  image: "images/metrosecure.jpg",
  gallery: [ "images/metrosecure.jpg", "images/metrosecure-fingerprint.jpg" ],
  desc: "Short description shown on the card",
  chips: ["Fingerprint lock", "Cut-resistant", "Find My"],
  points: [ "Bullet points in the popup" ],
  specs: { Dimensions: "45 × 30 × 15 cm", Weight: "1.28 kg", ... }
}
```

- **Change a price:** edit the number after `price:`.
- **Remove a product:** delete the whole block from `{` to `},`.
- **Add a product:** copy a block, change the values, and put its photo in `images/`.
- `category` is `"backpack"`, `"small"` (crossbody & clutch) or `"business"`. It decides which filter shows it.
- A product with `"Fingerprint lock"` in its `chips` appears under the **Fingerprint lock** filter.

The product names "Shield Crossbody", "Bio Crossbody", "Heritage Crossbody", "Executive Flap Backpack" and the "Business Backpack" names are mine; the catalog only gives model numbers for those. Rename them as you like.

### Products on the site

| Model | SKU | Fingerprint | Cut-resistant | Tracking |
|---|---|---|---|---|
| MetroSecure Pro | K25834 | ✅ | ✅ | Apple Find My |
| SecureTrack Pack | K261206 | TSA lock | ✅ | Positioning |
| Stealth Pack | K261165 | TSA lock | — | — |
| Shield Crossbody | K260673 | ✅ | ✅ | RFID pocket |
| Bio Crossbody | K260676 | ✅ | ✅ | — |
| MetroSecure Bio Clutch | K251366 | ✅ | — | — |
| Heritage Crossbody | K260930 | ✅ | — | — |
| Executive Flap Backpack | K260697 | — | — | — |
| Business Backpack | K261048 | — | — | — |
| Business Backpack Plus | K260956 | — | — | — |
| Business Handbag | K25784 | — | — | — |

---

## 4. Make the forms send you emails (Formspree, free)

1. Create a free account at https://formspree.io → **New Form** → copy the form ID (looks like `xayzabcd`).
2. In `index.html`, search for `YOUR_FORM_ID` (it appears **2 times**) and replace it with your ID.
3. Push to GitHub. Pre-orders and business quotes now arrive in your inbox.

Until then, the forms run in **demo mode**.

---

## 5. Before you sell: supplier & brand questions (important)

The photos show the **Kingsons** logo on the bags. Decide with Kingsons which of these you are:

- **Reseller of Kingsons bags:** ask for written permission to use their photos and product names, and consider showing "by Kingsons" on the site. Your shop can still be called VAULTA.
- **Your own brand (private label / OEM):** Kingsons is a manufacturer, so ask whether they can put **your** logo on the bags, and get new photos without their logo.

Also ask them for:

- **Prices** (unit price, minimum order quantity, shipping to Europe) so you can set your retail prices.
- **CE / EU conformity documents** for every bag with a fingerprint lock or electronics (battery rules apply).
- **Test reports** for "cut-resistant" and "water-resistant". The site only says what the catalog says: the bags are **water-resistant**, not waterproof.
- Details on the **fingerprint lock** (how many fingerprints, battery life, how it charges) to add to the FAQ.

---

## 6. EU legal checklist (not legal advice)

- Company registration and VAT number
- **Imprint / Legal notice**, **Privacy Policy** (GDPR, mention Formspree), **Terms & Conditions** and **14-day returns** pages (links are in the footer; create the pages)
- Cookie banner only if you add tracking (Google Analytics, Meta Pixel…). The site has none now.
- Check your brand name is free at https://euipo.europa.eu before using it.

---

## 7. Next steps to scale

| Stage | What to do |
|---|---|
| **Now** | Share the site, collect pre-orders and business requests, and see which models people want. |
| **First sales** | Add **Stripe Payment Links** to the Pre-order buttons. Stripe Tax handles EU VAT. |
| **Real shop** | Move to **Shopify** when you hold stock: payments, shipping, VAT and languages included. |
| **Own domain** | Buy e.g. `vaulta.eu` and connect it in GitHub → Settings → Pages → Custom domain. |
| **Grow in Europe** | Translate (French, German, Spanish, Italian…) and add customer reviews. |
