export type ClientSafeMarketStatus =
  | "disabled"
  | "mock"
  | "placeholder"
  | "ready"
  | "unavailable";

export type ClientSafeProviderHealthStatus =
  | "disabled"
  | "healthy"
  | "mock"
  | "placeholder"
  | "unavailable";

export type ClientSafeMarketReadiness = {
  generatedAt: string;
  health: {
    fallbackPolicy: {
      fallbackProviderId: string;
      policy: string;
      reason: string;
    };
    items: {
      dataFreshness: string;
      id: string;
      label: string;
      priority: string;
      status: ClientSafeProviderHealthStatus;
      summary: string;
    }[];
    summary: string;
  };
  readiness: {
    newsProviderCount: number;
    providerCount: number;
    providers: {
      description: string;
      id: string;
      label: string;
      status: ClientSafeMarketStatus;
    }[];
    quoteProviderCount: number;
  };
  serviceEntrypoints: {
    description: string;
    enabled: boolean;
    name: string;
  }[];
  summary: string;
};

export type ClientSafeMarketCacheSnapshot = {
  metadata: {
    entryCount: number;
    generatedAt: string;
    summary: string;
  };
};

export function getClientSafeMarketReadiness(): ClientSafeMarketReadiness {
  return {
    generatedAt: new Date().toISOString(),
    health: {
      fallbackPolicy: {
        fallbackProviderId: "internal_api_unavailable_state",
        policy: "api_route_or_unavailable",
        reason:
          "Client-side quote consumers must use the internal API route. If the route fails, UI should show unavailable instead of retrying direct Yahoo requests.",
      },
      items: [
        {
          dataFreshness: "api_route_only",
          id: "yahoo_live_api_route",
          label: "Yahoo quote API route",
          priority: "primary",
          status: "placeholder",
          summary:
            "Client components must use /api/market/yahoo-quotes instead of calling Yahoo Finance directly.",
        },
        {
          dataFreshness: "disabled_in_browser",
          id: "browser_direct_yahoo",
          label: "Browser direct Yahoo fetch",
          priority: "blocked",
          status: "disabled",
          summary:
            "Direct browser access to Yahoo Finance chart endpoints is disabled to avoid production CORS crashes.",
        },
      ],
      summary:
        "Workspace Market Status is client-safe and readiness-only. It does not import provider code or fetch quotes in the browser.",
    },
    readiness: {
      newsProviderCount: 0,
      providerCount: 2,
      providers: [
        {
          description:
            "Server-side quote access remains available through /api/market/yahoo-quotes.",
          id: "yahoo_api_route",
          label: "Yahoo quote API route",
          status: "placeholder",
        },
        {
          description:
            "Direct Yahoo Finance browser fetch is intentionally disabled.",
          id: "direct_yahoo_browser_fetch",
          label: "Direct browser fetch",
          status: "disabled",
        },
      ],
      quoteProviderCount: 1,
    },
    serviceEntrypoints: [
      {
        description:
          "Client-safe quote calls should use /api/market/yahoo-quotes?symbols=...",
        enabled: true,
        name: "/api/market/yahoo-quotes",
      },
      {
        description:
          "Direct Yahoo Finance chart endpoint access from browser code is disabled.",
        enabled: false,
        name: "browser_yahoo_finance_fetch",
      },
    ],
    summary:
      "Market readiness is displayed without client-side provider imports. Yahoo quote fetches must stay server-side or behind the internal API route.",
  };
}

export function getClientSafeMarketCacheSnapshot(): ClientSafeMarketCacheSnapshot {
  return {
    metadata: {
      entryCount: 0,
      generatedAt: new Date().toISOString(),
      summary:
        "Market cache diagnostics are server-side only. Client diagnostics do not inspect or populate the quote cache.",
    },
  };
}
