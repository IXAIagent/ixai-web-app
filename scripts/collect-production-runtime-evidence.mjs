#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import path from "node:path";

const DEFAULT_BASE_URL = "https://app.ixuan.ai";
const TARGET_ROUTES = [
  "/my-ixai/settings",
  "/my-ixai/copilot",
  "/my-ixai/intelligence",
];
const ROUTE_SWITCH_SEQUENCE = [
  "/my-ixai/settings",
  "/my-ixai/copilot",
  "/my-ixai/intelligence",
  "/my-ixai/settings",
];

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
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

function shouldRecordConsole(text) {
  return /Uncaught|unhandled|Failed to fetch|RESULT_CODE_HUNG|Render process gone|IXAI Runtime Diagnostics|error|warn/i.test(
    text,
  );
}

async function loadPlaywright() {
  try {
    return await import("playwright");
  } catch (error) {
    console.error("[runtime-evidence] Playwright is unavailable.");
    console.error("Install dependencies first, then retry: npm install");
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
    return null;
  }
}

async function promptForManualLogin(page, baseUrl) {
  const rl = createInterface({ input, output });

  console.log("");
  console.log("Manual login required.");
  console.log(`1. A Chromium window will open at ${baseUrl}.`);
  console.log("2. Log in normally.");
  console.log("3. Do not paste credentials into this terminal.");
  console.log("4. Return here and press Enter when the Workspace is ready.");
  console.log("");

  await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
  await rl.question("Press Enter after manual login is complete...");
  rl.close();
}

async function main() {
  const playwright = await loadPlaywright();

  if (!playwright) {
    return;
  }

  const baseUrl = process.env.IXAI_RUNTIME_EVIDENCE_URL || DEFAULT_BASE_URL;
  const runId = timestamp();
  const outputDir = path.join(process.cwd(), "artifacts", "runtime-evidence");
  const outputPath = path.join(outputDir, `${runId}.json`);
  const events = [];
  const routeResults = [];

  console.log("IXAI production runtime evidence collector");
  console.log(`Target: ${baseUrl}`);
  console.log("No credentials, tokens, localStorage contents, or holdings data will be saved.");
  console.log("Diagnostics flag will be enabled with localStorage key ixai.runtime.diagnostics=1.");

  const browser = await playwright.chromium.launch({
    headless: false,
  });
  const context = await browser.newContext({
    viewport: { height: 900, width: 1280 },
  });
  const page = await context.newPage();

  page.on("console", (message) => {
    const text = message.text();

    if (!shouldRecordConsole(text)) {
      return;
    }

    events.push({
      at: new Date().toISOString(),
      text: text.slice(0, 1000),
      type: `console:${message.type()}`,
    });
  });

  page.on("pageerror", (error) => {
    events.push({
      at: new Date().toISOString(),
      text: String(error).slice(0, 1000),
      type: "pageerror",
    });
  });

  page.on("requestfailed", (request) => {
    const url = redactUrl(request.url());

    if (!url.includes("/_next/") && !url.includes("/api/") && !url.includes("/sw.js")) {
      return;
    }

    events.push({
      at: new Date().toISOString(),
      failure: request.failure()?.errorText ?? "unknown_request_failure",
      method: request.method(),
      type: "requestfailed",
      url,
    });
  });

  try {
    await promptForManualLogin(page, baseUrl);

    await page.evaluate(() => {
      localStorage.setItem("ixai.runtime.diagnostics", "1");
    });
    await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });

    for (const route of TARGET_ROUTES) {
      for (let index = 0; index < 5; index += 1) {
        const startedAt = Date.now();
        const url = new URL(route, baseUrl).toString();
        const result = {
          durationMs: 0,
          ok: false,
          route,
          step: `reload-${index + 1}`,
        };

        try {
          const response = await page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: 60000,
          });
          await page.waitForTimeout(1200);
          const bodyLength = await page.locator("body").innerText({ timeout: 5000 })
            .then((text) => text.length)
            .catch(() => 0);

          result.durationMs = Date.now() - startedAt;
          result.ok = Boolean(response && response.ok() && bodyLength > 0);
          result.status = response?.status() ?? null;
          result.bodyLength = bodyLength;
        } catch (error) {
          result.durationMs = Date.now() - startedAt;
          result.error = error instanceof Error ? error.message : String(error);
        }

        routeResults.push(result);
      }
    }

    for (let index = 0; index < 50; index += 1) {
      const route = ROUTE_SWITCH_SEQUENCE[index % ROUTE_SWITCH_SEQUENCE.length];
      const startedAt = Date.now();
      const result = {
        durationMs: 0,
        ok: false,
        route,
        step: `switch-${index + 1}`,
      };

      try {
        const response = await page.goto(new URL(route, baseUrl).toString(), {
          waitUntil: "domcontentloaded",
          timeout: 60000,
        });
        await page.waitForTimeout(500);
        const bodyLength = await page.locator("body").innerText({ timeout: 5000 })
          .then((text) => text.length)
          .catch(() => 0);

        result.durationMs = Date.now() - startedAt;
        result.ok = Boolean(response && response.ok() && bodyLength > 0);
        result.status = response?.status() ?? null;
        result.bodyLength = bodyLength;
      } catch (error) {
        result.durationMs = Date.now() - startedAt;
        result.error = error instanceof Error ? error.message : String(error);
      }

      routeResults.push(result);
    }
  } finally {
    await mkdir(outputDir, { recursive: true });
    await writeFile(
      outputPath,
      JSON.stringify(
        {
          baseUrl,
          events,
          generatedAt: new Date().toISOString(),
          notes: [
            "Manual login was performed in the browser window.",
            "No credentials, tokens, localStorage contents, or holdings data are captured.",
            "If Chrome crashes before this file is written, rerun and copy visible console diagnostics before the crash.",
          ],
          routeResults,
          runId,
          targetRoutes: TARGET_ROUTES,
        },
        null,
        2,
      ),
    );

    console.log(`Runtime evidence saved to ${outputPath}`);
    await browser.close();
  }
}

main().catch((error) => {
  console.error("[runtime-evidence] failed");
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
