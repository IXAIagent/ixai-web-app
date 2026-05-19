import { DailyBriefsAdmin } from "@/components/admin/daily-briefs-admin";

export const metadata = {
  title: "Daily Brief Pipeline | IXAI Admin",
  description: "Internal Daily Brief draft, review, and publish workflow.",
};

export default function AdminDailyBriefsPage() {
  return <DailyBriefsAdmin />;
}
