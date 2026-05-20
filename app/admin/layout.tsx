import { AdminGate } from "@/components/admin/admin-gate";
import { getAdminAccessState } from "@/src/lib/admin/auth";

export const dynamic = "force-dynamic";

function AdminLockedPage() {
  return (
    <div className="min-h-screen bg-[#071a14] px-4 py-8 text-[#f5f0e6] sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center">
        <section className="w-full rounded-lg border border-white/10 bg-white/[0.035] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:p-7">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--ixai-gold)]">
            IXAI Editorial Console
          </p>
          <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight sm:text-5xl">
            後台已安全鎖定。
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/62">
            Production 環境尚未設定 IXAI_ADMIN_PASSWORD，因此不允許進入內部內容營運後台。
          </p>
        </section>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const accessState = getAdminAccessState();

  if (accessState.mode === "locked") {
    return <AdminLockedPage />;
  }

  return (
    <AdminGate mode={accessState.mode} passwordHash={accessState.passwordHash}>
      {children}
    </AdminGate>
  );
}
