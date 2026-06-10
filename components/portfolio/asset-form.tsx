"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import {
  DEFAULT_PORTFOLIO_CRUD_INPUT,
  PORTFOLIO_CRUD_ASSET_CATEGORIES,
  PORTFOLIO_CRUD_CURRENCIES,
  PORTFOLIO_CRUD_REGIONS,
  validatePortfolioCrudAssetInput,
} from "@/src/lib/portfolio/crud/portfolio-crud-schema";
import type {
  PortfolioCrudAsset,
  PortfolioCrudAssetInput,
} from "@/src/lib/portfolio/crud/portfolio-crud-types";

function getInitialInput(editingAsset: PortfolioCrudAsset | null): PortfolioCrudAssetInput {
  if (!editingAsset) {
    return DEFAULT_PORTFOLIO_CRUD_INPUT;
  }

  return {
    category: editingAsset.category,
    currency: editingAsset.currency,
    name: editingAsset.name,
    notes: editingAsset.notes ?? "",
    region: editingAsset.region,
  };
}

export function AssetForm({
  editingAsset,
  onCancelEdit,
  onSubmit,
}: {
  editingAsset: PortfolioCrudAsset | null;
  onCancelEdit: () => void;
  onSubmit: (input: PortfolioCrudAssetInput, editingAssetId?: string) => void;
}) {
  const [input, setInput] = useState<PortfolioCrudAssetInput>(() =>
    getInitialInput(editingAsset),
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof PortfolioCrudAssetInput, string>>
  >({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validatePortfolioCrudAssetInput(input);
    setErrors(result.errors);

    if (!result.ok) {
      return;
    }

    onSubmit(
      {
        ...input,
        name: input.name.trim(),
        notes: input.notes?.trim(),
      },
      editingAsset?.id,
    );

    if (!editingAsset) {
      setInput(DEFAULT_PORTFOLIO_CRUD_INPUT);
    }
  }

  return (
    <form
      className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_14px_36px_rgba(9,41,31,0.05)] sm:p-6"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
            {editingAsset ? "Edit Asset" : "Add Asset"}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--ixai-forest)]">
            {editingAsset ? "更新資產資料" : "建立資產"}
          </h2>
        </div>
        {editingAsset ? (
          <button
            className="min-h-10 rounded-lg border border-[rgba(9,41,31,0.16)] bg-white px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)]"
            onClick={onCancelEdit}
            type="button"
          >
            Cancel Edit
          </button>
        ) : null}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-[var(--ixai-forest)]">
          Asset Name
          <input
            className="min-h-11 rounded-lg border border-[var(--ixai-border)] bg-[var(--ixai-cream)] px-3 py-2 text-sm font-normal outline-none focus:border-[var(--ixai-gold)]"
            onChange={(event) => setInput((current) => ({ ...current, name: event.target.value }))}
            placeholder="FCN717N"
            type="text"
            value={input.name}
          />
          {errors.name ? (
            <span className="text-xs font-medium text-[var(--ixai-risk-watch)]">
              {errors.name}
            </span>
          ) : null}
        </label>

        <label className="grid gap-2 text-sm font-semibold text-[var(--ixai-forest)]">
          Asset Category
          <select
            className="min-h-11 rounded-lg border border-[var(--ixai-border)] bg-[var(--ixai-cream)] px-3 py-2 text-sm font-normal outline-none focus:border-[var(--ixai-gold)]"
            onChange={(event) =>
              setInput((current) => ({
                ...current,
                category: event.target.value as PortfolioCrudAssetInput["category"],
              }))
            }
            value={input.category}
          >
            {PORTFOLIO_CRUD_ASSET_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-semibold text-[var(--ixai-forest)]">
          Region
          <select
            className="min-h-11 rounded-lg border border-[var(--ixai-border)] bg-[var(--ixai-cream)] px-3 py-2 text-sm font-normal outline-none focus:border-[var(--ixai-gold)]"
            onChange={(event) =>
              setInput((current) => ({
                ...current,
                region: event.target.value as PortfolioCrudAssetInput["region"],
              }))
            }
            value={input.region}
          >
            {PORTFOLIO_CRUD_REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-semibold text-[var(--ixai-forest)]">
          Currency
          <select
            className="min-h-11 rounded-lg border border-[var(--ixai-border)] bg-[var(--ixai-cream)] px-3 py-2 text-sm font-normal outline-none focus:border-[var(--ixai-gold)]"
            onChange={(event) => setInput((current) => ({ ...current, currency: event.target.value }))}
            value={input.currency}
          >
            {PORTFOLIO_CRUD_CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-4 grid gap-2 text-sm font-semibold text-[var(--ixai-forest)]">
        Notes
        <textarea
          className="min-h-28 rounded-lg border border-[var(--ixai-border)] bg-[var(--ixai-cream)] px-3 py-2 text-sm font-normal leading-7 outline-none focus:border-[var(--ixai-gold)]"
          onChange={(event) => setInput((current) => ({ ...current, notes: event.target.value }))}
          placeholder="用於整理資產來源、券商、策略或監控備註。"
          value={input.notes ?? ""}
        />
      </label>

      <button
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)] transition hover:-translate-y-0.5 sm:w-fit"
        type="submit"
      >
        {editingAsset ? "Update Asset" : "Add Asset"}
      </button>
    </form>
  );
}
