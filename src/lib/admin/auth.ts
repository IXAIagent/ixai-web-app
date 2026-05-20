import { createHash } from "node:crypto";

export type AdminGateMode = "password" | "development";

export type AdminAccessState =
  | {
      mode: "locked";
      reason: "missing-production-password";
    }
  | {
      mode: AdminGateMode;
      passwordHash: string | null;
      isPasswordConfigured: boolean;
    };

export function getAdminPassword() {
  return process.env.IXAI_ADMIN_PASSWORD?.trim() || "";
}

export function hashAdminPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

export function getAdminAccessState(): AdminAccessState {
  const password = getAdminPassword();
  const isProduction = process.env.NODE_ENV === "production";

  if (!password && isProduction) {
    return {
      mode: "locked",
      reason: "missing-production-password",
    };
  }

  if (!password) {
    return {
      mode: "development",
      passwordHash: null,
      isPasswordConfigured: false,
    };
  }

  return {
    mode: "password",
    passwordHash: hashAdminPassword(password),
    isPasswordConfigured: true,
  };
}
