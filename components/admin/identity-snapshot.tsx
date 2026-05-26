"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Clock, Link2, Radio, ShieldCheck, Users } from "lucide-react";
import {
  ShellCard,
  ShellHeader,
  ShellMetricCard,
  ShellStatusPill,
} from "@/components/shell/shell-primitives";

type IdentitySnapshotPayload = {
  activeIdentitySessions: number;
  anonymousVisitors: number;
  avgSessionAgeDays: number;
  identifiedRatio: number;
  lineConnectedIdentities: number;
  mode: "supabase" | "memory";
  proIdentifiedUsers: number;
  returningIdentifiedUsers: number;
};

type IdentitySnapshotResponse = {
  note?: string;
  ok?: boolean;
  snapshot?: IdentitySnapshotPayload;
};

const EMPTY_SNAPSHOT: IdentitySnapshotPayload = {
  activeIdentitySessions: 0,
  anonymousVisitors: 0,
  avgSessionAgeDays: 0,
  identifiedRatio: 0,
  lineConnectedIdentities: 0,
  mode: "memory",
  proIdentifiedUsers: 0,
  returningIdentifiedUsers: 0,
};

export function IdentitySnapshot() {
  const [snapshot, setSnapshot] = useState<IdentitySnapshotPayload>(EMPTY_SNAPSHOT);
  const [note, setNote] = useState("");
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let active = true;

    async function loadSnapshot() {
      try {
        const response = await fetch("/api/admin/identity/snapshot", {
          cache: "no-store",
        });
        const payload = (await response.json()) as IdentitySnapshotResponse;

        if (!response.ok || !payload.ok || !payload.snapshot) {
          throw new Error("identity_snapshot_failed");
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
        eyebrow="身分層快照"
        subtitle="追蹤已識別使用者、Pro 身分候選與 LINE 連接狀態。此快照只顯示聚合資料，不輸出原始 email 或 session token。"
        title="Lightweight Identity Session"
      />

      {state === "error" ? (
        <div className="mt-5 rounded-lg border border-red-300/20 bg-red-950/20 p-4 text-sm leading-6 text-red-100/80">
          身分層快照暫時無法取得。
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <ShellMetricCard icon={Users} label="Active Sessions" value={snapshot.activeIdentitySessions} />
        <ShellMetricCard icon={Users} label="Anonymous" value={snapshot.anonymousVisitors} />
        <ShellMetricCard icon={BadgeCheck} label="Identified Ratio" suffix="%" value={snapshot.identifiedRatio} />
        <ShellMetricCard icon={ShieldCheck} label="Pro Identified" value={snapshot.proIdentifiedUsers} />
        <ShellMetricCard icon={Link2} label="LINE Connected" value={snapshot.lineConnectedIdentities} />
        <ShellMetricCard icon={Clock} label="Avg Age" suffix="d" value={snapshot.avgSessionAgeDays} />
      </div>

      <p className="mt-4 rounded-lg border border-white/10 bg-white/[0.035] p-3 text-xs leading-5 text-[rgba(245,240,230,0.5)]">
        {note ||
          "Identity sessions are cookie-based; durable server-side session analytics can be added when IXAI moves to shared auth."}
      </p>
    </ShellCard>
  );
}
