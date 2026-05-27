// v1.39.2 — Public LINE consultation URL.
//
// This is the single source for the "加入 LINE 諮詢" / "LINE 官方帳號" /
// "加好友" CTAs that live on the public site. The link is a LINE OA
// add-friend short-link issued by LINE Manager and is safe to embed
// directly in the client bundle.
//
// IMPORTANT: this constant is intentionally separate from the LINE
// Login / LIFF identity bridge config inside `src/lib/line/config.ts`.
//   - LINE_CONSULTATION_URL = public OA / consultation / add-friend
//   - LINE Login / LIFF      = identity / auth / token exchange
// Do NOT consume this constant in LINE Login, LIFF, or identity-merge
// code paths.
export const LINE_CONSULTATION_URL = "https://lin.ee/TGO7lje";
