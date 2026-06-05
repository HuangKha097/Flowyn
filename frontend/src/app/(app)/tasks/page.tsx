"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/ui/surface";
import { StatusBadge, PriorityDot } from "@/components/ui/status-badge";
import { Avatar } from "@/components/ui/member-avatar";
import { WEEK_DAYS, getProject, formatHour, type TaskStatus } from "@/lib/mock-data";
import { useTaskStore } from "@/stores/task-store";
import { useRoleStore } from "@/stores/role-store";
import { currentUserByRole } from "@/lib/mock-data";
import { cn } from "@/lib/utils";


const filters: { value: TaskStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "todo", label: "To Do" },
  { value: "progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
  { value: "overdue", label: "Overdue" },
];

export default function TasksPage() {
  const allTasks = useTaskStore((s) => s.tasks);
  const role = useRoleStore((s) => s.role);
  const [filter, setFilter] = useState<TaskStatus | "all">("all");

  const isTeam = role !== "member";
  let tasks = isTeam ? allTasks : allTasks.filter((t) => t.assigneeId === currentUserByRole.member);
  if (filter !== "all") tasks = tasks.filter((t) => t.status === filter);
  tasks = [...tasks].sort((a, b) => a.day - b.day || a.start - b.start);

  return (
    <div className="space-y-5 p-6">
      <PageHeader title="Tasks" subtitle={isTeam ? "Team task list" : "Your assigned tasks"} />
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition",
              filter === f.value
                ? "border-primary bg-primary-light text-foreground"
                : "border-border bg-surface text-muted-foreground hover:bg-surface-hover",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
        {tasks.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-4 border-b border-border-soft px-4 py-3.5 last:border-b-0 transition hover:bg-surface-hover"
          >
            {isTeam && <Avatar memberId={t.assigneeId} size={32} />}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{t.title}</p>
              <p className="text-xs text-muted-foreground">{getProject(t.projectId)?.name}</p>
            </div>
            <span className="hidden text-xs text-muted-foreground sm:block">
              {WEEK_DAYS[t.day]} · {formatHour(t.start)}
            </span>
            <PriorityDot priority={t.priority} />
            <StatusBadge status={t.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
