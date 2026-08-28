# Industryflow

Marketing website for an industrial / manufacturing / construction company, built with **Eleventy (11ty)** and edited through **Sveltia CMS** (the actively maintained, Decap-config-compatible successor to Decap / Netlify CMS).

Output is plain, static HTML/CSS/JS. Content lives in Markdown/JSON files that a non-technical owner edits at `/admin` — every commit goes straight to GitHub.

---

## Tech stack

| Concern | Choice |
| --- | --- |
| Static site generator | Eleventy 3 (CommonJS config) |
| Templating | Nunjucks (layouts, partials, section includes) |
| Styling | Vanilla CSS with custom-property design tokens (no framework) |
| Scripting | Vanilla JS, small IIFE modules concatenated + minified |
| CMS | Sveltia CMS at `/admin`, GitHub backend via Netlify OAuth |
| Hosting | Netlify free tier |

---

## Project structure

```
.
├── .eleventy.js            # 11ty config: passthrough, collections, filters, CSS/JS minify
├── netlify.toml            # build command + publish dir + asset caching headers
├── admin/
│   ├── index.html          # loads Sveltia CMS (version pinned)
│   └── config.yml          # backend + collections schema (Decap-compatible)
├── uploads/                # CMS media folder → served at /uploads
└── src/
    ├── _data/
    │   ├── settings.json    # Site Settings singleton  (CMS-editable)
    │   ├── home.json        # Home Page singleton       (CMS-editable, all sections)
    │   ├── nav.json         # navigation + footer links
    │   ├── css.js / js.js   # concatenate CSS/JS partials for bundling
    │   └── year.js          # current year for the footer
    ├── _includes/
    │   ├── layouts/         # base, page, post, service
    │   ├── partials/        # header, footer, seo, jsonld, icons (SVG macro)
    │   └── sections/        # hero, stats, about, services, process, industries,
    │                          cta, testimonials, blog, newsletter
    ├── assets/
    │   ├── css/             # 10-tokens, 20-base, 30-components  → /assets/main.css
    │   ├── js/              # 10-utils … 80-misc                → /assets/main.js
    │   └── images/          # branded SVG placeholders (replace via CMS)
    ├── posts/               # blog folder collection (.md)
    ├── services/            # services folder collection (.md)
    ├── index.njk            # one-page home (composed of section includes)
    ├── about / services / blog / contact .njk   # stub pages
    ├── 404.njk
    ├── sitemap.njk          # generated /sitemap.xml
    └── robots.njk           # generated /robots.txt
```

### Where content comes from

- **Global data** — Eleventy reads everything in `src/_data/*.json` as global variables (`settings`, `home`, `nav`). Sveltia writes to those same files, so editing in the CMS and reading in a template are the same source of truth.
- **Collections** — `src/posts/*.md` and `src/services/*.md` are folder collections; each file becomes its own page (`/blog/<slug>/`, `/services/<slug>/`).

---

## Run it locally

Requires Node 18+ (Node 20 recommended).

```bash
npm install
npm run dev
```

Then open <http://localhost:8080>. The dev server live-reloads on changes to templates, data, CSS, and JS.

Production build (minifies CSS/JS):

```bash
npm run build     # outputs to ./_site
```

> The CMS admin (`/admin`) only works once deployed with the GitHub/Netlify OAuth backend configured (below). Locally you edit the JSON/Markdown files directly.

---

## Deploy to Netlify

1. Push this repository to GitHub.
2. In Netlify: **Add new site → Import an existing project**, pick the repo.
3. Netlify reads `netlify.toml` automatically:
   - **Build command:** `npm run build`
   - **Publish directory:** `_site`
4. Deploy. Your site goes live at `https://<your-site>.netlify.app`.
5. Update `src/_data/settings.json` → `"url"` to your real domain (used for canonical URLs, Open Graph, and the sitemap). This can also be edited later in the CMS under **Site Settings**.

### (Optional) Wire up the forms

The quote / contact / newsletter forms validate client-side and show a success message with no backend. To capture real submissions with **Netlify Forms** (free tier):

1. Add `data-netlify="true"` to each `<form>` you want live (in `src/_includes/sections/cta.njk`, `src/_includes/sections/newsletter.njk`, and `src/contact.njk`). The forms already include the required hidden `form-name` input and a honeypot `bot-field`.
2. Redeploy. The JS (`src/assets/js/70-forms.js`) detects `data-netlify` and lets the native POST through instead of intercepting it.
3. Submissions appear under **Netlify → Forms**.

Every form's `action` already points at `/thank-you/` ([src/thank-you.njk](src/thank-you.njk)). With Netlify Forms enabled, a real submission causes an actual browser navigation to that page — which is what you want the moment you start running paid ads, since ad-platform conversion pixels fire far more reliably on a real page load than on a JS-only inline success message.

### (Optional) Running ads — conversion tracking

If you plan to run Google Ads, Meta/Facebook Ads, or similar:

1. Add the platform's base tracking snippet (gtag.js, Meta Pixel, etc.) to `<head>` in [src/_includes/layouts/base.njk](src/_includes/layouts/base.njk) — a commented-out template for both is already there with your IDs left as `XXXXXXXXX` placeholders. Uncomment and fill in your real IDs.
2. Uncomment the matching conversion-event snippet at the bottom of [src/thank-you.njk](src/thank-you.njk) (also with placeholder IDs).
3. Redeploy. Every real form submission now lands on `/thank-you/`, which fires the conversion event.

