// v1.29 — single logger surface used across IXAI Public App.
//
// In development we want full visibility (auth errors, OpenAI fallback
// reasons, SW registration skips). In production we want a quiet browser
// console so end users never see internal tags like [IXAI AUTH] in
// devtools — but we still want to keep the call sites in case we wire in
// Sentry / external telemetry later.
//
// No Sentry, no network calls. Just an env-gated console proxy.

type LogArgs = unknown[];

const isDev =
  typeof process !== "undefined" && process.env.NODE_ENV !== "production";

function isServer(): boolean {
  return typeof window === "undefined";
}

function emit(method: "log" | "info" | "warn" | "error", args: LogArgs) {
  // Server-side: always emit so Vercel function logs still capture
  // intelligence fallbacks, persistence failures and auth errors.
  // Browser-side: only emit in development so production users never see
  // [IXAI AUTH] or [IXAI PROFILE] noise in devtools.
  if (!isServer() && !isDev) {
    return;
  }

  console[method](...args);
}

export const log = {
  debug: (...args: LogArgs) => emit("log", args),
  info: (...args: LogArgs) => emit("info", args),
  warn: (...args: LogArgs) => emit("warn", args),
  error: (...args: LogArgs) => emit("error", args),
};
