import {
  Building2,
  Coins,
  Database,
  FileSpreadsheet,
  Globe2,
  Layers3,
  Newspaper,
  Upload,
  WalletCards,
} from "lucide-react";
import type { ReactNode } from "react";

import { FeatureIcon } from "@/components/ui/feature-icon";
import {
  CSV_TEMPLATE_COLUMNS,
  SUPPORTED_CSV_IMPORT_SOURCES,
} from "@/src/lib/portfolio/input/csv-import";
import {
  getInputLanguageLabel,
  SUPPORTED_INPUT_LANGUAGES,
  SUPPORTED_INPUT_REGIONS,
} from "@/src/lib/portfolio/input/i18n-foundation";
import type {
  PortfolioInputAssetCategory,
  PortfolioInputMode,
} from "@/src/lib/portfolio/input/asset-types";

type InputModeCard = {
  copy: string;
  icon: typeof Upload;
  label: string;
  mode: PortfolioInputMode;
  status: string;
};

type AssetCategoryCard = {
  category: PortfolioInputAssetCategory;
  copy: string;
  status: "Coming Soon" | "Foundation" | "Ready for next phase";
};

const INPUT_MODES: InputModeCard[] = [
  {
    copy: "先保留人工輸入流程，延續目前 Portfolio 與 FCN foundation。",
    icon: WalletCards,
    label: "Manual Input",
    mode: "manual",
    status: "Ready for next phase",
  },
  {
    copy: "建立欄位規格與驗證框架，未來承接券商、交易所與銀行匯出檔。",
    icon: FileSpreadsheet,
    label: "CSV Import",
    mode: "csv",
    status: "Foundation",
  },
  {
    copy: "預留 Broker / Exchange / Bank sync 入口；本版不連接外部服務。",
    icon: Building2,
    label: "Broker Sync Coming Soon",
    mode: "broker_sync",
    status: "Coming Soon",
  },
];

const ASSET_CATEGORIES: AssetCategoryCard[] = [
  {
    category: "FCN",
    copy: "結構型商品條件、underlyings、Worst-of 與風險監控資料。",
    status: "Ready for next phase",
  },
  {
    category: "STOCK",
    copy: "台股、美股、港股、日股與 ETF 持倉資料入口。",
    status: "Foundation",
  },
  {
    category: "CRYPTO",
    copy: "Crypto spot 與交易所持倉資料入口。",
    status: "Foundation",
  },
  {
    category: "GRID",
    copy: "Grid 策略區間、格數與風險監控資料入口。",
    status: "Foundation",
  },
  {
    category: "DUAL",
    copy: "Dual investment 目標條件與結算資料入口。",
    status: "Foundation",
  },
  {
    category: "CASH",
    copy: "現金、銀行、券商與錢包資金部位的預留入口。",
    status: "Coming Soon",
  },
];

const BROKER_FOUNDATION = [
  ["Manual Input", "手動輸入仍是最小可控入口。"],
  ["CSV Import", "承接其他券商、交易所或銀行的匯出資料。"],
  ["Broker Sync", "未來連接券商資料同步。"],
  ["Exchange Sync", "未來連接交易所資料同步。"],
  ["Bank Statement Import", "未來承接銀行與對帳單資料。"],
] as const;

const NEWS_PREPARATION = [
  "Crypto related news",
  "US stock news",
  "Taiwan stock news",
  "FCN underlying stock news",
  "AI summary",
  "IXAI perspective",
  "Risk impact note",
];

function StatusPill({ status }: { status: string }) {
  return (
    <span className="inline-flex w-fit rounded-full border border-[rgba(176,141,87,0.36)] bg-[rgba(176,141,87,0.10)] px-2.5 py-1 text-[11px] font-semibold text-[var(--ixai-forest)]">
      {status}
    </span>
  );
}

