import { getLineConfigState } from "@/src/lib/line/config";

export type LiffConfig = {
  liffId: string | null;
  lineLoginReady: boolean;
  liffReady: boolean;
  officialAccountUrl: string | null;
};

export function getLiffConfig(): LiffConfig {
  const state = getLineConfigState();

  return {
    liffId: state.liffId,
    lineLoginReady: state.loginReady,
    liffReady: state.liffReady,
    officialAccountUrl: state.officialAccountUrl,
  };
}

export function isLiffConfigured() {
  return getLiffConfig().liffReady;
}
