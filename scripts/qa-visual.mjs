#!/usr/bin/env node

// Screenshot QA. Boots a dev server (or uses QA_BASE_URL),
// opens the core conversion / Pro module surfaces, and saves a
// full-page PNG per route. Mobile viewport (390×844) matches qa-mobile.
//
// Usage:
//   QA_PORT=3001 npm run qa:visual
//   QA_BASE_URL=http://localhost:3001 npm run qa:visual
//
// Output:
//   tmp/visual-qa/<route>-<timestamp>.png  (gitignored — never committed)

import { mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { chromium } from "playwright";

const port = Number(process.env.QA_PORT ?? 3000);
const baseUrl = process.env.QA_BASE_URL ?? `http://localhost:${port}`;
const viewport = { width: 390, height: 844 };

const ROUTES = [
  { path: "/", visibleText: ["一玄 AI 投資助理"] },
  { path: "/pro", visibleText: ["開啟 IXAI Pro", "了解 FCN 監控", "預約顧問諮詢"] },
  {
    authGatedOk: true,
    path: "/account",
    visibleText: ["開啟 IXAI Pro", "Pro 串接"],
  },
  { path: "/portfolio", visibleText: ["投資組合分析"] },
  { path: "/risk", visibleText: ["風險中心"] },
];

const OUTPUT_DIR = path.resolve(process.cwd(), "tmp", "visual-qa");

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
      // keep polling while next boots
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
      env: { ...process.env, BROWSER: "none" },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  child.stdout.on("data", (chunk) => {
    if (process.env.QA_VERBOSE === "1") process.stdout.write(chunk.toString());
  });
  child.stderr.on("data", (chunk) => {
    if (process.env.QA_VERBOSE === "1") process.stderr.write(chunk.toString());
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

async function shoot(browser, routeSpec, stamp) {
  const route = routeSpec.path;
  const page = await browser.newPage({ isMobile: true, viewport });
  const url = `${baseUrl}${route}`;
  const safeName = route.replace(/^\//, "").replace(/\//g, "_") || "root";
  const outputPath = path.join(OUTPUT_DIR, `${safeName}-${stamp}.png`);

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 20000 });
    // Allow client-side hydration of FeatureIcon and Pro entitlement fetches.
    await sleep(1500);
    const visibleMatches = await getVisibleTextMatches(page, routeSpec.visibleText);
    if (visibleMatches.length < routeSpec.visibleText.length) {
      const bodyText = await page.evaluate(() => document.body.innerText);
      const authGated =
        routeSpec.authGatedOk &&
        (bodyText.includes("建立 IXAI Account") || bodyText.includes("登入"));

      if (authGated) {
        await page.screenshot({ path: outputPath, fullPage: true });
        console.log(
          `AUTH-GATED ${route.padEnd(16)} missing=${routeSpec.visibleText
            .filter((text) => !visibleMatches.includes(text))
            .join(", ")} → ${outputPath}`,
        );
        return { authGated: true, route, ok: true, outputPath };
      }

      const missing = routeSpec.visibleText.filter((text) => !visibleMatches.includes(text));
      throw new Error(`Missing visible text: ${missing.join(", ")}`);
    }
    await page.screenshot({ path: outputPath, fullPage: true });
    console.log(
      `SHOT  ${route.padEnd(20)} matched=${visibleMatches.join(", ")} → ${outputPath}`,
    );
    return { route, ok: true, outputPath };
  } catch (error) {
    console.error(`FAIL  ${route} :: ${error?.message ?? error}`);
    return { route, ok: false, error: String(error?.message ?? error) };
  } finally {
    await page.close();
  }
}

async function main() {
  const devServer = startDevServer();
  let browser;
  let exitCode = 0;

  try {
    await waitForServer(baseUrl);
    await mkdir(OUTPUT_DIR, { recursive: true });

    browser = await chromium.launch();
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");

    console.log("IXAI visual QA — conversion and Pro module pages");
    console.log(`Viewport: ${viewport.width}x${viewport.height}`);
    console.log(`Base URL: ${baseUrl}`);
    console.log("");

    const results = [];
    for (const routeSpec of ROUTES) {
      results.push(await shoot(browser, routeSpec, stamp));
    }

    const failed = results.filter((r) => !r.ok);
    if (failed.length > 0) {
      exitCode = 1;
      console.error(`\n${failed.length}/${results.length} screenshot(s) failed.`);
    } else {
      console.log(`\n${results.length}/${results.length} screenshots captured to ${OUTPUT_DIR}`);
    }
  } catch (error) {
    console.error(error);
    exitCode = 2;
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
    if (devServer) {
      devServer.kill();
    }
  }

  process.exit(exitCode);
}

void main();
