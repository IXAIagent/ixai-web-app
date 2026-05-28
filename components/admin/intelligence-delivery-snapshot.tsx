"use client";

import { useEffect, useState } from "react";
import { BellRing, LineChart, MessageCircle, Radio, ShieldCheck, Sunrise } from "lucide-react";
import {
  ShellCard,
  ShellHeader,
  ShellMetricCard,
  ShellStatusPill,
} from "@/components/shell/shell-primitives";

type DeliverySnapshotPayload = {
  deliveryTierDistribution: {
    preview: number;
    pro: number;
    public: number;
  };
  lineReadiness: number;
  mode: "foundation" | "analytics-ready";
  onboardingToDeliveryConversion: number;
  readinessScore: number;
  topInterests: Array<{ count: number; label: string }>;
};

type DeliverySnapshotResponse = {
  note?: string;
  ok?: boolean;
  snapshot?: DeliverySnapshotPayload;
};

const EMPTY_SNAPSHOT: DeliverySnapshotPayload = {
  deliveryTierDistribution: {
    preview: 0,
    pro: 0,
    public: 1,
  },
  lineReadiness: 0,
  mode: "foundation",
  onboardingToDeliveryConversion: 0,
  readinessScore: 0,
  topInterests: [],
};

export function IntelligenceDeliverySnapshot() {
  const [snapshot, setSnapshot] = useState<DeliverySnapshotPayload>(EMPTY_SNAPSHOT);
  const [note, setNote] = useState("");
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let active = true;

    async function loadSnapshot() {
      try {
        const response = await fetch("/api/admin/intelligence-delivery/snapshot", {
          cache: "no-store",
        });
        const payload = (await response.json()) as DeliverySnapshotResponse;

        if (!response.ok || !payload.ok || !payload.snapshot) {
          throw new Error("delivery_snapshot_failed");
        }

        if (!active) {
          return;
        }

        setSnapshot(payload.snapshot);
        setNote(payload.note ?? "");
        setState("ready");
      } catch {
        if (!active) {
          return;
        }

        setSnapshot(EMPTY_SNAPSHOT);
        setState("error");
      }
    }

    void loadSnapshot();

    return () => {
      active = false;
    };
  }, []);

  return (
    <ShellCard className="border-[var(--ixai-border)] bg-[#0a2119] p-5 sm:p-6">
      <ShellHeader
        action={<ShellStatusPill icon={Radio}>{state === "loading" ? "Loading" : snapshot.mode}</ShellStatusPill>}
        eyebrow="Delivery"
        subtitle="追蹤 Morning Intelligence、LINE readiness、onboarding to delivery conversion 與 Public / Pro delivery tier 分布。"
        title="Intelligence Delivery Snapshot"
      />

      {state === "error" ? (
        <div className="mt-5 rounded-lg border border-red-300/20 bg-red-950/20 p-4 text-sm leading-6 text-red-100/80">
          Intelligence delivery 快照暫時無法取得。
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <ShellMetricCard icon={Sunrise} label="Readiness" suffix="%" value={snapshot.readinessScore} />
        <ShellMetricCard icon={LineChart} label="Conversion" suffix="%" value={snapshot.onboardingToDeliveryConversion} />
        <ShellMetricCard icon={MessageCircle} label="LINE Ready" suffix="%" value={snapshot.lineReadiness} />
        <ShellMetricCard icon={BellRing} label="Public Tier" value={snapshot.deliveryTierDistribution.public} />
        <ShellMetricCard icon={ShieldCheck} label="Pro Tier" value={snapshot.deliveryTierDistribution.pro} />
      </div>

      <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.035] p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
          Top Intelligence Interests
        </p>
        <div className="mt-3 grid gap-2 text-sm text-zinc-400">
          {snapshot.topInterests.length ? (
            snapshot.topInterests.map((item) => (
              <p className="flex items-center justify-between gap-3" key={item.label}>
                <span className="truncate">{item.label}</span>
                <span className="font-mono text-[var(--ixai-cream)]">{item.count}</span>
              </p>
            ))
          ) : (
            <p>等待 onboarding 與 delivery preferences 聚合。</p>
          )}
        </div>
      </div>

      <p className="mt-4 rounded-lg border border-white/10 bg-white/[0.035] p-3 text-xs leading-5 text-[rgba(245,240,230,0.5)]">
        {note ||
          "Delivery is foundation-only. Real LINE push requires opt-in persistence, a queue, and a safe scheduler."}
      </p>
    </ShellCard>
  );
}
