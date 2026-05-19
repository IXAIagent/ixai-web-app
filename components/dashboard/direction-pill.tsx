import type { Direction } from "@/lib/mock-data";

const directionStyles: Record<Direction, string> = {
  up: "border-emerald-700/18 bg-emerald-700/8 text-emerald-800",
  down: "border-red-800/18 bg-red-800/8 text-red-800",
  flat: "border-[var(--ixai-border)] bg-[rgba(176,141,87,0.08)] text-[var(--ixai-forest-soft)]",
};

const directionLabels: Record<Direction, string> = {
  up: "上行",
  down: "下行",
  flat: "持平",
};

export function DirectionPill({ direction }: { direction: Direction }) {
  return (
    <span
      className={`inline-flex min-w-14 items-center justify-center rounded-lg border px-2.5 py-1 text-xs font-medium ${directionStyles[direction]}`}
    >
      {directionLabels[direction]}
    </span>
  );
}
