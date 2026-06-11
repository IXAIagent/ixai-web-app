import { CheckCircle2, Clock3, Layers3, ShieldCheck } from "lucide-react";

import { FeatureIcon } from "@/components/ui/feature-icon";

type ArchitectureStatus = "coming_soon" | "enabled" | "mvp";

type ArchitectureItem = {
  copy: string;
  label: string;
  status: ArchitectureStatus;
};

type ArchitectureLayer = {
  items: ArchitectureItem[];
  title: string;
};

const STATUS_COPY: Record<ArchitectureStatus, string> = {
  coming_soon: "Coming Soon",
  enabled: "Enabled",
  mvp: "MVP",
};

const STATUS_CLASS: Record<ArchitectureStatus, string> = {
  coming_soon:
    "border-[rgba(9,41,31,0.18)] bg-white/65 text-[rgba(9,41,31,0.66)]",
  enabled:
    "border-[rgba(176,141,87,0.42)] bg-[rgba(176,141,87,0.10)] text-[var(--ixai-forest)]",
  mvp:
    "border-[rgba(9,41,31,0.18)] bg-[rgba(9,41,31,0.05)] text-[var(--ixai-forest)]",
};

const ARCHITECTURE_LAYERS: ArchitectureLayer[] = [
  {
    title: "Layer 1 — Portfolio Layer",
    items: [
      {
        copy: "使用者可建立 Portfolio，作為後續資產與風險讀取基礎。",
        label: "Portfolio Foundation",
        status: "enabled",
      },
      {
        copy: "Asset Input Hub 已定義 FCN、Stock、Crypto、Grid、Dual、Cash 輸入語言。",
        label: "Portfolio Input Foundation",
        status: "mvp",
      },
      {
        copy: "Asset Management Center 以 mock state 驗證 Create / Read / Update / Delete。",
        label: "Portfolio CRUD Foundation",
        status: "mvp",
      },
      {
        copy: "建立 Portfolio Account → Asset → Position 正式資料模型與 Supabase schema foundation。",
        label: "Portfolio Data Model Foundation",
        status: "mvp",
      },
      {
        copy: "建立 UI 與未來 Supabase persistence 之間的 Repository contract。",
        label: "Portfolio Repository Foundation",
        status: "mvp",
      },
      {
        copy: "Repository 已可透過 Supabase 讀取與新增 portfolio assets；Update / Delete 尚未啟用。",
        label: "Portfolio Persistence Foundation",
        status: "mvp",
      },
      {
        copy: "顯示 current user、account、asset、position 與 RLS owner-scoped status，驗證資料隔離。",
        label: "Portfolio Ownership Validation",
        status: "mvp",
      },
      {
        copy: "FCN、Stock、Crypto、Grid、Dual、Cash 類別已完成架構抽象。",
        label: "Multi-Asset Foundation",
        status: "mvp",
      },
      {
        copy: "FCN position 與 underlyings 可掛到 Portfolio。",
        label: "FCN Foundation",
        status: "enabled",
      },
      {
        copy: "Repository-driven dashboard 已可顯示 accounts、assets、positions、provider 與 region allocation。",
        label: "Portfolio Dashboard Foundation",
        status: "mvp",
      },
      {
        copy: "根據 Repository 資產產生去重排序的 tracked symbols，作為未來新聞與 AI commentary 的 universe。",
        label: "Portfolio News Intelligence Foundation",
        status: "mvp",
      },
      {
        copy: "Mock news provider 已可把 tracked symbols 轉成 Portfolio News Feed，尚未連接外部新聞來源。",
        label: "Portfolio News Provider Foundation",
        status: "mvp",
      },
      {
        copy: "Mock commentary provider 已可根據 Portfolio News Feed 產生 monitoring commentary，尚未連接任何 AI provider。",
        label: "Portfolio AI Commentary Foundation",
        status: "mvp",
      },
      {
        copy: "Mock scoring engine 已可彙整 assets、news、commentary 產生 health、risk、concentration 與 diversification scores。",
        label: "Portfolio Intelligence Engine Foundation",
        status: "mvp",
      },
      {
        copy: "Mock risk engine 已可根據 symbol concentration、FCN、crypto-like assets、cash buffer 與 diversification 產生 risk report。",
        label: "Portfolio Risk Engine Foundation",
        status: "mvp",
      },
    ],
  },
  {
    title: "Layer 2 — Risk & Intelligence Layer",
    items: [
      {
        copy: "根據手動儲存價格計算目前 weakest underlying。",
        label: "Worst-of Engine",
        status: "mvp",
      },
      {
        copy: "彙整 Near KI、集中度、Worst-of ranking 與風險分數。",
        label: "FCN Risk Engine",
        status: "mvp",
      },
      {
        copy: "產生 deterministic risk、Worst-of、concentration 與 Near-KI 解讀。",
        label: "FCN Intelligence Layer",
        status: "mvp",
      },
      {
        copy: "顯示 health score、risk distribution 與 monitoring highlights。",
        label: "Portfolio Intelligence Dashboard",
        status: "mvp",
      },
    ],
  },
  {
    title: "Layer 3 — Membership Layer",
    items: [
      {
        copy: "可使用 Portfolio、FCN 與 Risk foundation surfaces。",
        label: "Free",
        status: "enabled",
      },
      {
        copy: "預留 Basic 方案；目前權限與 Free 相同。",
        label: "Basic",
        status: "mvp",
      },
      {
        copy: "Pro Workspace 權限已由 entitlement 判斷。",
        label: "Pro",
        status: "mvp",
      },
      {
        copy: "前端顯示與 server readback 皆使用 membership / entitlement fields。",
        label: "Entitlement Guard",
        status: "mvp",
      },
    ],
  },
];

