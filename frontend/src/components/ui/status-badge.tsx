import { cn } from "@/lib/utils";
import type { TaskStatus, Priority } from "@/lib/mock-data";
import { STATUS_META } from "@/lib/mock-data";

const statusClasses: Record<TaskStatus, string> = {
  todo: "bg-status-todo text-foreground/70",
  progress: "bg-status-progress text-foreground",
  review: "bg-status-review text-foreground",
  done: "bg-status-done text-foreground",
  overdue: "bg-status-overdue text-foreground",
};

export function StatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        statusClasses[status],
        className,
      )}
    >
      {STATUS_META[status].label}
    </span>
  );
}

const priorityClasses: Record<Priority, string> = {
  low: "text-muted-foreground",
  medium: "text-foreground",
  high: "text-[oklch(0.6_0.18_25)]",
};

export function PriorityDot({ priority }: { priority: Priority }) {
  const color =
    priority === "high"
      ? "bg-[oklch(0.65_0.2_25)]"
      : priority === "medium"
        ? "bg-primary-dark"
        : "bg-muted-foreground/40";
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", priorityClasses[priority])}>
      <span className={cn("h-1.5 w-1.5 rounded-full", color)} />
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
}
