"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Link2, MessageCircle, Radio, Smartphone, Users } from "lucide-react";
import {
  ShellCard,
  ShellHeader,
  ShellMetricCard,
  ShellStatusPill,
} from "@/components/shell/shell-primitives";

type LineLoginSnapshotPayload = {
  connectedLineIdentities: number;
  liffReady: boolean;
  liffSessionRestores: number;
  lineLoginReady: boolean;
  pendingLineLinks: number;
  unifiedIdentities: number;
};

type LineLoginSnapshotResponse = {
  ok?: boolean;
  snapshot?: LineLoginSnapshotPayload;
};

const EMPTY_SNAPSHOT: LineLoginSnapshotPayload = {
  connectedLineIdentities: 0,
  liffReady: false,
  liffSessionRestores: 0,
  lineLoginReady: false,
  pendingLineLinks: 0,
  unifiedIdentities: 0,
};

export function LineLoginSnapshot() {
  const [snapshot, setSnapshot] = useState<LineLoginSnapshotPayload>(EMPTY_SNAPSHOT);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let active = true;

    async function loadSnapshot() {
      try {
        const response = await fetch("/api/admin/line-login/snapshot", {
          cache: "no-store",
        });
        const payload = (await response.json()) as LineLoginSnapshotResponse;

        if (!response.ok || !payload.ok || !payload.snapshot) {
          throw new Error("line_login_snapshot_failed");
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
        action={<ShellStatusPill icon={Radio}>{state === "loading" ? "Loading" : "LINE"}</ShellStatusPill>}
        eyebrow="LINE Login / LIFF"
        subtitle="檢查 LINE Login、LIFF 與 unified identity restore 是否已準備好。此區塊不顯示 raw LINE user id 或 token。"
        title="LINE Login Foundation"
      />

      {state === "error" ? (
        <div className="mt-5 rounded-lg border border-red-300/20 bg-red-950/20 p-4 text-sm leading-6 text-red-100/80">
          LINE Login 快照暫時無法取得。
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <ShellMetricCard icon={MessageCircle} label="Login Ready" value={snapshot.lineLoginReady ? "Ready" : "Pending"} />
        <ShellMetricCard icon={Smartphone} label="LIFF Ready" value={snapshot.liffReady ? "Ready" : "Pending"} />
        <ShellMetricCard icon={Users} label="Connected IDs" value={snapshot.connectedLineIdentities} />
        <ShellMetricCard icon={BadgeCheck} label="Unified IDs" value={snapshot.unifiedIdentities} />
        <ShellMetricCard icon={Link2} label="Pending Links" value={snapshot.pendingLineLinks} />
        <ShellMetricCard icon={Radio} label="LIFF Restores" value={snapshot.liffSessionRestores} />
      </div>
    </ShellCard>
  );
}
