# Google Search Console Setup — IXAI Public

This guide walks an editor / operator through registering `app.ixuan.ai`
with Google Search Console (GSC), submitting the IXAI sitemap, and
checking that public intelligence pages are indexed.

The IXAI Public App is already wired with the building blocks GSC needs:

- `app/sitemap.ts` → `/sitemap.xml` (static, includes home, Daily index,
  Weekly index, per-slug Daily / Weekly briefs, market, FCN, about, pro,
  ixai, feedback).
- `app/robots.ts` → `/robots.txt` (allows public intelligence, blocks
  `/admin`, `/account`, `/auth`, `/api/admin`, `/api/auth`, `/settings`,
  `/app-preview`).
- Structured data (`Organization`, `WebSite`, `NewsArticle`,
  `BreadcrumbList`) from v1.33.
- Canonical URLs set on every public page through `buildPublicMetadata`.

## 1. Add the property

1. Open [Google Search Console](https://search.google.com/search-console).
2. Click **Add property**.
3. Choose **Domain** (`ixuan.ai`) if you can manage the DNS, or **URL
   prefix** (`https://app.ixuan.ai/`) for the public app only. The
   URL-prefix path is the lightest option for IXAI Public.

## 2. Verify ownership

Pick the method that matches your DNS setup:

- **DNS TXT record (recommended for Domain property)** — add the GSC
  TXT record at the apex of `ixuan.ai`.
- **HTML file** — drop the verification file at the web root. For
  Next.js, add it under `public/` so it serves at
  `https://app.ixuan.ai/<filename>.html`.
- **HTML tag** — add the meta tag inside `app/layout.tsx` head. If
  this is the chosen method, paste the tag into the `<head>` via
  Next.js metadata's `verification.google` field.

After GSC confirms verification, **keep the verifier in place**.
Removing it later un-verifies the property.

## 3. Submit the sitemap

1. In GSC, open **Indexing → Sitemaps**.
2. Submit:
   ```
   sitemap.xml
   ```
   GSC reads it from `https://app.ixuan.ai/sitemap.xml`.
3. Wait until the status changes from **Couldn't fetch** to
   **Success**. The IXAI sitemap regenerates on every deploy because
   it is a Next.js Metadata route — no manual upload needed.

## 4. Inspect index coverage

1. **Indexing → Pages** shows which IXAI URLs Google has indexed.
2. The first scan typically takes a few days. Critical surfaces to
   confirm:
   - `/`
   - `/daily-brief` and at least one `/daily-brief/{slug}`
   - `/weekly-brief` and at least one `/weekly-brief/{slug}`
   - `/market`
   - `/fcn`
   - `/about`
3. URLs in the **Excluded** bucket — read the reason. Expected
   exclusions: anything under `/admin`, `/account`, `/auth`,
   `/settings`, `/api/admin`, `/api/auth`, `/app-preview` — they are
   intentionally blocked by `robots.txt`.

## 5. URL inspection (one-shot)

For a single page (e.g. a newly published Weekly brief):

1. Paste the canonical URL into the GSC search bar.
2. Click **Request indexing**. GSC schedules a re-crawl.
3. After the crawl, the page should appear in **Pages → Indexed**.

## 6. Structured data + share preview

IXAI emits JSON-LD via `components/seo/structured-data.tsx`:

- `Organization` and `WebSite` at the layout root (every page).
- `NewsArticle` + `BreadcrumbList` on Daily and Weekly slug pages.

To verify:

1. Open Google's [Rich Results Test](https://search.google.com/test/rich-results).
2. Enter a Daily / Weekly slug URL. The result should detect
   `NewsArticle` and `BreadcrumbList` with no errors.
3. For OG image checks, use the
   [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
   and X's [Card validator](https://cards-dev.twitter.com/validator) on
   the same URLs. The IXAI dynamic OG images live at
   `/api/og/daily?slug=...` and `/api/og/weekly?slug=...` and respond
   with 1200×630 institutional intelligence cards.

## 7. Operational tips

- **Re-submit the sitemap** after editorial workflow changes (new
  Daily / Weekly slugs land via the admin Editorial Studio; the
  sitemap re-renders on every Vercel deploy).
- **Don't manually pin canonicals** for slug pages — `buildPublicMetadata`
  already emits `alternates.canonical` based on the slug.
- **Never index** `/account`, `/admin`, `/auth/*`, `/api/admin`, or any
  page that depends on session state. They are already blocked, but if
  you add a new authenticated surface, extend `app/robots.ts`.

## Reference

- Site URL: `https://app.ixuan.ai`
- Sitemap: `https://app.ixuan.ai/sitemap.xml`
- Robots: `https://app.ixuan.ai/robots.txt`
- Dynamic OG: `/api/og/daily?slug=...`, `/api/og/weekly?slug=...`
- Metadata helper: `src/lib/brand/metadata.ts`
- Canonical helper: `src/lib/seo/canonical.ts`
