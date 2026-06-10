import { CalendarDays, Edit3, Trash2 } from "lucide-react";

import { FeatureIcon } from "@/components/ui/feature-icon";
import type { PortfolioCrudAsset } from "@/src/lib/portfolio/crud/portfolio-crud-types";

const STATUS_LABEL: Record<PortfolioCrudAsset["status"], string> = {
  active: "Active",
  archived: "Archived",
  draft: "Draft",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-TW", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function AssetCard({
  asset,
  onDelete,
  onEdit,
}: {
  asset: PortfolioCrudAsset;
  onDelete: (asset: PortfolioCrudAsset) => void;
  onEdit: (asset: PortfolioCrudAsset) => void;
}) {
  return (
    <article className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-4 shadow-[0_14px_36px_rgba(9,41,31,0.05)]">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <FeatureIcon icon={CalendarDays} size="sm" shadow={false} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold leading-7 text-[var(--ixai-forest)]">
                {asset.name}
              </h3>
              <span className="inline-flex w-fit rounded-full border border-[rgba(176,141,87,0.36)] bg-[rgba(176,141,87,0.10)] px-2.5 py-1 text-[11px] font-semibold text-[var(--ixai-forest)]">
                {STATUS_LABEL[asset.status]}
              </span>
            </div>
            <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              {asset.notes || "此資產目前只有 CRUD foundation 展示資料。"}
            </p>
          </div>
        </div>

        <dl className="grid gap-2 sm:grid-cols-2">
          {[
            ["Asset Category", asset.category],
            ["Region", asset.region],
            ["Currency", asset.currency],
            ["Created At", formatDate(asset.createdAt)],
          ].map(([label, value]) => (
            <div
              className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-3"
              key={label}
            >
              <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
                {label}
              </dt>
              <dd className="mt-1 text-sm font-semibold text-[var(--ixai-forest)]">
                {value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="grid gap-2 sm:flex sm:justify-end">
          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[rgba(9,41,31,0.16)] bg-white px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)] transition hover:bg-[rgba(9,41,31,0.04)]"
            onClick={() => onEdit(asset)}
            type="button"
          >
            <Edit3 className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
            Edit Asset
          </button>
          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[color-mix(in_srgb,var(--ixai-risk-watch)_36%,var(--ixai-border))] bg-[color-mix(in_srgb,var(--ixai-risk-watch)_8%,white)] px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)] transition hover:bg-[color-mix(in_srgb,var(--ixai-risk-watch)_12%,white)]"
            onClick={() => onDelete(asset)}
            type="button"
          >
            <Trash2 className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
            Delete Asset
          </button>
        </div>
      </div>
    </article>
  );
}
