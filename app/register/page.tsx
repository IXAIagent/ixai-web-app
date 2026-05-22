import { PasswordAuthForm } from "@/components/auth/password-auth-form";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  title: "建立 IXAI Account",
  description: "建立 IXAI Account，為未來 Watchlist 同步、偏好保存與 IXAI Pro continuity 做準備。",
});

export default function RegisterPage() {
  return <PasswordAuthForm mode="register" />;
}
