"use client";

import { useEffect, useMemo, useState } from "react";
import { Database } from "lucide-react";

import { AssetCard } from "@/components/portfolio/asset-card";
import { AssetForm } from "@/components/portfolio/asset-form";
import { DeleteAssetDialog } from "@/components/portfolio/delete-asset-dialog";
import { FeatureIcon } from "@/components/ui/feature-icon";
import type { PortfolioAsset } from "@/src/lib/portfolio/data-model/portfolio-asset-types";
import { getPortfolioRepository } from "@/src/lib/portfolio/repository/portfolio-persistence-provider";
import type { PortfolioOwnershipValidationStatus } from "@/src/lib/portfolio/repository/portfolio-repository";
import type {
  PortfolioCrudAsset,
  PortfolioCrudAssetInput,
} from "@/src/lib/portfolio/crud/portfolio-crud-types";

const portfolioRepository = getPortfolioRepository("supabase");

function mapAssetToCrudAsset(asset: PortfolioAsset): PortfolioCrudAsset {
  return {
    category: asset.category,
    createdAt: asset.createdAt,
    currency: asset.currency,
    id: asset.id,
    name: asset.name,
    notes: `Supabase asset from account ${asset.accountId}.`,
    region: asset.region,
    status: "active",
    updatedAt: asset.updatedAt,
  };
}

function buildSymbol(input: PortfolioCrudAssetInput) {
  return input.name.trim().toUpperCase().replace(/\s+/g, "-");
}

