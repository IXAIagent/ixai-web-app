#!/usr/bin/env node

import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const BASE_URL = "https://app.ixuan.ai";
const STORAGE_STATE_PATH = path.resolve(process.cwd(), ".auth", "production-storage-state.json");
const ARTIFACT_ROOT = path.resolve(process.cwd(), "qa-artifacts", "production-authenticated-audit");
const REPORT_PATH = path.resolve(process.cwd(), "docs", "V138_FULL_WORKSPACE_LOCALIZATION_COMPLETION.md");

const WORKSPACE_ROUTES = [
  "/my-ixai/home",
  "/my-ixai/portfolio",
  "/my-ixai/input",
  "/my-ixai/input/stock",
  "/my-ixai/input/crypto",
  "/my-ixai/input/fcn",
  "/my-ixai/watchlist",
  "/my-ixai/notifications",
  "/my-ixai/timeline",
  "/my-ixai/copilot",
  "/my-ixai/health",
  "/my-ixai/beta",
  "/my-ixai/risk",
  "/my-ixai/fcn",
  "/my-ixai/intelligence",
  "/my-ixai/settings",
];

const PUBLIC_ROUTES = [
  "/",
  "/pro",
  "/fcn",
  "/market",
  "/daily-brief",
  "/weekly-brief",
  "/about",
  "/login",
  "/register",
];

const LOCALES = ["zh-TW", "zh-CN", "en-US", "ja-JP", "ko-KR"];

const ENGLISH_LEFTOVER_PATTERNS = [
  "Settings",
  "Portfolio Risk Summary",
  "Shared Holdings Readback",
  "Workspace intelligence context",
  "Risk Context",
  "Market Provider Boundary",
  "Foundation Risk Score",
  "Signal Counts",
  "Current price",
  "Worst-of performance",
  "Distance to KI",
  "Distance to Strike",
  "Source status",
  "Available",
  "Preview",
  "Partial",
  "Unavailable",
  "Unknown",
];

const COVERAGE_STANDARD_ENGLISH_MAX = 5;
const TECHNICAL_TOKEN_PATTERNS = [
  /^[A-Z]{1,8}$/,
  /^[A-Z0-9._-]{2,24}$/,
  /^\/[a-z0-9/_-]+$/i,
  /^https?:\/\//i,
  /^[a-z0-9._-]+\.(js|css|json|png|jpg|jpeg|svg|webp|ts|tsx|mjs)$/i,
  /^(USD|TWD|HKD|JPY|EUR|KRW|BTC|ETH|BTCUSDT|AAPL)$/i,
  /^(FCN|KI|KO|API|RLS|JSON|URL|ETF|LLM)$/i,
  /^(Supabase|Yahoo|Binance|PostHog|localStorage|Cookie|React|Next)$/i,
  /^(IXAI|I-Xuan)$/i,
  /^[a-z]+:[a-z0-9:_-]+$/i,
];

function isTechnicalToken(token) {
  return TECHNICAL_TOKEN_PATTERNS.some((pattern) => pattern.test(token));
}

