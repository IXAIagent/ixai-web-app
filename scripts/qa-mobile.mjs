#!/usr/bin/env node

import { spawn } from "node:child_process";
import { chromium } from "playwright";

const port = Number(process.env.QA_PORT ?? 3000);
const baseUrl = process.env.QA_BASE_URL ?? `http://localhost:${port}`;
const viewport = { width: 390, height: 844 };

const routeSpecs = [
  {
    path: "/",
    kind: "public",
    visibleText: ["讓 AI 開始理解你的投資世界", "Market Pulse"],
  },
  {
    path: "/daily-brief",
    kind: "public",
    visibleText: ["每日晨報", "今日市場觀察"],
  },
  {
    path: "/weekly-brief",
    kind: "public",
    visibleText: ["每週情報", "每週市場情報"],
  },
  {
    path: "/share",
    kind: "public",
    visibleText: ["Share", "Intelligence"],
  },
  {
    path: "/share/intelligence/market-pulse",
    kind: "public",
    visibleText: ["Market Pulse", "建立我的 Intelligence Layer"],
  },
  {
    path: "/onboarding",
    kind: "public",
    visibleText: ["Onboarding", "投資市場"],
  },
  {
    path: "/account",
    kind: "protected",
    visibleText: [
      "LINE 情報接收偏好",
      "我的 IXAI",
      "關注清單情報",
      "IXAI Pro",
    ],
  },
  {
    path: "/portfolio",
    kind: "protected",
    visibleText: ["投資組合分析", "Pro 保留功能"],
  },
  {
    path: "/fcn",
    kind: "protected",
    visibleText: ["FCN 教育", "什麼是 FCN", "了解 IXAI Pro"],
  },
  {
    path: "/risk",
    kind: "protected",
    visibleText: ["風險中心", "Pro 保留功能"],
  },
  {
    path: "/pro",
    kind: "protected",
    visibleText: ["IXAI Pro 入口", "開啟 IXAI Pro", "App 內 Pro 測試區"],
  },
  {
    path: "/pro-preview",
    kind: "public",
    visibleText: ["IXAI 情報預覽", "情報預覽"],
  },
  {
    path: "/pro-intelligence",
    kind: "protected",
    visibleText: ["Pro Intelligence", "建立你的 IXAI intelligence workspace"],
  },
  {
    path: "/admin",
    kind: "internal",
    visibleText: ["IXAI 營運控制台", "Admin", "控制台"],
  },
  {
    path: "/admin/daily-briefs",
    kind: "internal",
    visibleText: ["IXAI Editorial Studio", "Social Intelligence Engine", "Export Controls", "內部內容營運權限"],
  },
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 30000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url, { method: "HEAD" });
      if (response.status < 500) {
        return;
      }
    } catch {
      // Keep polling while Next boots.
    }

    await sleep(400);
  }

  throw new Error(`Timed out waiting for ${url}`);
}

function startDevServer() {
  if (process.env.QA_BASE_URL) {
    return null;
  }

  const child = spawn(
    "npm",
    ["run", "dev", "--", "-p", String(port)],
    {
      env: {
        ...process.env,
        BROWSER: "none",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  child.stdout.on("data", (chunk) => {
    const text = chunk.toString();
    if (process.env.QA_VERBOSE === "1") {
      process.stdout.write(text);
    }
  });

  child.stderr.on("data", (chunk) => {
    const text = chunk.toString();
    if (process.env.QA_VERBOSE === "1") {
      process.stderr.write(text);
    }
  });

  return child;
}

async function getVisibleTextMatches(page, candidates) {
  const matches = [];

  for (const text of candidates) {
    const locator = page.getByText(text, { exact: false }).first();
    try {
      if ((await locator.count()) > 0 && (await locator.isVisible({ timeout: 750 }))) {
        matches.push(text);
      }
    } catch {
      // Missing text is reported by the caller.
    }
  }

  return matches;
}

async function runRouteCheck(browser, spec) {
  const page = await browser.newPage({
    isMobile: true,
    viewport,
  });
  const consoleErrors = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  page.on("pageerror", (error) => {
    consoleErrors.push(error.message);
  });

  const response = await page.goto(`${baseUrl}${spec.path}`, {
    timeout: 30000,
    waitUntil: "domcontentloaded",
  });

  if (spec.path === "/admin/daily-briefs") {
    const localUnlock = page.getByText("以本機開發模式進入", { exact: false }).first();
    try {
      if ((await localUnlock.count()) > 0 && (await localUnlock.isVisible({ timeout: 750 }))) {
        await localUnlock.click();
      }
    } catch {
      // Password-protected or locked admin environments are still valid for smoke QA.
    }
  }

  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => undefined);
  await page.waitForTimeout(500);

  const metrics = await page.evaluate(() => {
    const text = document.body.innerText;
    const hydrationText =
      text.includes("Hydration failed") ||
      text.includes("Text content does not match") ||
      text.includes("There was an error while hydrating");

    return {
      clientWidth: document.documentElement.clientWidth,
      hasApplicationError:
        text.includes("Application error") || text.includes("This page could not be found"),
      hasHydrationText: hydrationText,
      hasHorizontalOverflow:
        document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      scrollWidth: document.documentElement.scrollWidth,
      title: document.title,
    };
  });

  const visibleMatches = await getVisibleTextMatches(page, spec.visibleText);
  const passed =
    response?.status() === 200 &&
    !metrics.hasApplicationError &&
    !metrics.hasHydrationText &&
    !metrics.hasHorizontalOverflow &&
    visibleMatches.length > 0 &&
    consoleErrors.length === 0;

  await page.close();

  return {
    ...metrics,
    consoleErrors,
    kind: spec.kind,
    matched: visibleMatches,
    passed,
    path: spec.path,
    status: response?.status() ?? null,
  };
}

function printResults(results) {
  console.log("\nIXAI mobile route smoke QA");
  console.log(`Viewport: ${viewport.width}x${viewport.height}`);
  console.log(`Base URL: ${baseUrl}\n`);

  for (const result of results) {
    const mark = result.passed ? "PASS" : "FAIL";
    const overflow = result.hasHorizontalOverflow
      ? `overflow ${result.scrollWidth}/${result.clientWidth}`
      : "no overflow";

    console.log(
      `${mark} ${result.path} [${result.kind}] status=${result.status} ${overflow} matched=${result.matched.join(", ") || "none"}`,
    );

    if (result.consoleErrors.length > 0) {
      console.log(`  console: ${result.consoleErrors.slice(0, 2).join(" | ")}`);
    }
  }
}

let server = null;

try {
  server = startDevServer();
  await waitForServer(baseUrl);

  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const spec of routeSpecs) {
    results.push(await runRouteCheck(browser, spec));
  }

  await browser.close();
  printResults(results);

  const failed = results.filter((result) => !result.passed);

  if (failed.length > 0) {
    console.error(`\n${failed.length} route(s) failed mobile QA.`);
    process.exitCode = 1;
  }
} finally {
  if (server) {
    server.kill("SIGTERM");
  }
}
