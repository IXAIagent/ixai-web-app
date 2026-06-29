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
          "Client-side quote consumers must use the internal live quote API route. If the route fails, UI should show unavailable instead of retrying direct provider requests.",
      },
      items: [
        {
          dataFreshness: "api_route_only",
          id: "live_market_api_route",
          label: "Live market quote API route",
          priority: "primary",
          status: "placeholder",
          summary:
            "Client components must use /api/market/live-quotes instead of calling Yahoo Finance or Binance directly.",
        },
        {
          dataFreshness: "disabled_in_browser",
          id: "browser_direct_provider_fetch",
          label: "Browser direct provider fetch",
          priority: "blocked",
          status: "disabled",
          summary:
            "Direct browser access to external quote providers is disabled to avoid production CORS and runtime crashes.",
        },
      ],
      summary:
        "Workspace Market Status is client-safe and readiness-only. It does not import provider code or fetch external quotes in the browser.",
    },
    readiness: {
      newsProviderCount: 0,
      providerCount: 2,
      providers: [
        {
          description:
            "Server-side quote access remains available through /api/market/live-quotes.",
          id: "live_market_api_route",
          label: "Live market quote API route",
          status: "placeholder",
        },
        {
          description:
            "Direct external provider browser fetch is intentionally disabled.",
          id: "direct_provider_browser_fetch",
          label: "Direct provider browser fetch",
          status: "disabled",
        },
      ],
      quoteProviderCount: 1,
    },
    serviceEntrypoints: [
      {
        description:
          "Client-safe quote calls should use /api/market/live-quotes?symbols=...",
        enabled: true,
        name: "/api/market/live-quotes",
      },
      {
        description:
          "Direct external quote endpoint access from browser code is disabled.",
        enabled: false,
        name: "browser_external_provider_fetch",
      },
    ],
    summary:
      "Market readiness is displayed without client-side provider imports. Yahoo and Binance quote fetches must stay server-side or behind the internal live quote API route.",
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
