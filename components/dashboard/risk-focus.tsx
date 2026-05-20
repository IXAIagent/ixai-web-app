import { todayRiskFocus } from "@/src/lib/daily-intelligence";

export function RiskFocus() {
  return (
    <section className="rounded-lg border border-[rgba(176,141,87,0.34)] bg-[rgba(9,41,31,0.96)] p-4 text-[var(--ixai-cream)] shadow-[0_16px_44px_rgba(9,41,31,0.12)] sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--ixai-gold)]">
            {todayRiskFocus.label}
          </p>
          <h2 className="mt-2 text-lg font-semibold leading-7">
            {todayRiskFocus.title}
          </h2>
        </div>
        <span className="w-fit rounded-md border border-red-200/20 bg-red-200/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-red-100">
          Risk-first
        </span>
      </div>
      <p className="mt-3 text-sm leading-7 text-white/66">
        {todayRiskFocus.summary}
      </p>
      <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--ixai-gold)]">
        {todayRiskFocus.updatedLabel}
      </p>
    </section>
  );
}
