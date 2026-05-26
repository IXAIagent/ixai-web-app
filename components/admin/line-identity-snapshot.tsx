"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Link2, MessageCircle, Radio, ShieldCheck, Users } from "lucide-react";
import {
  ShellCard,
  ShellHeader,
  ShellMetricCard,
  ShellStatusPill,
} from "@/components/shell/shell-primitives";

type LineConfigState = {
  connectReady: boolean;
  fullyConfigured: boolean;
  messagingReady: boolean;
  officialAccountUrlConfigured: boolean;
};

type LineIdentitySnapshotPayload = {
  config: LineConfigState;
  lineConnectedProCandidates: number;
  lineConnectedReturningUsers: number;
  lineConnectedUsers: number;
  mode: "supabase" | "memory";
  pendingLineLinks: number;
  unifiedIdentities: number;
};

type LineIdentitySnapshotResponse = {
  ok?: boolean;
  snapshot?: LineIdentitySnapshotPayload;
};

const EMPTY_SNAPSHOT: LineIdentitySnapshotPayload = {
  config: {
    connectReady: false,
    fullyConfigured: false,
    messagingReady: false,
    officialAccountUrlConfigured: false,
  },
  lineConnectedProCandidates: 0,
  lineConnectedReturningUsers: 0,
  lineConnectedUsers: 0,
  mode: "memory",
  pendingLineLinks: 0,
  unifiedIdentities: 0,
};

export function LineIdentitySnapshot() {
  const [snapshot, setSnapshot] = useState<LineIdentitySnapshotPayload>(EMPTY_SNAPSHOT);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let active = true;

    async function loadSnapshot() {
      try {
        const response = await fetch("/api/admin/line-identity/snapshot", {
          cache: "no-store",
        });
        const payload = (await response.json()) as LineIdentitySnapshotResponse;

        if (!response.ok || !payload.ok || !payload.snapshot) {
          throw new Error("line_identity_snapshot_failed");
        }

        if (!active) return;
        setSnapshot(payload.snapshot);
        setState("ready");
      } catch {
        if (!active) return;
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
        eyebrow="LINE 身分合併"
        subtitle="追蹤 LINE Official Account、identity session、subscriber graph 與 membership 的合併準備狀態。此快照只顯示聚合資料。"
        title="Unified Intelligence Identity"
      />

      {state === "error" ? (
        <div className="mt-5 rounded-lg border border-red-300/20 bg-red-950/20 p-4 text-sm leading-6 text-red-100/80">
          LINE 身分合併快照暫時無法取得。
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <ShellMetricCard icon={MessageCircle} label="LINE Connected" value={snapshot.lineConnectedUsers} />
        <ShellMetricCard icon={Link2} label="Pending Links" value={snapshot.pendingLineLinks} />
        <ShellMetricCard icon={BadgeCheck} label="Unified IDs" value={snapshot.unifiedIdentities} />
        <ShellMetricCard icon={ShieldCheck} label="Pro Linked" value={snapshot.lineConnectedProCandidates} />
        <ShellMetricCard icon={Users} label="Returning" value={snapshot.lineConnectedReturningUsers} />
      </div>

      <div className="mt-4 grid gap-2 text-xs leading-5 text-zinc-400 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Connect contract", snapshot.config.connectReady ? "ready" : "pending"],
          ["Messaging API", snapshot.config.messagingReady ? "configured" : "not configured"],
          ["LINE OA URL", snapshot.config.officialAccountUrlConfigured ? "configured" : "not configured"],
          ["Full LINE config", snapshot.config.fullyConfigured ? "ready" : "partial"],
        ].map(([label, value]) => (
          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3" key={label}>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
              {label}
            </p>
            <p className="mt-1 text-zinc-300">{value}</p>
          </div>
        ))}
      </div>
    </ShellCard>
  );
}
