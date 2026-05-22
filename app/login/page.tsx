import { Suspense } from "react";
import { PasswordAuthForm } from "@/components/auth/password-auth-form";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  title: "登入 IXAI",
  description: "登入 IXAI Account，連接 Public Intelligence、自選觀察、偏好設定與未來 IXAI Pro workspace。",
});

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <PasswordAuthForm mode="login" />
    </Suspense>
  );
}
