#!/usr/bin/env node

import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const BASE_URL = "https://app.ixuan.ai";
const STORAGE_STATE_PATH = path.resolve(process.cwd(), ".auth", "production-storage-state.json");
const ARTIFACT_ROOT = path.resolve(process.cwd(), "qa-artifacts", "production-authenticated-audit");
const REPORT_PATH = path.resolve(process.cwd(), "docs", "V136_PRODUCTION_AUTHENTICATED_AUDIT_REPORT.md");

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
    /建立 IXAI Account|登入|Log in|Create account|IXAI Pro access|請先登入/i.test(text) &&
    !/IXAI Workspace|Workspace Home|工作區|Portfolio Center|Risk Center|Settings/i.test(text);

  return !blockedByUrl && !blockedByText && url.pathname.startsWith("/my-ixai");
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
      throw new Error(
        `Stored auth did not reach authenticated Workspace. Current URL: ${page.url()}`,
      );
    }
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
    const authenticated = await isWorkspaceAuthenticated(page);
    const leftovers =
      locale === "en-US"
        ? []
        : ENGLISH_LEFTOVER_PATTERNS.filter((pattern) => visibleText.includes(pattern));

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
  const leftoverRows = results.filter((result) => result.suspectedEnglishLeftovers.length > 0);
  const screenshotRows = results.filter((result) => result.screenshotPath);

  const resultRows = results
    .map(
      (result) =>
        `| ${result.locale} | ${result.route} | ${result.httpStatus ?? "n/a"} | ${
          result.authenticated ? "yes" : "no"
        } | ${result.consoleErrors.length} | ${result.pageErrors.length} | ${
          result.failedRequests.length
        } | ${result.suspectedEnglishLeftovers.join(", ") || "-"} |`,
    )
    .join("\n");

  return `# V13.6 Production Authenticated Audit Report

Generated: ${generatedAt}

Base URL: ${BASE_URL}

## Auth Status

- Storage state path: \`.auth/production-storage-state.json\`
- Auth storage created this run: ${authStorageCreated ? "yes" : "no"}
- Authenticated route checks: ${results.length - blocked.length}/${results.length}

## Audited Routes

${markdownList(WORKSPACE_ROUTES.map((route) => `\`${route}\``))}

## Audited Locales

${markdownList(LOCALES.map((locale) => `\`${locale}\``))}

## Redirected / Blocked Routes

${markdownList(
  blocked.map((result) => `\`${result.locale}\` \`${result.route}\` final URL: \`${result.finalUrl}\``),
)}

## Route Results

| Locale | Route | HTTP | Workspace auth | Console errors | Page errors | Failed requests | Suspected English leftovers |
| --- | --- | ---: | --- | ---: | ---: | ---: | --- |
${resultRows}

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
      `\`${result.locale}\` \`${result.route}\`: ${result.suspectedEnglishLeftovers.join(", ")}`,
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
  ].filter(Boolean),
)}

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
    await verifyStoredAuth(context);

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