function calculateDomTranslationCoverage(text, locale) {
  if (locale === "en-US") {
    return {
      englishPercent: 0,
      englishTokenCount: 0,
      localizedPercent: 100,
      localizedTokenCount: 0,
      pass: true,
      sampleEnglishTokens: [],
    };
  }

  const normalized = text
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\/api\/[^\s]+/g, " ")
    .replace(/[_/][A-Za-z0-9._/-]+/g, " ");
  const englishTokens = [];
  const englishMatches = normalized.match(/[A-Za-z][A-Za-z0-9'’.-]*/g) ?? [];

  for (const token of englishMatches) {
    const cleaned = token.replace(/^[-.'’]+|[-.'’]+$/g, "");
    if (!cleaned || cleaned.length <= 1 || isTechnicalToken(cleaned)) {
      continue;
    }
    englishTokens.push(cleaned);
  }

  const localizedMatches = normalized.match(/[\u3400-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]+/g) ?? [];
  const localizedTokenCount = localizedMatches.reduce((count, segment) => {
    if (/[\u3400-\u9FFF]/.test(segment)) {
      return count + Math.max(1, Math.ceil(segment.length / 2));
    }
    return count + Math.max(1, Math.ceil(segment.length / 3));
  }, 0);
  const denominator = englishTokens.length + localizedTokenCount;
  const englishPercent = denominator > 0 ? (englishTokens.length / denominator) * 100 : 0;

  return {
    englishPercent,
    englishTokenCount: englishTokens.length,
    localizedPercent: 100 - englishPercent,
    localizedTokenCount,
    pass: englishPercent <= COVERAGE_STANDARD_ENGLISH_MAX,
    sampleEnglishTokens: unique(englishTokens).slice(0, 30),
  };
}

async function extractVisibleTextBlocks(page) {
  return page
    .evaluate(() => {
      const selector = [
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "p",
        "span",
        "button",
        "a",
        "label",
        "dt",
        "dd",
        "li",
        "th",
        "td",
        "summary",
        "[role='button']",
        "[aria-label]",
      ].join(",");
      const seen = new Set();
      return Array.from(document.querySelectorAll(selector))
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          const style = window.getComputedStyle(element);
          return (
            rect.width > 0 &&
            rect.height > 0 &&
            style.visibility !== "hidden" &&
            style.display !== "none"
          );
        })
        .map((element) => {
          const aria = element.getAttribute("aria-label") ?? "";
          const text = `${aria} ${element.textContent ?? ""}`.replace(/\s+/g, " ").trim();
          return text;
        })
        .filter((text) => text.length >= 2 && text.length <= 500)
        .filter((text) => {
          if (seen.has(text)) return false;
          seen.add(text);
          return true;
        });
    })
    .catch(() => []);
}

function findEnglishTokens(text) {
  const normalized = text
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\/api\/[^\s]+/g, " ")
    .replace(/[_/][A-Za-z0-9._/-]+/g, " ");
  return unique(
    (normalized.match(/[A-Za-z][A-Za-z0-9'’.-]*/g) ?? [])
      .map((token) => token.replace(/^[-.'’]+|[-.'’]+$/g, ""))
      .filter((token) => token.length > 1 && !isTechnicalToken(token)),
  );
}

function analyzeVisibleBlocks(blocks, locale) {
  if (locale === "en-US") return [];
  return blocks
    .map((text) => ({
      text,
      tokens: findEnglishTokens(text),
    }))
    .filter((block) => block.tokens.length > 0)
    .slice(0, 80);
}

function routeSlug(route) {
  return route.replace(/^\/+/, "").replace(/[^a-zA-Z0-9]+/g, "-") || "root";
}

function redactUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return rawUrl.split("?")[0];
  }
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

async function pathExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function ensureStorageState() {
  if (await pathExists(STORAGE_STATE_PATH)) {
    return { created: false };
  }

  await mkdir(path.dirname(STORAGE_STATE_PATH), { recursive: true });

  console.log("");
  console.log("No production auth storage state found.");
  console.log("A headed Chromium window will open at https://app.ixuan.ai/login.");
  console.log("Please log in manually. Do not paste credentials into this terminal.");
  console.log("The script will continue automatically after Workspace is detected.");
  console.log("");

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { height: 900, width: 1280 },
  });
  const page = await context.newPage();

  try {
    await page.goto(`${BASE_URL}/login`, {
      timeout: 60000,
      waitUntil: "domcontentloaded",
    });

    await page.waitForFunction(
      () => {
        const path = window.location.pathname;
        const text = document.body?.innerText ?? "";
        return (
          path.startsWith("/my-ixai") ||
          /IXAI Workspace|Workspace Home|我的 IXAI|工作區|Portfolio Center|Risk Center/i.test(text)
        );
      },
      undefined,
      { timeout: 10 * 60 * 1000 },
    );

    await context.storageState({ path: STORAGE_STATE_PATH });
    console.log(`Saved production auth storage state to ${STORAGE_STATE_PATH}`);
    return { created: true };
  } finally {
    await browser.close();
  }
}

