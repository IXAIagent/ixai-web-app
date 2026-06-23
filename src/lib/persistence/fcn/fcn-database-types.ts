import type { DatabaseActivationTableStatus } from "@/src/lib/persistence/database-activation-utils";

export interface FcnCouponScheduleDatabaseRow {
  coupon_date?: string | null;
  created_at?: string;
  currency?: string | null;
  expected_coupon_amount?: number | null;
  fcn_position_id?: string;
  id: string;
  observation_date?: string | null;
  payment_date?: string | null;
  updated_at?: string;
  user_id?: string;
}

export interface FcnDatabaseTableReadiness {
  generatedAt: string;
  sourceStatus: "partial" | "ready" | "unavailable";
  tables: Array<{
    name: "fcn_coupon_schedules" | "fcn_positions" | "fcn_underlyings";
    status: DatabaseActivationTableStatus;
    warnings: string[];
  }>;
  warnings: string[];
}
