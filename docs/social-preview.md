# IXAI Social Preview Testing

IXAI uses the production metadata base `https://ixai-web-app.vercel.app` by default.
When a custom domain is ready, set `NEXT_PUBLIC_SITE_URL` in Vercel to the final origin, for example:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.example
```

## Preview Asset

- Open Graph image: `/og/ixai-og.png`
- Source SVG: `/og/ixai-og.svg`
- App icon: `/icon.svg`
- Apple touch icon: `/apple-icon.png`
- Favicon: `/favicon.ico`

## How to Test

1. Deploy to Vercel and open the production URL.
2. Inspect page source for:
   - `og:title`
   - `og:description`
   - `og:image`
   - `twitter:card`
   - `twitter:image`
3. Test link previews:
   - LINE: paste the production URL into a LINE chat.
   - Facebook: use Facebook Sharing Debugger and scrape again after deploy.
   - Threads / Instagram DM: paste the production URL and confirm the preview image appears.
   - X / Twitter: use the Card Validator if available, or share in a private draft/test account.

## Copy Guardrails

Social preview copy must avoid guaranteed return, buy/sell signal, or investment recommendation language.
Use AI financial intelligence, market observation, risk monitoring, and information reference wording.