function SectionShell({
  children,
  eyebrow,
  icon,
  title,
}: {
  children: ReactNode;
  eyebrow: string;
  icon: typeof Upload;
  title: string;
}) {
  return (
    <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/78 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-7 text-[var(--ixai-forest)]">
            {title}
          </h2>
        </div>
        <FeatureIcon icon={icon} shadow={false} />
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function AssetInputHub() {
  return (
    <div className="grid gap-5">
      <section className="rounded-2xl border border-[rgba(176,141,87,0.32)] bg-[var(--ixai-forest)] p-5 text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)] sm:p-7">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--ixai-gold)]">
              Portfolio Input Foundation
            </p>
            <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight sm:text-5xl">
              資產輸入中心
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/74 sm:text-base sm:leading-8">
              建立 IXAI 多資產資料入口，未來可支援手動輸入、CSV 匯入與券商同步。
            </p>
          </div>
          <FeatureIcon icon={Database} shadow={false} tone="cream" />
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {INPUT_MODES.map((mode) => (
            <article
              className="rounded-xl border border-white/10 bg-white/[0.06] p-4"
              key={mode.mode}
            >
              <FeatureIcon icon={mode.icon} shadow={false} size="sm" />
              <div className="mt-3 flex flex-col gap-2">
                <StatusPill status={mode.status} />
                <h2 className="text-base font-semibold text-[var(--ixai-cream)]">
                  {mode.label}
                </h2>
                <p className="text-sm leading-7 text-white/68">{mode.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <SectionShell eyebrow="Asset Categories" icon={Layers3} title="可支援資產類別">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {ASSET_CATEGORIES.map((item) => (
            <article
              className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
              key={item.category}
            >
              <div className="flex flex-col gap-3">
                <StatusPill status={item.status} />
                <div>
                  <h3 className="text-lg font-semibold text-[var(--ixai-forest)]">
                    {item.category}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                    {item.copy}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell eyebrow="CSV Import Foundation" icon={FileSpreadsheet} title="CSV 匯入規格預留">
        <div className="grid gap-3 lg:grid-cols-3">
          {[
            ["Upload CSV Placeholder", "本版不做檔案上傳或儲存，只保留入口語意。"],
            ["Download Template Placeholder", `模板欄位共 ${CSV_TEMPLATE_COLUMNS.length} 個，供後續實作使用。`],
            ["Validation Framework Placeholder", `預留 ${SUPPORTED_CSV_IMPORT_SOURCES.length} 種來源類型的欄位檢查。`],
          ].map(([title, copy]) => (
            <article
              className="rounded-xl border border-[var(--ixai-border)] bg-white/80 p-4"
              key={title}
            >
              <h3 className="text-base font-semibold text-[var(--ixai-forest)]">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                {copy}
              </p>
            </article>
          ))}
        </div>
        <p className="mt-4 rounded-xl border border-[rgba(176,141,87,0.28)] bg-[rgba(176,141,87,0.08)] p-4 text-sm leading-7 text-[var(--ixai-forest)]">
          CSV 匯入將用於把其他券商、交易所或銀行的持倉資料導入 IXAI。
        </p>
      </SectionShell>

      <SectionShell eyebrow="Multi-Broker Foundation" icon={Building2} title="多來源資料入口架構">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {BROKER_FOUNDATION.map(([label, copy], index) => (
            <article
              className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
              key={label}
            >
              <StatusPill status={index < 2 ? "Foundation" : "Coming Soon"} />
              <h3 className="mt-3 text-base font-semibold text-[var(--ixai-forest)]">
                {label}
              </h3>
              <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                {copy}
              </p>
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell eyebrow="i18n / Global Market Foundation" icon={Globe2} title="全球市場與語系預留">
        <div className="grid gap-3 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-xl border border-[var(--ixai-border)] bg-white/80 p-4">
            <h3 className="text-base font-semibold text-[var(--ixai-forest)]">
              預留語系
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {SUPPORTED_INPUT_LANGUAGES.map((language) => (
                <span
                  className="rounded-full border border-[rgba(9,41,31,0.14)] bg-[rgba(9,41,31,0.04)] px-3 py-1.5 text-xs font-semibold text-[var(--ixai-forest)]"
                  key={language}
                >
                  {language} · {getInputLanguageLabel(language)}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
            <h3 className="text-base font-semibold text-[var(--ixai-forest)]">
              市場範圍
            </h3>
            <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              IXAI 的長期市場包含台灣、香港、中國、日本、韓國、美國與歐洲。
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SUPPORTED_INPUT_REGIONS.map((region) => (
                <span
                  className="rounded-full border border-[rgba(176,141,87,0.32)] bg-[rgba(176,141,87,0.08)] px-3 py-1.5 text-xs font-semibold text-[var(--ixai-forest)]"
                  key={region}
                >
                  {region}
                </span>
              ))}
            </div>
          </div>
        </div>
      </SectionShell>

      <SectionShell eyebrow="News Intelligence Preparation" icon={Newspaper} title="持倉新聞與一玄觀點預備層">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {NEWS_PREPARATION.map((item) => (
            <article
              className="rounded-xl border border-[var(--ixai-border)] bg-white/80 p-4"
              key={item}
            >
              <div className="flex items-start gap-3">
                <FeatureIcon icon={Coins} size="sm" shadow={false} />
                <div>
                  <h3 className="text-base font-semibold text-[var(--ixai-forest)]">
                    {item}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                    未來將依使用者持倉建立對應閱讀與風險影響摘要；本版不接新聞 API。
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </SectionShell>

      <section className="rounded-2xl border border-[rgba(176,141,87,0.30)] bg-[rgba(176,141,87,0.08)] p-4 text-sm leading-7 text-[var(--ixai-forest)]">
        本頁僅用於資產資料整理與輸入流程規劃，不構成投資建議、交易指令、價格預測、績效承諾或自動交易。
      </section>
    </div>
  );
}
