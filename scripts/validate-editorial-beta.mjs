#!/usr/bin/env node

import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const port = Number(process.env.QA_PORT ?? process.env.EDITORIAL_QA_PORT ?? 3002);
const baseUrl = process.env.QA_BASE_URL ?? `http://localhost:${port}`;
const viewport = { width: 1280, height: 900 };

const routeSpecs = [
  {
    path: "/daily-brief",
    label: "Daily Brief",
    visibleText: [
      "每日晨報",
      "今日市場觀察",
      "Daily Brief 2.0 Foundation Preview",
      "Beta readiness",
      "Developer diagnostics",
      "Last updated",
    ],
  },
  {
    path: "/weekly-brief",
    label: "Weekly Brief",
    visibleText: [
      "每週情報",
      "每週市場情報",
      "Weekly Brief 2.0 Foundation Preview",
      "Beta readiness",
      "Developer diagnostics",
      "Last updated",
    ],
  },
  {
    path: "/admin/daily-briefs",
    label: "Admin Daily Briefs",
    visibleText: [
      "IXAI Editorial Studio",
      "Production Editorial Console",
      "Provider",
      "Publish",
      "Checklist",
    ],
    unlockLocalAdmin: true,
  },
];

const directProviderLeakPatterns = [
  "quoteResponse",
  "<rss",
  "<channel",
  "content.clickThroughUrl",
  "query1.finance.yahoo.com/v7/finance/quote",
  "finance.yahoo.com/rss",
  "news.google.com/rss",
];

function sleep(ms) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

function startDevServer() {
  if (process.env.QA_BASE_URL) {
    return null;
  }

  const child = spawn("npm", ["run", "dev", "--", "-p", String(port)], {
    env: {
      ...process.env,
      BROWSER: "none",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.on("data", (chunk) => {
    if (process.env.QA_VERBOSE === "1") {
      process.stdout.write(chunk.toString());
    }
  });

  child.stderr.on("data", (chunk) => {
    if (process.env.QA_VERBOSE === "1") {
      process.stderr.write(chunk.toString());
    }
  });

  return child;
}

async function waitForServer(url, timeoutMs = 45000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url, { method: "HEAD" });
      if (response.status < 500) {
        return;
      }
    } catch {
      // Next may still be booting.
    }

    await sleep(400);
  }

  throw new Error(`Timed out waiting for ${url}`);
}

async function visibleTextMatches(page, candidates) {
  const matches = [];

  for (const text of candidates) {
    const locator = page.getByText(text, { exact: false }).first();
    try {
      if ((await locator.count()) > 0 && (await locator.isVisible({ timeout: 1000 }))) {
        matches.push(text);
      }
    } catch {
      // Missing text is reported by the caller.
    }
  }

  return matches;
}

async function runRouteCheck(browser, spec) {
  const page = await browser.newPage({ viewport });
  const consoleErrors = [];
  const failedRequests = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  page.on("pageerror", (error) => {
    consoleErrors.push(error.message);
  });

  page.on("requestfailed", (request) => {
    failedRequests.push(`${request.method()} ${request.url()} :: ${request.failure()?.errorText ?? "failed"}`);
  });

  const response = await page.goto(`${baseUrl}${spec.path}`, {
    timeout: 45000,
    waitUntil: "domcontentloaded",
  });

  if (spec.unlockLocalAdmin) {
    const localUnlock = page.getByText("以本機開發模式進入", { exact: false }).first();
    try {
      if ((await localUnlock.count()) > 0 && (await localUnlock.isVisible({ timeout: 1000 }))) {
        await localUnlock.click();
      }
    } catch {
      // Production admin remains gated; local QA can continue if the page shell rendered.
    }
  }

  await page.waitForLoadState("networkidle", { timeout: 12000 }).catch(() => undefined);
  await page.waitForTimeout(500);

  const metrics = await page.evaluate((leakPatterns) => {
    const bodyText = document.body.innerText;
    const html = document.documentElement.innerHTML;
    const lowerHtml = html.toLowerCase();

    return {
      hasApplicationError:
        bodyText.includes("Application error") ||
        bodyText.includes("This page could not be found") ||
        bodyText.includes("Unhandled Runtime Error"),
      hasHydrationError:
        bodyText.includes("Hydration failed") ||
        bodyText.includes("Text content does not match") ||
        bodyText.includes("There was an error while hydrating"),
      hasDirectProviderLeak: leakPatterns.some((pattern) => lowerHtml.includes(pattern.toLowerCase())),
      textLength: bodyText.length,
      title: document.title,
    };
  }, directProviderLeakPatterns);

  const matched = await visibleTextMatches(page, spec.visibleText);
  const passed =
    (response?.status() ?? 0) < 500 &&
    matched.length >= Math.min(3, spec.visibleText.length) &&
    !metrics.hasApplicationError &&
    !metrics.hasHydrationError &&
    !metrics.hasDirectProviderLeak &&
    consoleErrors.length === 0;

  await page.close();

  return {
    ...metrics,
    consoleErrors,
    failedRequests,
    label: spec.label,
    matched,
    passed,
    path: spec.path,
    status: response?.status() ?? null,
  };
}

