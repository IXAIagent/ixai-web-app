import { chromium } from "playwright";

const baseUrl = process.env.QA_BASE_URL || "http://localhost:3001";

function weeklyDraft(overrides) {
  const base = {
    id: "weekly-fixture-base",
    slug: "weekly-intelligence-2026-06-14",
    title: "FOMC 前，市場在重新定價 AI、美元與 FCN 風險",
    status: "published",
    weekStart: "2026-06-08",
    weekEnd: "2026-06-14",
    publishDate: "2026-06-14",
    generatedAt: "2026-06-14T08:00:00.000Z",
    updatedAt: "2026-06-14T08:20:00.000Z",
    publishedAt: "2026-06-14T08:30:00.000Z",
    sourceMode: "fixture",
    summary:
      "本週核心不是新聞數量，而是 FOMC 前後的利率、美元、AI beta、台股半導體與 Crypto/FCN 波動鏈條重新定價。",
    sections: {
      marketHighlights: [
        {
          label: "Macro",
          headline: "Fed / Rates → USD：FOMC 與 Powell 訊號決定美元與風險資產節奏",
          summary: "利率與美元走勢會影響 QQQ、SPY、BTC 與高 beta AI 股票的資金配置。",
          ixuanView: "如果 Powell 對通膨與降息時點更謹慎，市場會重新檢查 AI beta 與台股半導體的估值彈性。",
        },
        {
          label: "AI",
          headline: "AI Beta → Taiwan Semis：NVDA guidance、cloud capex 與台積電供應鏈成為風險錨點",
          summary: "AI earnings、guidance、capex、cloud 與 data center 訊號決定台積電、2330 與半導體供應鏈能否延續資金動能。",
          ixuanView: "AI 交易不只看漲幅，而是看財報與資本支出是否能支撐下一輪估值。",
        },
        {
          label: "FCN",
          headline: "Crypto → FCN Volatility：BTC 波動會放大 worst-of basket 壓力",
          summary: "BTC、QQQ 與 AI 股票波動若同步升高，FCN 籃子標的需要重新檢查 KO/KI 距離與 worst-of 壓力。",
          ixuanView: "FCN 不是只看配息，波動與籃子集中度會改變風險監控優先順序。",
        },
      ],
      majorEvents: [
        {
          label: "FOMC",
          title: "FOMC / Powell press conference",
          whyItMatters: "利率、美元與殖利率訊號會影響 AI beta、QQQ、SPY 與 BTC 的資金方向。",
        },
        {
          label: "AI earnings",
          title: "NVDA guidance / cloud capex / data center orders",
          whyItMatters: "AI 財報與 guidance 決定台積電與半導體供應鏈能否把 AI 變成可驗證的收入。",
        },
        {
          label: "Taiwan semis",
          title: "台積電 / 2330 / AI server supply chain",
          whyItMatters: "台股半導體若量價背離，FCN worst-of basket 波動會被放大。",
        },
      ],
      nextWeekFocus: [
        "2026-06-17｜FOMC / Powell 利率訊號",
        "2026-06-18｜NVDA guidance / cloud capex / data center orders",
        "2026-06-19｜台積電 2330 與 AI server 供應鏈資金流",
        "2026-06-20｜BTC / QQQ 波動與 FCN worst-of basket 壓力",
      ],
      earningsFocus: [
        "NVDA guidance",
        "AVGO / MU AI infrastructure demand",
        "TSMC / 台積電 AI server supply chain",
      ],
      fedRates: {
        headline: "Fed / Rates",
        summary: "FOMC、Powell、利率與美元是下週跨市場風險定價的第一層。",
      },
      taiwanAi: {
        headline: "Taiwan AI",
        summary: "台積電、2330、AI server 與半導體供應鏈要用 guidance / capex 驗證估值。",
      },
      fcnMarketObservation: {
        sentiment: "FCN risk awareness: worst-of basket pressure, KO/KI distance, volatility and basket concentration must be monitored.",
        keyRisks: ["worst-of basket pressure", "KO/KI distance", "volatility", "basket concentration"],
        watchpoints: ["QQQ / BTC volatility", "AI beta drawdown", "台股半導體集中度"],
      },
      intelligenceSummary: {
        pricing: "本週市場在交易 FOMC 前的利率與美元定價，以及 AI beta 是否能被財報、guidance、capex 與台灣半導體供應鏈驗證。",
        whatChanged: "宏觀利率、AI 財報與 Crypto 波動形成同一條 cross-market chain。",
        riskTone: "watch",
      },
      periodicNarrative: {
        mainNarrative:
          "Fed → USD → AI Beta → Taiwan Semis → Crypto → FCN 的鏈條是下週觀察核心，投資人要看資金是否從故事轉向證據。",
        oneThingThatMatters:
          "唯一關鍵是 AI 成長能否被 guidance、capex 與台積電供應鏈驗證，而不是只靠漲幅延續。",
        whatToWatchNext: [
          "FOMC / Powell",
          "NVDA guidance / cloud capex",
          "台積電 2330",
          "BTC / QQQ volatility",
        ],
      },
    },
    aiSuggestion: {
      summarySuggestion:
        "下週市場重點在 FOMC、AI guidance、台積電供應鏈與 FCN worst-of basket 波動。",
      keyThemes: ["FOMC", "AI guidance", "Taiwan semis", "FCN volatility"],
      riskFocus: ["rates", "USD", "AI beta", "FCN worst-of"],
      nextWeekWatchlist: [
        "FOMC / Powell",
        "NVDA guidance",
        "TSMC / 2330",
        "BTC / QQQ volatility",
      ],
      intelligenceNarrative:
        "市場正在從 AI 故事轉向可驗證的財報與 capex 證據，FCN 需同步監控 worst-of basket pressure 與 KO/KI 距離。",
      sourceMode: "fixture",
      inputNewsCount: 12,
      sourceLabels: ["fixture"],
      generatedAt: "2026-06-14T08:00:00.000Z",
    },
    editorialNotes: "Fixture for v1.83.4b Weekly export validation.",
    complianceNote: "Market intelligence and education only. Not personalized investment advice.",
    createdBy: "fixture",
    updatedBy: "fixture",
    revisionNumber: 1,
    parentWeeklyId: null,
    isCanonical: true,
    supersededAt: null,
    supersededBy: null,
    revisionNote: "",
  };

  return { ...base, ...overrides };
}