const READBACK_ITEMS: ArchitectureItem[] = [
  {
    copy: "彙整 Portfolio、FCN、Stock、Crypto 與 multi-asset 類別。",
    label: "Portfolio Readback",
    status: "enabled",
  },
  {
    copy: "顯示 FCN risk score、Near KI、Worst-of 與集中度。",
    label: "Risk Dashboard",
    status: "mvp",
  },
  {
    copy: "顯示 deterministic narratives 與 monitoring highlights。",
    label: "Intelligence Dashboard",
    status: "mvp",
  },
  {
    copy: "顯示 FCN、Stock、Crypto、Grid、Dual、Cash category summary。",
    label: "Multi-Asset Dashboard",
    status: "mvp",
  },
];

const FUTURE_ITEMS: ArchitectureItem[] = [
  {
    copy: "未啟用；未連接券商或交易系統。",
    label: "Broker Integration",
    status: "coming_soon",
  },
  {
    copy: "未啟用；目前只使用已儲存的手動資料。",
    label: "Market Data API",
    status: "coming_soon",
  },
  {
    copy: "未啟用；升級流程仍是 placeholder。",
    label: "Payment / Billing",
    status: "coming_soon",
  },
  {
    copy: "未啟用；目前沒有 AI API 或個人化代理。",
    label: "AI Advisory Agent",
    status: "coming_soon",
  },
  {
    copy: "未啟用；尚未連接真實新聞來源、provider ranking 或外部 feed。",
    label: "External News API",
    status: "coming_soon",
  },
  {
    copy: "未啟用；尚未建立推薦、排序、行動建議或個人化決策引擎。",
    label: "Portfolio Recommendation Engine",
    status: "coming_soon",
  },
];

function StatusPill({ status }: { status: ArchitectureStatus }) {
  const Icon = status === "coming_soon" ? Clock3 : CheckCircle2;

  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${STATUS_CLASS[status]}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {STATUS_COPY[status]}
    </span>
  );
}

function ArchitectureCard({ item }: { item: ArchitectureItem }) {
  return (
    <article className="rounded-xl border border-[var(--ixai-border)] bg-white/75 p-4">
      <div className="flex flex-col gap-3">
        <StatusPill status={item.status} />
        <div>
          <h4 className="text-base font-semibold leading-6 text-[var(--ixai-forest)]">
            {item.label}
          </h4>
          <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
            {item.copy}
          </p>
        </div>
      </div>
    </article>
  );
}

export function PortfolioArchitectureMap() {
  return (
    <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-[rgba(255,250,240,0.88)] p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
            IXAI Architecture Map
          </p>
          <h2 className="mt-2 text-2xl font-semibold leading-8 text-[var(--ixai-forest)]">
            IXAI 投資系統架構
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
            目前已啟用的 Portfolio、Input、CRUD、FCN、Risk、Intelligence 與 Membership 能力。
          </p>
        </div>
        <FeatureIcon icon={Layers3} shadow={false} />
      </div>

      <div className="mt-5 grid gap-4">
        {ARCHITECTURE_LAYERS.map((layer) => (
          <div
            className="rounded-xl border border-[rgba(9,41,31,0.10)] bg-white/55 p-4"
            key={layer.title}
          >
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.56)]">
              {layer.title}
            </h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {layer.items.map((item) => (
                <ArchitectureCard item={item} key={item.label} />
              ))}
            </div>
          </div>
        ))}

        <div className="rounded-xl border border-[rgba(9,41,31,0.10)] bg-white/55 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.56)]">
            Readback Layer
          </h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {READBACK_ITEMS.map((item) => (
              <ArchitectureCard item={item} key={item.label} />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[rgba(9,41,31,0.10)] bg-white/55 p-4">
          <div className="flex items-start gap-3">
            <FeatureIcon icon={ShieldCheck} size="sm" shadow={false} />
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.56)]">
                Future Boundaries
              </h3>
              <p className="mt-1 text-xs leading-6 text-[var(--ixai-forest-soft)]">
                下列能力尚未啟用；目前 Portfolio Center 僅做資料讀取、風險監控與資訊整理。
              </p>
            </div>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {FUTURE_ITEMS.map((item) => (
              <ArchitectureCard item={item} key={item.label} />
            ))}
          </div>
        </div>
      </div>

      <p className="mt-5 rounded-xl border border-[rgba(176,141,87,0.28)] bg-[rgba(176,141,87,0.08)] p-3 text-xs leading-6 text-[var(--ixai-forest-soft)]">
        Portfolio Foundation → Portfolio Input Foundation → Portfolio CRUD Foundation → Portfolio Data Model Foundation → Portfolio Repository Foundation → Portfolio Persistence Foundation → Portfolio Ownership Validation → Portfolio Dashboard Foundation → Portfolio News Intelligence Foundation → Portfolio News Provider Foundation → Portfolio AI Commentary Foundation → Portfolio Intelligence Engine Foundation → Portfolio Risk Engine Foundation → Portfolio Recommendation Engine（Coming Soon）。
        {" "}
        這些模組代表系統能力，並不構成投資建議、交易指令或績效承諾。
      </p>
    </section>
  );
}
