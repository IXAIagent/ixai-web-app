export type AnalyticsEventName =
  | "page_view"
  | "watchlist_add"
  | "watchlist_remove"
  | "watchlist_open"
  | "pro_interest"
  | "pro_cta_click"
  | "pro_waitlist_submit"
  | "pro_waitlist_success"
  | "pro_waitlist_error"
  | "pro_preview_open"
  | "pro_intelligence_open"
  | "gated_surface_view"
  | "gated_upgrade_click"
  | "preview_badge_view"
  | "identity_session_created"
  | "identity_session_restored"
  | "identity_session_cleared"
  | "identity_surface_view"
  | "identified_return_visit"
  | "line_connect_view"
  | "line_connect_click"
  | "line_connect_pending"
  | "line_identity_merged"
  | "line_login_open"
  | "line_login_success"
  | "line_login_error"
  | "liff_open"
  | "liff_ready"
  | "liff_identity_restored"
  | "unified_identity_restored"
  | "admin_console_open"
  | "admin_section_click"
  | "push_enable"
  | "push_denied"
  | "feedback_click"
  | "onboarding_seen"
  | "onboarding_dismissed"
  | "onboarding_started"
  | "onboarding_step_completed"
  | "onboarding_watchlist_added"
  | "onboarding_line_connect_open"
  | "onboarding_completed"
  | "intelligence_delivery_enabled"
  | "intelligence_delivery_preview_open"
  | "intelligence_delivery_line_connect"
  | "intelligence_push_preview_view"
  | "morning_intelligence_view"
  | "pro_intelligence_preview_view"
  | "install_prompt_shown"
  | "install_prompt_accepted"
  | "weekly_open"
  | "daily_open"
  | "market_open"
  | "fcn_open"
  | "article_read_depth"
  | "share_click"
  | "cta_click"
  | "email_capture_submit"
  | "email_capture_success"
  | "email_capture_error"
  | "line_oa_click"
  | "distribution_cta_click"
  | "share_to_line"
  | "share_to_x"
  | "share_to_linkedin";

export type AnalyticsPrimitive = string | number | boolean | undefined;

export type AnalyticsAttribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
  landing_path?: string;
};

export type AnalyticsPayload = Record<string, AnalyticsPrimitive | AnalyticsAttribution>;

export type AnalyticsCommonMetadata = {
  surface?: string;
  path?: string;
  timestamp?: string;
  attribution?: AnalyticsAttribution;
  deviceType?: "mobile" | "tablet" | "desktop" | "unknown";
};

const VALID_EVENTS: ReadonlySet<string> = new Set<AnalyticsEventName>([
  "page_view",
  "watchlist_add",
  "watchlist_remove",
  "watchlist_open",
  "pro_interest",
  "pro_cta_click",
  "pro_waitlist_submit",
  "pro_waitlist_success",
  "pro_waitlist_error",
  "pro_preview_open",
  "pro_intelligence_open",
  "gated_surface_view",
  "gated_upgrade_click",
  "preview_badge_view",
  "identity_session_created",
  "identity_session_restored",
  "identity_session_cleared",
  "identity_surface_view",
  "identified_return_visit",
  "line_connect_view",
  "line_connect_click",
  "line_connect_pending",
  "line_identity_merged",
  "line_login_open",
  "line_login_success",
  "line_login_error",
  "liff_open",
  "liff_ready",
  "liff_identity_restored",
  "unified_identity_restored",
  "admin_console_open",
  "admin_section_click",
  "push_enable",
  "push_denied",
  "feedback_click",
  "onboarding_seen",
  "onboarding_dismissed",
  "onboarding_started",
  "onboarding_step_completed",
  "onboarding_watchlist_added",
  "onboarding_line_connect_open",
  "onboarding_completed",
  "intelligence_delivery_enabled",
  "intelligence_delivery_preview_open",
  "intelligence_delivery_line_connect",
  "intelligence_push_preview_view",
  "morning_intelligence_view",
  "pro_intelligence_preview_view",
  "install_prompt_shown",
  "install_prompt_accepted",
  "weekly_open",
  "daily_open",
  "market_open",
  "fcn_open",
  "article_read_depth",
  "share_click",
  "cta_click",
  "email_capture_submit",
  "email_capture_success",
  "email_capture_error",
  "line_oa_click",
  "distribution_cta_click",
  "share_to_line",
  "share_to_x",
  "share_to_linkedin",
]);

export function isAnalyticsEventName(event: string): event is AnalyticsEventName {
  return VALID_EVENTS.has(event);
}

export function getDeviceType(width: number | undefined): AnalyticsCommonMetadata["deviceType"] {
  if (!width || !Number.isFinite(width)) {
    return "unknown";
  }

  if (width < 640) {
    return "mobile";
  }

  if (width < 1024) {
    return "tablet";
  }

  return "desktop";
}
