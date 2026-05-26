"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Mail, ShieldCheck } from "lucide-react";
import { IdentityStatus } from "@/components/auth/identity-status";
import { useIdentitySession } from "@/components/auth/identity-provider";
import { trackEvent } from "@/src/lib/analytics/analytics";

type IdentifySessionCardProps = {
  source: string;
  title?: string;
};

export function IdentifySessionCard({
  source,
  title = "建立 IXAI identity session",
}: IdentifySessionCardProps) {
  const { identify, loading, state } = useIdentitySession();
  const [email, setEmail] = useState("");
  const [formState, setFormState] = useState<"idle" | "submitting" | "success" | "error">("idle");

  useEffect(() => {
    trackEvent("identity_surface_view", {
      membership: state === "loading" ? "unknown" : state,
      path: window.location.pathname,
      source,
    });
  }, [source, state]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormState("submitting");

    const ok = await identify(email, source);

    setFormState(ok ? "success" : "error");
  }

  if (!loading && state !== "anonymous") {
    return (
      <section className="rounded-lg border border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.82)] p-4 sm:p-5">
        <IdentityStatus />
        <div className="mt-4 grid gap-2 sm:flex sm:flex-wrap">
          <Link
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-3 py-2 text-center text-sm font-semibold text-[var(--ixai-cream)]"
            href="/pro-preview"
          >
            <span className="translate-y-px">Continue with IXAI Pro Preview</span>
            <ArrowRight className="h-4 w-4 stroke-current" aria-hidden="true" />
          </Link>
          <Link
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] px-3 py-2 text-center text-sm font-semibold text-[var(--ixai-forest)]"
            href="/pro-intelligence"
          >
            Pro Intelligence shell
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.86)] p-4 shadow-[0_18px_48px_rgba(9,41,31,0.08)] sm:p-5">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[rgba(176,141,87,0.32)] bg-white/58 text-[var(--ixai-gold)]">
          <ShieldCheck className="h-5 w-5 stroke-current" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ixai-gold)] sm:text-[11px] sm:tracking-[0.2em]">
            Identity Persistence
          </p>
          <h2 className="mt-1 text-lg font-semibold leading-7 text-[var(--ixai-forest)]">
            {title}
          </h2>
          <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
            輸入 email 後，IXAI 會以安全 cookie 保留你的 membership context。這不是密碼登入，
            也不會啟用付費或正式 Pro 權限。
          </p>
        </div>
      </div>

      <form className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor={`identity-email-${source}`}>
          Email
        </label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 stroke-current text-[var(--ixai-gold)]"
            aria-hidden="true"
          />
          <input
            className="min-h-11 w-full rounded-lg border border-[var(--ixai-border)] bg-white/72 px-9 py-2.5 text-sm text-[var(--ixai-forest)] outline-none transition placeholder:text-[var(--ixai-ink-muted)] focus:border-[var(--ixai-gold)]"
            id={`identity-email-${source}`}
            inputMode="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="your@email.com"
            type="email"
            value={email}
          />
        </div>
        <button
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)] transition hover:bg-[#123a2d] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          disabled={formState === "submitting"}
          type="submit"
        >
          <span className="translate-y-px">{formState === "submitting" ? "建立中" : "Continue"}</span>
          <ArrowRight className="h-4 w-4 stroke-current" aria-hidden="true" />
        </button>
      </form>

      {formState === "success" ? (
        <p className="mt-3 text-sm font-medium text-[var(--ixai-forest)]">
          Identity session 已建立。重新整理後仍會保留你的 IXAI context。
        </p>
      ) : null}
      {formState === "error" ? (
        <p className="mt-3 text-sm font-medium text-[#8a3b2f]">
          目前無法建立 identity session，請稍後再試。
        </p>
      ) : null}
    </section>
  );
}