export function AssetList() {
  const [assets, setAssets] = useState<PortfolioCrudAsset[]>([]);
  const [editingAsset, setEditingAsset] = useState<PortfolioCrudAsset | null>(null);
  const [pendingDeleteAsset, setPendingDeleteAsset] = useState<PortfolioCrudAsset | null>(null);
  const [loadStatus, setLoadStatus] = useState<"error" | "loading" | "ready">("loading");
  const [message, setMessage] = useState<string | null>(null);
  const [validationStatus, setValidationStatus] =
    useState<PortfolioOwnershipValidationStatus | null>(null);

  useEffect(() => {
    let active = true;

    async function loadRepositoryState() {
      const [repositoryAssets, ownershipStatus] = await Promise.all([
        portfolioRepository.getAssets(),
        portfolioRepository.getOwnershipValidationStatus(),
      ]);

      return {
        ownershipStatus,
        repositoryAssets,
      };
    }

    void loadRepositoryState()
      .then(({ ownershipStatus, repositoryAssets }) => {
        if (active) {
          setAssets(repositoryAssets.map(mapAssetToCrudAsset));
          setValidationStatus(ownershipStatus);
          setLoadStatus("ready");
        }
      })
      .catch(() => {
        if (active) {
          setAssets([]);
          setLoadStatus("error");
          setMessage("登入後即可讀取 Supabase portfolio_assets；目前無法取得持久化資料。");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const activeAssets = useMemo(
    () => assets.filter((asset) => asset.status !== "archived"),
    [assets],
  );

  async function handleSubmit(input: PortfolioCrudAssetInput, editingAssetId?: string) {
    if (editingAssetId) {
      setMessage("Update Asset is coming soon in a later persistence release.");
      return;
    }

    try {
      await portfolioRepository.createAsset({
        accountId: "manual-account-created-by-repository",
        category: input.category,
        currency: input.currency,
        metadata: {
          notes: input.notes ?? null,
          source: "v1.94 Asset Management Center",
        },
        name: input.name,
        region: input.region,
        symbol: buildSymbol(input),
      });

      const [repositoryAssets, ownershipStatus] = await Promise.all([
        portfolioRepository.getAssets(),
        portfolioRepository.getOwnershipValidationStatus(),
      ]);

      setAssets(repositoryAssets.map(mapAssetToCrudAsset));
      setValidationStatus(ownershipStatus);
      setLoadStatus("ready");
      setMessage("Asset created in Supabase portfolio_assets and re-read from repository.");
    } catch {
      setMessage("無法建立 Asset。請確認已登入，且 v1.92 migration 已套用到目前 Supabase 專案。");
    }
  }

  function handleDeleteConfirm() {
    if (!pendingDeleteAsset) {
      return;
    }

    setAssets((current) =>
      current.map((asset) =>
        asset.id === pendingDeleteAsset.id
          ? {
              ...asset,
              status: "archived",
              updatedAt: new Date().toISOString(),
            }
          : asset,
      ),
    );
    setPendingDeleteAsset(null);
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-2xl border border-[rgba(176,141,87,0.32)] bg-[var(--ixai-forest)] p-5 text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)] sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--ixai-gold)]">
              Portfolio CRUD Foundation
            </p>
            <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight sm:text-5xl">
              Portfolio Assets
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/74 sm:text-base sm:leading-8">
              第一版 Supabase-backed Asset Management Center：目前支援 Create Asset 與 Read Asset；Update / Delete 保留為 Coming Soon。
            </p>
          </div>
          <FeatureIcon icon={Database} shadow={false} tone="cream" />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            ["Active Assets", activeAssets.length],
            ["Persistence Records", assets.length],
            ["RLS Status", validationStatus?.rlsStatus ?? "Pending"],
          ].map(([label, value]) => (
            <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4" key={label}>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/54">
                {label}
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--ixai-cream)]">
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              Ownership Validation Status
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
              Supabase Repository Readback
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              Asset Create 後會重新讀取 portfolio_assets；隔離邏輯依 authenticated user 與 RLS，不做 client-side 偽隔離。
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Repository Source", validationStatus?.repositorySource ?? "pending"],
            ["Current User ID", validationStatus?.currentUserId ?? "unauthenticated"],
            ["Current Account ID", validationStatus?.currentAccountId ?? "none"],
            ["Account Count", validationStatus?.accountCount ?? 0],
            ["Asset Count", validationStatus?.assetCount ?? 0],
            ["Position Count", validationStatus?.positionCount ?? 0],
          ].map(([label, value]) => (
            <div
              className="min-w-0 rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
              key={label}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
                {label}
              </p>
              <p className="mt-2 break-words font-mono text-sm font-semibold text-[var(--ixai-forest)]">
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <AssetForm
        editingAsset={editingAsset}
        key={editingAsset?.id ?? "new-asset"}
        onCancelEdit={() => setEditingAsset(null)}
        onSubmit={handleSubmit}
      />

      {message ? (
        <section className="rounded-2xl border border-[rgba(176,141,87,0.30)] bg-[rgba(176,141,87,0.08)] p-4 text-sm leading-7 text-[var(--ixai-forest)]">
          {message}
        </section>
      ) : null}

      <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-[rgba(255,250,240,0.86)] p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              Read Asset
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--ixai-forest)]">
              Asset Detail Cards
            </h2>
          </div>
          <p className="text-sm leading-7 text-[var(--ixai-forest-soft)]">
            Mobile 為直向 cards，desktop 為 grid。資料來源：Supabase Repository。
          </p>
        </div>

        {loadStatus === "loading" ? (
          <p className="mt-5 rounded-xl border border-[var(--ixai-border)] bg-white/78 p-4 text-sm leading-7 text-[var(--ixai-forest-soft)]">
            正在讀取 Supabase portfolio_assets...
          </p>
        ) : null}

        {loadStatus !== "loading" && activeAssets.length === 0 ? (
          <p className="mt-5 rounded-xl border border-[var(--ixai-border)] bg-white/78 p-4 text-sm leading-7 text-[var(--ixai-forest-soft)]">
            尚未建立 Asset。請使用上方表單新增第一筆持久化資產資料。
          </p>
        ) : null}

        {activeAssets.length > 0 ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {activeAssets.map((asset) => (
              <AssetCard
                asset={asset}
                key={asset.id}
                mutationsDisabled
                onDelete={setPendingDeleteAsset}
                onEdit={setEditingAsset}
              />
            ))}
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-[rgba(176,141,87,0.30)] bg-[rgba(176,141,87,0.08)] p-4 text-sm leading-7 text-[var(--ixai-forest)]">
        本頁僅啟用 Create / Read persistence foundation；不接券商、行情、新聞、AI 或交易功能，Update / Delete 仍是後續版本。
      </section>

      <DeleteAssetDialog
        asset={pendingDeleteAsset}
        onCancel={() => setPendingDeleteAsset(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
