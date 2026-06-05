import { cn } from "@/lib/utils";

export function WorkloadBar({
  value,
  max,
  className,
}: {
  value: number;
  max: number;
  className?: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  const overloaded = value / max > 0.85;
  return (
    <div className={cn("h-2.5 w-full overflow-hidden rounded-full bg-surface-secondary", className)}>
      <div
        className="h-full rounded-full transition-all"
        style={{
          width: `${pct}%`,
          backgroundColor: overloaded ? "oklch(0.75 0.16 60)" : "oklch(0.86 0.16 123)",
        }}
      />
    </div>
  );
}