const selectedReview = weeklyDraft({
  id: "weekly-r2-review",
  slug: "weekly-intelligence-2026-06-14-r2",
  status: "review",
  updatedAt: "2026-06-14T10:00:00.000Z",
  publishedAt: undefined,
  revisionNumber: 2,
  isCanonical: false,
  title: "Review draft: FOMC 前的 AI / FCN 風險檢查",
});

const canonicalPublished = weeklyDraft({
  id: "weekly-canonical-published",
  slug: "weekly-intelligence-2026-06-14",
  status: "published",
  updatedAt: "2026-06-14T09:00:00.000Z",
  publishedAt: "2026-06-14T09:05:00.000Z",
  revisionNumber: 1,
  isCanonical: true,
});

function extractValue(text, label) {
  const pattern = new RegExp(`${label}:\\s*([^\\n]+)`);
  return text.match(pattern)?.[1]?.trim() ?? "";
}

function narrativeSegment(text) {
  const start = text.indexOf("PREVIEW SOCIAL PACK");
  return start >= 0 ? text.slice(start) : text;
}

function sentenceParts(value) {
  return value
    .split(/[。！？!?；;\n]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function shouldIgnoreNarrativeLine(value) {
  return (
    value.length < 10 ||
    /^https?:\/\//i.test(value) ||
    /app\.ixuan\.ai/i.test(value) ||
    /IXAI INTELLIGENCE/i.test(value) ||
    /I-Xuan Investment Co\., Ltd\./i.test(value) ||
    /Market intelligence and education only/i.test(value) ||
    /市場資訊與教育分享/i.test(value) ||
    /^\d{4}\/\d{2}\/\d{2}/.test(value) ||
    /^(Download PNG|Copy caption|Export Current Pack|Content quality|Quality issues|Export eligible|Source eligible|Selected slug|Source slug|Selected status|Source status|Selected canonical|Canonical)$/i.test(value) ||
    /^(Weekly Intelligence|Daily Brief|I-Xuan Weekly View|I-Xuan View|一玄週觀點|Market Review|Next Week Catalysts|AI \/ Tech Weekly)$/i.test(value)
  );
}

function repeatedNarrativeLines(text) {
  const counts = new Map();

  for (const sentence of sentenceParts(narrativeSegment(text))) {
    const normalized = sentence.replace(/\s+/g, " ").trim();
    if (shouldIgnoreNarrativeLine(normalized)) continue;
    counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  }

  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([sentence]) => sentence);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 1600 } });

  await page.route("**/api/admin/weekly-briefs", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        drafts: [selectedReview, canonicalPublished],
        persistence: {
          readable: true,
          revisionSchemaAvailable: true,
          writable: true,
        },
        note: "Weekly fixture response for v1.83.4b validation.",
      }),
    });
  });

  await page.goto(`${baseUrl}/admin/daily-briefs#weekly`, { waitUntil: "networkidle" });

  const localGate = page.getByRole("button", { name: /以本機開發模式進入/ });
  if (await localGate.count()) {
    await localGate.click();
    await page.waitForLoadState("networkidle").catch(() => {});
  }

  const weeklyTab = page.getByRole("button", { name: /^Weekly Intelligence$/ });
  if (await weeklyTab.count()) {
    await weeklyTab.first().click();
    await page.waitForTimeout(1500);
  }

  const weeklyButton = page.getByRole("button", { name: /Generate Weekly Social Pack/i }).first();
  if (await weeklyButton.count()) {
    await weeklyButton.click();
    await page.waitForTimeout(500);
  }

  const text = await page.locator("body").innerText();
  const studioText = text.split("SOCIAL INTELLIGENCE ENGINE").at(-1) ?? text;
  const qualityIssues = extractValue(studioText, "Quality issues");
  const actual = {
    selectedSlug: extractValue(studioText, "Selected slug"),
    sourceSlug: extractValue(studioText, "Source slug"),
    selectedStatus: extractValue(studioText, "Selected status"),
    sourceStatus: extractValue(studioText, "Source status"),
    selectedCanonical: extractValue(studioText, "Selected canonical"),
    sourceCanonical: extractValue(studioText, "Canonical"),
    sourceEligible: extractValue(studioText, "Source eligible"),
    exportEligible: extractValue(studioText, "Export eligible"),
    contentQuality: extractValue(studioText, "Content quality"),
    qualityIssues,
    exportCurrentPackVisible: /Export Current Pack/.test(studioText),
    copyCaptionVisible: /Copy caption/.test(studioText),
    downloadPngVisible: /Download PNG/.test(studioText),
    exportCurrentPackEnabled: await page.getByRole("button", { name: /Export Current Pack/i }).first().isEnabled().catch(() => false),
    copyCaptionEnabled: await page.getByRole("button", { name: /Copy caption/i }).first().isEnabled().catch(() => false),
    downloadPngEnabled: await page.getByRole("button", { name: /Download PNG/i }).first().isEnabled().catch(() => false),
    duplicateSentenceIssues: (studioText.match(/duplicate_sentence/g) ?? []).length,
    duplicateNarrativeIssues: qualityIssues === "0" ? [] : repeatedNarrativeLines(studioText),
    marketPulseOccurrences: (studioText.match(/Market Pulse/g) ?? []).length,
  };

  const expected = {
    selectedSlug: selectedReview.slug,
    sourceSlug: canonicalPublished.slug,
    selectedStatus: "review",
    sourceStatus: "published",
    selectedCanonical: "false",
    sourceCanonical: "true",
    sourceEligible: "true",
    exportEligible: "true",
    contentQuality: "passed",
    qualityIssues: "0",
  };

  const failures = Object.entries(expected)
    .filter(([key, value]) => actual[key] !== value)
    .map(([key, value]) => `${key}: expected ${value}, got ${actual[key] || "(empty)"}`);

  if (!actual.exportCurrentPackVisible || !actual.exportCurrentPackEnabled) {
    failures.push("Export Current Pack must be visible and enabled");
  }

  if (!actual.copyCaptionVisible || !actual.copyCaptionEnabled) {
    failures.push("Copy caption must be visible and enabled");
  }

  if (!actual.downloadPngVisible || !actual.downloadPngEnabled) {
    failures.push("Download PNG must be visible and enabled");
  }

  if (actual.duplicateNarrativeIssues.length > 0) {
    failures.push(`Narrative duplicates found: ${actual.duplicateNarrativeIssues.join(" | ")}`);
  }

  if (actual.duplicateSentenceIssues > 0) {
    failures.push(`duplicate_sentence diagnostics should be 0, got ${actual.duplicateSentenceIssues}`);
  }

  if (actual.marketPulseOccurrences > 0) {
    failures.push(`Market Pulse render fallback still visible (${actual.marketPulseOccurrences} occurrence(s))`);
  }

  const result = {
    ok: failures.length === 0,
    baseUrl,
    expected,
    actual,
    failures,
  };

  console.log(JSON.stringify(result, null, 2));
  await browser.close();

  if (!result.ok) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
