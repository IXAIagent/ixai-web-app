export function WorkspaceSkeleton({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`block animate-pulse rounded-md bg-[rgba(9,41,31,0.08)] ${className}`}
    />
  );
}

export function WorkspaceLoadingKpi({ label = "Loading" }: { label?: string }) {
  return (
    <article
      aria-busy="true"
      aria-label={label}
      className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4"
    >
      <WorkspaceSkeleton className="h-3 w-20" />
      <WorkspaceSkeleton className="mt-4 h-7 w-24" />
      <WorkspaceSkeleton className="mt-4 h-4 w-full" />
      <WorkspaceSkeleton className="mt-2 h-4 w-2/3" />
    </article>
  );
}

export function WorkspaceLoadingCard({
  body = "正在整理資料。缺少的部分會保留安全 placeholder。",
  title = "資料整理中",
}: {
  body?: string;
  title?: string;
}) {
  return (
    <section
      aria-busy="true"
      className="rounded-lg border border-[var(--ixai-border)] bg-white/60 p-4 text-[var(--ixai-forest)]"
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_10rem] sm:items-center">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">{body}</p>
        </div>
        <div className="grid gap-2">
          <WorkspaceSkeleton className="h-3 w-full" />
          <WorkspaceSkeleton className="h-3 w-4/5" />
          <WorkspaceSkeleton className="h-3 w-2/3" />
        </div>
      </div>
    </section>
  );
}