async function setLocale(page, locale) {
  await page.evaluate((nextLocale) => {
    const maxAge = 60 * 60 * 24 * 365;
    window.localStorage.setItem("ixai.locale", nextLocale);
    document.cookie = `ixai.locale=${encodeURIComponent(nextLocale)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
    window.dispatchEvent(new CustomEvent("ixai:locale-change", { detail: { locale: nextLocale } }));
  }, locale);
}

async function isWorkspaceAuthenticated(page) {
  const url = new URL(page.url());
  const text = await page.locator("body").innerText({ timeout: 5000 }).catch(() => "");
  const blockedByUrl =
    url.pathname.startsWith("/login") ||
    url.pathname.startsWith("/register") ||
    url.pathname === "/account";
  const blockedByText =
    /建立你的 IXAI intelligence workspace|建立 IXAI Account|Create IXAI Account|IXAI Public Intelligence|IXAI Pro access|請先登入|登入|Log in|Create account/i.test(text) &&
    !/IXAI Workspace|Workspace Home|工作區|Portfolio Center|Risk Center|Settings/i.test(text);
  const accountGateText =
    /建立你的 IXAI intelligence workspace|建立 IXAI Account|Create IXAI Account|IXAI Public Intelligence/i.test(
      text,
    );

  return !blockedByUrl && !blockedByText && !accountGateText && url.pathname.startsWith("/my-ixai");
}

async function verifyStoredAuth(context) {
  const page = await context.newPage();
  try {
    await page.goto(`${BASE_URL}/my-ixai/home`, {
      timeout: 60000,
      waitUntil: "domcontentloaded",
    });
    await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => undefined);
    await page.waitForTimeout(600);

    const authenticated = await isWorkspaceAuthenticated(page);
    if (!authenticated) {
      return {
        authenticated: false,
        finalUrl: page.url(),
      };
    }

    return {
      authenticated: true,
      finalUrl: page.url(),
    };
  } finally {
    await page.close();
  }
}

async function auditRoute(context, locale, route) {
  const page = await context.newPage({
    viewport: { height: 900, width: 1280 },
  });
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  const url = `${BASE_URL}${route}`;
  const screenshotPath = path.join(ARTIFACT_ROOT, locale, `${routeSlug(route)}.png`);

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text().slice(0, 1000));
    }
  });

  page.on("pageerror", (error) => {
    pageErrors.push(error instanceof Error ? error.message : String(error));
  });

  page.on("requestfailed", (request) => {
    failedRequests.push({
      failure: request.failure()?.errorText ?? "unknown_request_failure",
      method: request.method(),
      url: redactUrl(request.url()),
    });
  });

  try {
    const response = await page.goto(url, {
      timeout: 60000,
      waitUntil: "domcontentloaded",
    });
    await setLocale(page, locale);
    await page.reload({ timeout: 60000, waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 12000 }).catch(() => undefined);
    await page.waitForTimeout(900);

    const visibleText = await page.locator("body").innerText({ timeout: 10000 }).catch(() => "");
    const visibleTextBlocks = await extractVisibleTextBlocks(page);
    const authenticated = await isWorkspaceAuthenticated(page);
    const leftovers =
      locale === "en-US"
        ? []
        : ENGLISH_LEFTOVER_PATTERNS.filter((pattern) => visibleText.includes(pattern));
    const suspectedEnglishBlocks = analyzeVisibleBlocks(visibleTextBlocks, locale);
    const coverage = calculateDomTranslationCoverage(visibleTextBlocks.join("\n"), locale);

    await mkdir(path.dirname(screenshotPath), { recursive: true });
    await page.screenshot({ path: screenshotPath, fullPage: true });

    return {
      authenticated,
      consoleErrors: unique(consoleErrors),
      failedRequests,
      finalUrl: page.url(),
      httpStatus: response?.status() ?? null,
      locale,
      pageErrors: unique(pageErrors),
      route,
      screenshotPath: path.relative(process.cwd(), screenshotPath),
      suspectedEnglishLeftovers: leftovers,
      suspectedEnglishBlocks,
      translationCoverage: coverage,
      visibleTextBlockCount: visibleTextBlocks.length,
      visibleTextSample: visibleText.replace(/\s+/g, " ").trim().slice(0, 1200),
    };
  } catch (error) {
    return {
      authenticated: false,
      consoleErrors: unique(consoleErrors),
      error: error instanceof Error ? error.message : String(error),
      failedRequests,
      finalUrl: page.url(),
      httpStatus: null,
      locale,
      pageErrors: unique(pageErrors),
      route,
      screenshotPath: null,
      suspectedEnglishLeftovers: [],
      suspectedEnglishBlocks: [],
      translationCoverage: calculateDomTranslationCoverage("", locale),
      visibleTextBlockCount: 0,
      visibleTextSample: "",
    };
  } finally {
    await page.close();
  }
}

function markdownList(items, emptyText = "None") {
  if (!items.length) {
    return `- ${emptyText}`;
  }

  return items.map((item) => `- ${item}`).join("\n");
}

function buildReport({ authStorageCreated, generatedAt, results }) {
  const blocked = results.filter((result) => !result.authenticated);
  const consoleRows = results.filter((result) => result.consoleErrors.length > 0);
  const pageErrorRows = results.filter((result) => result.pageErrors.length > 0 || result.error);
  const failedRequestRows = results.filter((result) => result.failedRequests.length > 0);
  const leftoverRows = results.filter(
    (result) =>
      result.suspectedEnglishLeftovers.length > 0 || result.suspectedEnglishBlocks.length > 0,
  );
  const coverageFailRows = results.filter(
    (result) => result.locale !== "en-US" && !result.translationCoverage.pass,
  );
  const screenshotRows = results.filter((result) => result.screenshotPath);

  const resultRows = results
    .map(
      (result) =>
        `| ${result.locale} | ${result.route} | ${result.httpStatus ?? "n/a"} | ${
          result.authenticated ? "yes" : "no"
        } | ${result.consoleErrors.length} | ${result.pageErrors.length} | ${
          result.failedRequests.length
        } | ${result.translationCoverage.englishPercent.toFixed(1)}% | ${
          result.translationCoverage.pass ? "PASS" : "FAIL"
        } | ${result.suspectedEnglishLeftovers.join(", ") || "-"} | ${
          result.suspectedEnglishBlocks.length
        } |`,
    )
    .join("\n");

  return `# V13.8 Full Workspace Localization Completion

Generated: ${generatedAt}

Base URL: ${BASE_URL}

## V13.8 Goal

Complete and verify authenticated Workspace main-content localization across zh-TW, zh-CN, en-US, ja-JP, and ko-KR. This report is generated by the authenticated production audit and is intentionally stricter than the V13.7 coverage report.

## Root Cause

V13.7 over-reported translation coverage because body-level token filtering allowed major product words and finance labels to be ignored. V13.8 uses DOM visible text blocks, source scan follow-up, and screenshot review to identify main-content English that still appears in non-English locales.

## Audit Method

- Reads visible DOM text blocks for headings, paragraphs, buttons, links, labels, tables, list items, and aria labels.
- Extracts suspicious English tokens from each visible text block.
- Extracts visible localized CJK/Kana/Hangul segments.
- Excludes only technical tokens such as numbers, tickers, FCN codes, currency codes, API paths, URLs, file names, enums, provider names, and code-like identifiers.
- Calculates English % as \`english tokens / (english tokens + localized visible segments)\`.
- Keeps screenshot evidence for every route + locale.
- Keeps suspected English block evidence so finance/product labels are reviewed instead of silently allowed.

Coverage standard:

- PASS when visible English UI coverage is \`${COVERAGE_STANDARD_ENGLISH_MAX}%\` or lower.
- FAIL when visible English UI coverage is above \`${COVERAGE_STANDARD_ENGLISH_MAX}%\`.

## Auth Status

- Storage state path: \`.auth/production-storage-state.json\`
- Auth storage created this run: ${authStorageCreated ? "yes" : "no"}
- Authenticated route checks: ${results.length - blocked.length}/${results.length}

## Authenticated Audit Integration

- Uses Playwright Chromium with persisted production storage state.
- Reads production Workspace routes from \`${BASE_URL}\`.
- Saves route + locale screenshots under \`qa-artifacts/production-authenticated-audit/\`.
- Writes this markdown evidence file to \`docs/V138_FULL_WORKSPACE_LOCALIZATION_COMPLETION.md\`.
- This audit script is allowed to scan production but does not modify auth, API, Supabase, or product data.

## Audited Routes

${markdownList(WORKSPACE_ROUTES.map((route) => `\`${route}\``))}

