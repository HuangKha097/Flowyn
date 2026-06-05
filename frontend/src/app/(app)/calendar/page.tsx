"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { PageHeader } from "@/components/ui/surface";
import { WeekCalendar } from "@/components/calendar/week-calendar";
import { useTaskStore } from "@/stores/task-store";
import { useRoleStore } from "@/stores/role-store";
import { currentUserByRole, projects } from "@/lib/mock-data";
import { cn } from "@/lib/utils";


export default function CalendarPage() {
  const allTasks = useTaskStore((s) => s.tasks);
  const role = useRoleStore((s) => s.role);
  const [projectFilter, setProjectFilter] = useState<string | null>(null);

  const isTeamView = role === "admin" || role === "head";
  let tasks = isTeamView ? allTasks : allTasks.filter((t) => t.assigneeId === currentUserByRole.member);
  if (projectFilter) tasks = tasks.filter((t) => t.projectId === projectFilter);

  return (
    <div className="space-y-5 p-6">
      <PageHeader
        title="Calendar"
        subtitle={isTeamView ? "Team schedule · Week timeline" : "Your week · Drag blocks to reschedule"}
        action={
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-border bg-surface">
              <button className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-2 text-sm font-medium">This Week</span>
              <button className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <FilterChip active={!projectFilter} onClick={() => setProjectFilter(null)}>
          All Projects
        </FilterChip>
        {projects.map((p) => (
          <FilterChip key={p.id} active={projectFilter === p.id} onClick={() => setProjectFilter(p.id)}>
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
            {p.name}
          </FilterChip>
        ))}
      </div>

      <WeekCalendar tasks={tasks} showAllAssignees={isTeamView} />
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
        active
          ? "border-primary bg-primary-light text-foreground"
          : "border-border bg-surface text-muted-foreground hover:bg-surface-hover",
      )}
    >
      {children}
    </button>
  );
}