function assertSourceContains(filePath, patterns, failures) {
  const absolute = resolve(process.cwd(), filePath);

  if (!existsSync(absolute)) {
    failures.push(`Missing source file: ${filePath}`);
    return;
  }

  const content = readFileSync(absolute, "utf8");

  for (const pattern of patterns) {
    if (!content.includes(pattern)) {
      failures.push(`Source assertion failed in ${filePath}: missing ${pattern}`);
    }
  }
}

function runSourceAssertions() {
  const failures = [];

  assertSourceContains(
    "src/lib/editorial/providers/provider-source.ts",
    [
      "getEditorialProviderSourceResultAsync",
      "fallback",
      "fetchResult",
      "cacheHit",
      "publicationReadiness",
    ],
    failures,
  );

  assertSourceContains(
    "src/lib/editorial/daily-brief/daily-brief-builder.ts",
    [
      "buildDailyBrief2SnapshotAsync",
      "getEditorialProviderSourceResultAsync",
      "productionMetadata",
      "providerDiagnostics",
    ],
    failures,
  );

  assertSourceContains(
    "src/lib/editorial/weekly-brief/weekly-brief-builder.ts",
    [
      "buildWeeklyBrief2SnapshotAsync",
      "getEditorialProviderSourceResultAsync",
      "productionMetadata",
      "providerDiagnostics",
    ],
    failures,
  );

  assertSourceContains(
    "src/lib/editorial/production/editorial-production-pipeline.ts",
    ["autoPublishEnabled: false", "draft_review_only"],
    failures,
  );

  for (const providerFile of [
    "src/lib/editorial/providers/google-news-rss-provider.ts",
    "src/lib/editorial/providers/yahoo-finance-news-provider.ts",
    "src/lib/editorial/providers/yahoo-finance-market-provider.ts",
  ]) {
    assertSourceContains(providerFile, ["EditorialRawStory"], failures);
  }

  return failures;
}

function printRouteResults(results) {
  console.log("\nIXAI Editorial Beta route validation");
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Viewport: ${viewport.width}x${viewport.height}\n`);

  for (const result of results) {
    const status = result.passed ? "PASS" : "FAIL";
    console.log(`${status} ${result.path} (${result.label})`);
    console.log(`  HTTP: ${result.status}`);
    console.log(`  Matched: ${result.matched.join(", ") || "none"}`);
    console.log(`  Console errors: ${result.consoleErrors.length}`);
    console.log(`  Failed requests: ${result.failedRequests.length}`);
    console.log(`  Direct provider response leak: ${result.hasDirectProviderLeak ? "yes" : "no"}`);
  }
}

async function main() {
  const server = startDevServer();
  let browser;

  try {
    await waitForServer(`${baseUrl}/daily-brief`);
    browser = await chromium.launch({ headless: true });

    const routeResults = [];
    for (const spec of routeSpecs) {
      routeResults.push(await runRouteCheck(browser, spec));
    }

    const sourceFailures = runSourceAssertions();

    printRouteResults(routeResults);

    console.log("\nEditorial Beta source assertions");
    if (sourceFailures.length === 0) {
      console.log("PASS source contracts, fallback path, production metadata, and no auto-publish guard");
    } else {
      for (const failure of sourceFailures) {
        console.log(`FAIL ${failure}`);
      }
    }

    const failedRoutes = routeResults.filter((result) => !result.passed);
    const routeFailureDetails = failedRoutes.flatMap((result) => [
      `${result.path} failed`,
      ...result.consoleErrors.map((error) => `console: ${error}`),
    ]);
    const failures = [...routeFailureDetails, ...sourceFailures];

    if (failures.length > 0) {
      console.error("\nEditorial beta validation failed:");
      for (const failure of failures) {
        console.error(`- ${failure}`);
      }
      process.exitCode = 1;
      return;
    }

    console.log("\nEditorial beta validation PASS");
  } finally {
    if (browser) {
      await browser.close();
    }
    if (server) {
      server.kill("SIGTERM");
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