## Lower-Priority Public Routes For Source/Screenshot Follow-Up

${markdownList(PUBLIC_ROUTES.map((route) => `\`${route}\``))}

## Audited Locales

${markdownList(LOCALES.map((locale) => `\`${locale}\``))}

## Redirected / Blocked Routes

${markdownList(
  blocked.map((result) => `\`${result.locale}\` \`${result.route}\` final URL: \`${result.finalUrl}\``),
)}

## Route Results

| Locale | Route | HTTP | Workspace auth | Console errors | Page errors | Failed requests | English % | Coverage | Pattern leftovers | English blocks |
| --- | --- | ---: | --- | ---: | ---: | ---: | ---: | --- | --- | ---: |
${resultRows}

## DOM Coverage

${markdownList(
  results
    .filter((result) => result.locale !== "en-US")
    .map(
      (result) =>
        `\`${result.route}\` \`${result.locale}\`: English ${result.translationCoverage.englishPercent.toFixed(
          1,
        )}% / localized ${result.translationCoverage.localizedPercent.toFixed(1)}% — ${
          result.translationCoverage.pass ? "PASS" : "FAIL"
        }`,
    ),
)}

## Coverage By Page

${markdownList(
  WORKSPACE_ROUTES.map((route) => {
    const routeResults = results.filter((result) => result.route === route && result.locale !== "en-US");
    const averageEnglish =
      routeResults.reduce((total, result) => total + result.translationCoverage.englishPercent, 0) /
      Math.max(1, routeResults.length);
    const failingLocales = routeResults
      .filter((result) => !result.translationCoverage.pass)
      .map((result) => result.locale);

    return `\`${route}\`: average English ${averageEnglish.toFixed(1)}% — ${
      failingLocales.length ? `FAIL (${failingLocales.join(", ")})` : "PASS"
    }`;
  }),
)}

