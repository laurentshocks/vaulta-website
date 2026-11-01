# VAULTA — Website

Landing page for anti-theft laptop bags (cut-resistant, waterproof, fingerprint lock).
It is a single file, `index.html`. No installation, no build step, no server needed.

> "VAULTA" and all prices, specs and FAQ answers are **placeholders**. Replace them with your real brand and real product data.

---

## 1. See the website on your computer (2 minutes)

1. Download `index.html` and save it in a new folder, e.g. `Documents/vaulta-website`.
2. Double-click `index.html`. It opens in your browser. That's your website.

To edit it, you need a code editor:

1. Install **Visual Studio Code** (free): https://code.visualstudio.com
2. In VS Code: **File → Open Folder…** → choose `vaulta-website`.
3. Click `index.html` to edit. Save (Ctrl+S / Cmd+S), then refresh the browser to see changes.

**Tip:** In VS Code, install the extension **"Live Server"**. Right-click `index.html` → *Open with Live Server*. The page now refreshes by itself every time you save.

---

## 2. Put it on GitHub

### Easiest way (no command line)

1. Go to https://github.com → click **+** (top right) → **New repository**.
2. Name: `vaulta-website`. Choose **Public** (needed for free GitHub Pages). Click **Create repository**.
3. On the next page, click **"uploading an existing file"**.
4. Drag `index.html` and `README.md` into the page → click **Commit changes**.

### The developer way (recommended once you're comfortable)

Install Git (https://git-scm.com), then in a terminal inside your folder:

```bash
git init
git add .
git commit -m "First version of the website"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/vaulta-website.git
git push -u origin main
```

Every time you change something afterwards:

```bash
git add .
git commit -m "Describe what you changed"
git push
```

(VS Code can also do this for you with the **Source Control** icon on the left.)

---

## 3. Publish it online for free (GitHub Pages)

1. In your repository on GitHub → **Settings** → **Pages** (left menu).
2. Under **Source** choose **Deploy from a branch**.
3. Branch: **main**, folder: **/ (root)** → **Save**.
4. Wait 1–2 minutes. Your site is live at:
   `https://YOUR-USERNAME.github.io/vaulta-website/`

Every `git push` updates the live site automatically.

---

## 4. Make the forms actually send you emails (Formspree, free)

The site is a "static" website: it has no server, so it can't receive form data by itself. Formspree does that for you.

1. Create a free account at https://formspree.io
2. Click **New Form**, give it a name, and copy the form ID (looks like `xayzabcd`).
3. In `index.html`, search for `YOUR_FORM_ID` (it appears **2 times**) and replace it with your ID.
4. Push to GitHub. Submissions now arrive in your email inbox.

Until you do this, the forms run in **demo mode** (they show a message but send nothing).

---

## 5. What to customise first

Open `index.html` and look for these (use Ctrl+F / Cmd+F):

| What | Where to find it |
|---|---|
| Brand name | Search `VAULTA` |
| Brand colours | Top of the file, `:root { ... }` → change `--accent` |
| Products, prices, specs | Section `MODELS / PRODUCTS` |
| Product pictures | Replace the `<svg>` drawings with `<img src="images/backpack.jpg" alt="...">` and put your photos in an `images` folder |
| FAQ | Section `FAQ` |
| Contact email | Search `hello@example.com` |

---

## 6. Before you sell anything in the EU (checklist)

Not legal advice. Check these with an accountant or lawyer in your country:

- **Company registration** and a VAT number.
- **Imprint / Legal notice** page (mandatory in Germany, Austria and others).
- **Privacy Policy** (GDPR). Mention Formspree and any analytics you add.
- **Cookie banner**: only needed if you add tracking (Google Analytics, Meta Pixel…). The current site has none.
- **Terms & Conditions** and **14-day right of withdrawal** information.
- **CE marking** and battery rules: the fingerprint lock is an electronic device with a battery, so your supplier must provide CE conformity documents (and the bag must follow EU battery and WEEE recycling rules).
- **Only claim what is tested.** "Cut-proof" and "waterproof" should be backed by your supplier's test reports (e.g. an IP rating for water). Words like "cut-resistant" are safer than "cut-proof" unless you have certification.
- **Trademark**: check your brand name is free at https://euipo.europa.eu (EUIPO search) before printing it on bags.

---

## 7. Next steps to scale

| Stage | What to do |
|---|---|
| **Now** — test the idea | Use this page + pre-order list. Share it on LinkedIn, ask companies for feedback. Count sign-ups. |
| **First sales** | Add **Stripe Payment Links** (no code: create a link in Stripe, paste it as the button URL). Stripe handles EU VAT with Stripe Tax. |
| **Real shop** | Move to **Shopify** (easiest, handles stock, shipping, VAT, multiple languages) or keep this design and connect a headless shop later. |
| **Own domain** | Buy e.g. `vaulta.eu` (~€10/year) and connect it in GitHub → Settings → Pages → Custom domain. |
| **Grow in Europe** | Translate the site (German, French, Spanish, Italian…), add customer reviews, a B2B price list, and analytics with a privacy-friendly tool like Plausible. |
