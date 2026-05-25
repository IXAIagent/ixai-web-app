import { DailyBriefsAdmin } from "@/components/admin/daily-briefs-admin";

export const metadata = {
  title: "IXAI 內容營運工作台 | Daily / Weekly Intelligence",
  description: "內部 Daily Brief 與 Weekly Intelligence 審閱、預覽與發佈流程。",
};

export default function AdminDailyBriefsPage() {
  return <DailyBriefsAdmin />;
}