## Routes Completed

${markdownList(
  WORKSPACE_ROUTES.map((route) => {
    const routeResults = results.filter((result) => result.route === route);
    const authenticatedCount = routeResults.filter((result) => result.authenticated).length;
    const coveragePassCount = routeResults.filter((result) => result.translationCoverage.pass).length;

    return `\`${route}\`: authenticated ${authenticatedCount}/${routeResults.length}, coverage ${coveragePassCount}/${routeResults.length}`;
  }),
)}

## Coverage Failures

${markdownList(
  coverageFailRows.map(
    (result) =>
      `\`${result.locale}\` \`${result.route}\`: English ${result.translationCoverage.englishPercent.toFixed(
        1,
      )}% (${result.translationCoverage.sampleEnglishTokens.join(", ") || "no sample"})`,
  ),
)}

## Console Errors

${markdownList(
  consoleRows.flatMap((result) =>
    result.consoleErrors.map((error) => `\`${result.locale}\` \`${result.route}\`: ${error}`),
  ),
)}

## Page Errors

${markdownList(
  pageErrorRows.flatMap((result) => {
    const errors = [...result.pageErrors];
    if (result.error) errors.push(result.error);
    return errors.map((error) => `\`${result.locale}\` \`${result.route}\`: ${error}`);
  }),
)}

## Failed Requests

${markdownList(
  failedRequestRows.flatMap((result) =>
    result.failedRequests.map(
      (request) =>
        `\`${result.locale}\` \`${result.route}\`: ${request.method} ${request.url} (${request.failure})`,
    ),
  ),
)}

## Untranslated / Suspected English Leftovers

${markdownList(
  leftoverRows.map(
    (result) =>
      `\`${result.locale}\` \`${result.route}\`: patterns [${
        result.suspectedEnglishLeftovers.join(", ") || "-"
      }]; blocks ${result.suspectedEnglishBlocks
        .slice(0, 8)
        .map((block) => `"${block.text}"`)
        .join(" / ") || "-"}`,
  ),
)}

## DOM Visible Text Block Evidence

${markdownList(
  results
    .filter((result) => result.locale !== "en-US")
    .map(
      (result) =>
        `\`${result.locale}\` \`${result.route}\`: ${result.visibleTextBlockCount} visible blocks, ${result.suspectedEnglishBlocks.length} suspicious English block(s)`,
    ),
)}

## Screenshots Path Summary