`/thank-you/` is marked `noindex` (via its `robotsMeta` front-matter field) so it never competes with real pages in search results — it exists purely as a landing target for form redirects and conversion tracking, not as content.

---

## Set up the CMS (Sveltia + GitHub via Netlify OAuth)

The site owner logs in at `https://<your-site>.netlify.app/admin` with **Login with GitHub** and commits edits straight to the repo. No Netlify Identity, no Git Gateway, no database.

### 1. Register a GitHub OAuth App

1. GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**.
2. Fill in:
   - **Application name:** e.g. `Industryflow CMS`
   - **Homepage URL:** `https://<your-site>.netlify.app`
   - **Authorization callback URL:** `https://api.netlify.com/auth/done`  ← must be exactly this
3. Register, then **copy the Client ID** and **generate + copy a Client Secret**.

### 2. Add the credentials to Netlify

1. Netlify → your site → **Site configuration → Access control → OAuth**.
2. Under **Authentication providers**, click **Install provider → GitHub**.
3. Paste the **Client ID** and **Client Secret** from step 1. Save.

This makes Netlify act as the OAuth broker — no `base_url` is needed in `config.yml`.

### 3. Point `config.yml` at your repo

In `admin/config.yml`, set the backend to the client's GitHub owner + repo:

```yaml
backend:
  name: github
  repo: your-github-username/your-repo-name
  branch: main
```

Also update `site_url` / `display_url` in that file to your live URL so the CMS preview links work.

### 4. Log in

Visit `https://<your-site>.netlify.app/admin`, click **Login with GitHub**, authorize, and you're in. Edits commit to `main` and trigger a Netlify rebuild automatically.

### What the owner can edit

- **Site Settings** — logo, title, tagline, contact info, social links, default SEO title/description + share image.
- **Home Page** — every section: hero (headline, subtext, CTA, background, rotating cards), stats, about + mission/vision, services cards, work-process steps, global-reach block, CTA banner, testimonials, blog heading, newsletter.
- **Blog Posts** — title, date, category, featured image (+ **required** alt text), excerpt, Markdown body, per-post SEO overrides.
- **Services** — title, icon, image (+ alt), feature list, Markdown body, per-service SEO overrides.

Every image field uses the CMS image widget; uploads go to `/uploads` and are committed to the repo. Alt-text fields are marked required so images stay accessible and SEO-friendly.

---

## Moving off Netlify later

If you ever leave Netlify, you can keep Sveltia by switching to the official [`sveltia-cms-auth`](https://github.com/sveltia/sveltia-cms-auth) Cloudflare Worker:

1. Deploy the worker (free Cloudflare account).
2. Register a **new** GitHub OAuth App with the **Authorization callback URL** pointing at your worker URL instead of `https://api.netlify.com/auth/done`.
3. Add the worker URL to `admin/config.yml`:
   ```yaml
   backend:
     name: github
     repo: your-github-username/your-repo-name
     branch: main
     base_url: https://your-worker.workers.dev
   ```

Nothing else in the site changes.

---

## Replacing the placeholder images

The `src/assets/images/*.svg` files are branded placeholders so the site renders before real photos exist. Two ways to swap them:

- **Via the CMS (recommended):** open Site Settings / Home Page / a post / a service, upload a real photo into the relevant image field, and save. The new file lands in `/uploads` and the reference updates automatically — no code changes.
- **In code:** drop real files into `src/assets/images/` and update the paths in `src/_data/*.json` (or the Markdown front matter).

Recommended slots: hero background (wide, dusk industrial), about (welders), services background (plant interior), CTA banner (machinery), newsletter (gears), blog thumbnails, world map, logo.

---

## Accessibility & performance notes

- Semantic HTML5 landmarks, one `<h1>` per page, logical heading order.
- Keyboard-operable nav, carousels, and forms; visible focus rings; ARIA labels on icon-only controls.
- `prefers-reduced-motion` respected for reveals, counters, carousels, and smooth scroll.
- Below-the-fold images use `loading="lazy"`; the hero image uses `fetchpriority="high"`.
- CSS and JS are concatenated and minified in `npm run build`; `/assets/*` is served with long-lived immutable caching (see `netlify.toml`).
- Per-page `<title>`/description, canonical URL, Open Graph + Twitter tags, and JSON-LD (`LocalBusiness` on home, `BlogPosting` on posts).
- Color tokens are chosen so every text/background pairing on the site clears WCAG AA (4.5:1 for normal text, 3:1 for large text and non-text UI) — see the comment block at the top of `src/assets/css/10-tokens.css`. Audited end-to-end with axe-core against every page template; zero violations.

---

## SEO for traditional search engines *and* AI / LLM answer engines

Traditional SEO is covered by the usual mechanisms: `sitemap.xml`, `robots.txt`, canonical URLs, Open Graph/Twitter tags, and JSON-LD structured data (see above).

Alongside that, the site publishes **[`/llms.txt`](https://llmstxt.org/)** — an emerging, plain-text convention that gives AI answer engines (ChatGPT, Claude, Perplexity, Google's AI Overviews, etc.) a clean, structured summary of the site: what the company does, its services, its articles, and how to contact it — without needing to parse HTML/CSS. It's generated by [`src/llms.txt.njk`](src/llms.txt.njk) from the same CMS data as the rest of the site, so it never drifts out of date as content changes.

`robots.txt` allows all crawlers (including AI bots like `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`) via its wildcard rule — nothing extra to configure there.
