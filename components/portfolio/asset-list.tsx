"use client";

import { useMemo, useState } from "react";
import { Database } from "lucide-react";

import { AssetCard } from "@/components/portfolio/asset-card";
import { AssetForm } from "@/components/portfolio/asset-form";
import { DeleteAssetDialog } from "@/components/portfolio/delete-asset-dialog";
import { FeatureIcon } from "@/components/ui/feature-icon";
import { mockPortfolioAssets } from "@/src/lib/portfolio/crud/portfolio-crud-mock";
import type {
  PortfolioCrudAsset,
  PortfolioCrudAssetInput,
} from "@/src/lib/portfolio/crud/portfolio-crud-types";

function createMockId(input: PortfolioCrudAssetInput) {
  return `mock-${input.category.toLowerCase()}-${Date.now().toString(36)}`;
}

export function AssetList() {
  const [assets, setAssets] = useState<PortfolioCrudAsset[]>(mockPortfolioAssets);
  const [editingAsset, setEditingAsset] = useState<PortfolioCrudAsset | null>(null);
  const [pendingDeleteAsset, setPendingDeleteAsset] = useState<PortfolioCrudAsset | null>(null);

  const activeAssets = useMemo(
    () => assets.filter((asset) => asset.status !== "archived"),
    [assets],
  );

  function handleSubmit(input: PortfolioCrudAssetInput, editingAssetId?: string) {
    const now = new Date().toISOString();

    if (editingAssetId) {
      setAssets((current) =>
        current.map((asset) =>
          asset.id === editingAssetId
            ? {
                ...asset,
                ...input,
                updatedAt: now,
              }
            : asset,
        ),
      );
      setEditingAsset(null);
      return;
    }

    setAssets((current) => [
      {
        ...input,
        createdAt: now,
        id: createMockId(input),
        status: "draft",
        updatedAt: now,
      },
      ...current,
    ]);
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
              第一版 Asset Management Center：建立、閱讀、更新與刪除 mock assets，為後續 Supabase-backed CRUD 做 UI 與狀態基礎。
            </p>
          </div>
          <FeatureIcon icon={Database} shadow={false} tone="cream" />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            ["Active Assets", activeAssets.length],
            ["Mock Records", assets.length],
            ["Archived", assets.length - activeAssets.length],
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

      <AssetForm
        editingAsset={editingAsset}
        key={editingAsset?.id ?? "new-asset"}
        onCancelEdit={() => setEditingAsset(null)}
        onSubmit={handleSubmit}
      />

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
            Mobile 為直向 cards，desktop 為 grid。
          </p>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {activeAssets.map((asset) => (
            <AssetCard
              asset={asset}
              key={asset.id}
              onDelete={setPendingDeleteAsset}
              onEdit={setEditingAsset}
            />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[rgba(176,141,87,0.30)] bg-[rgba(176,141,87,0.08)] p-4 text-sm leading-7 text-[var(--ixai-forest)]">
        本頁僅用於 Portfolio CRUD Foundation 的 UI 與 state 驗證；不寫入資料庫，不接券商、行情、新聞、AI 或交易功能。
      </section>

      <DeleteAssetDialog
        asset={pendingDeleteAsset}
        onCancel={() => setPendingDeleteAsset(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
