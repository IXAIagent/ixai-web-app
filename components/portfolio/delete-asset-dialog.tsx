import type { PortfolioCrudAsset } from "@/src/lib/portfolio/crud/portfolio-crud-types";

export function DeleteAssetDialog({
  asset,
  onCancel,
  onConfirm,
}: {
  asset: PortfolioCrudAsset | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!asset) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(8,34,26,0.58)] px-4 py-6">
      <section
        aria-modal="true"
        className="w-full max-w-md rounded-2xl border border-[rgba(176,141,87,0.34)] bg-[var(--ixai-cream)] p-5 shadow-[0_24px_80px_rgba(9,41,31,0.24)]"
        role="dialog"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
          Delete Asset
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[var(--ixai-forest)]">
          Are you sure?
        </h2>
        <p className="mt-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
          這只會從本頁 mock state 移除 {asset.name}，不會寫入資料庫。
        </p>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <button
            className="min-h-11 rounded-lg border border-[rgba(9,41,31,0.16)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--ixai-forest)]"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="min-h-11 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)]"
            onClick={onConfirm}
            type="button"
          >
            Confirm Delete
          </button>
        </div>
      </section>
    </div>
  );
}