Root: \`qa-artifacts/production-authenticated-audit/\`

${markdownList(
  screenshotRows.map((result) => `\`${result.locale}\` \`${result.route}\` → \`${result.screenshotPath}\``),
)}

## Remaining Issues

${markdownList(
  [
    blocked.length ? `${blocked.length} route/locale checks did not remain in authenticated Workspace.` : null,
    consoleRows.length ? `${consoleRows.length} route/locale checks produced console errors.` : null,
    pageErrorRows.length ? `${pageErrorRows.length} route/locale checks produced page errors.` : null,
    failedRequestRows.length ? `${failedRequestRows.length} route/locale checks had failed requests.` : null,
    leftoverRows.length ? `${leftoverRows.length} route/locale checks had suspected English leftovers.` : null,
    coverageFailRows.length ? `${coverageFailRows.length} route/locale checks exceeded the ${COVERAGE_STANDARD_ENGLISH_MAX}% English coverage standard.` : null,
  ].filter(Boolean),
)}

## Remaining Technical Debt

- DOM coverage is a practical production signal, not a semantic translation proof.
- Technical finance terms such as FCN, KI, KO, API, tickers, and currency codes are intentionally excluded.
- Engine output should continue to be handled through UI display mapping instead of modifying engine internals.
- Screenshots remain required to distinguish intentional technical English from untranslated UI copy.

## Validation

- \`npm run qa:production-authenticated\`: generated this report.
- \`git diff --check\`: run after implementation.
- \`npm run lint\`: run after implementation.
- \`npm run build\`: run after implementation.
- \`QA_PORT=3001 npm run qa:mobile\`: run after implementation.

## Next Fix Recommendations

- Review suspected English leftovers by screenshot before changing copy; some finance terms may intentionally remain English.
- Prioritize authenticated Workspace blockers before translation fixes if any route redirects out of \`/my-ixai/*\`.
- Fix repeated console or failed-request patterns before expanding visual QA assertions.
- Keep follow-up fixes limited to UI display mapping unless a product owner approves deeper behavior changes.

## Out Of Scope

- Auth behavior changes.
- Supabase schema, migrations, RLS, or API contract changes.
- Risk scoring, valuation, FCN engine, market provider, broker/trading, billing, scheduler, notification delivery, or AI provider changes.
`;
}

async function main() {
  const storage = await ensureStorageState();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    storageState: STORAGE_STATE_PATH,
    viewport: { height: 900, width: 1280 },
  });
  const results = [];

  try {
    const authCheck = await verifyStoredAuth(context);
    if (!authCheck.authenticated) {
      console.warn(
        `Stored auth did not reach authenticated Workspace. Current URL: ${authCheck.finalUrl}`,
      );
    }

    console.log("IXAI production authenticated audit");
    console.log(`Base URL: ${BASE_URL}`);
    console.log(`Routes: ${WORKSPACE_ROUTES.length}`);
    console.log(`Locales: ${LOCALES.join(", ")}`);

    for (const locale of LOCALES) {
      for (const route of WORKSPACE_ROUTES) {
        const result = await auditRoute(context, locale, route);
        results.push(result);
        console.log(
          `${result.authenticated ? "PASS" : "BLOCK"} ${locale} ${route} status=${
            result.httpStatus ?? "n/a"
          } console=${result.consoleErrors.length} failed=${result.failedRequests.length} leftovers=${
            result.suspectedEnglishLeftovers.length
          }`,
        );
      }
    }
  } finally {
    await browser.close();
  }

  const generatedAt = new Date().toISOString();
  const report = buildReport({
    authStorageCreated: storage.created,
    generatedAt,
    results,
  });

  await mkdir(path.dirname(REPORT_PATH), { recursive: true });
  await writeFile(REPORT_PATH, report);

  console.log("");
  console.log(`Report written to ${REPORT_PATH}`);
  console.log(`Screenshots written to ${ARTIFACT_ROOT}`);

  const hasBlocked = results.some((result) => !result.authenticated);
  const hasRuntimeErrors = results.some(
    (result) => result.consoleErrors.length > 0 || result.pageErrors.length > 0 || result.error,
  );

  if (hasBlocked || hasRuntimeErrors) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("[production-authenticated-audit] failed");
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
