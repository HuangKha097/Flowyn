"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Pause, Plus } from "lucide-react";
import { StatusBadge, PriorityDot } from "@/components/ui/status-badge";
import { Avatar } from "@/components/ui/member-avatar";
import { useTaskStore } from "@/stores/task-store";
import { getProject, formatHour } from "@/lib/mock-data";
import { cn } from "@/lib/utils";


import { use } from "react";
export default function FocusPage({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = use(params);
  const tasks = useTaskStore((s) => s.tasks);
  const task = tasks.find((t) => t.id === taskId);
  const [running, setRunning] = useState(false);
  const [checks, setChecks] = useState<Record<string, boolean>>(
    () => Object.fromEntries((task?.checklist ?? []).map((c) => [c.id, c.done])),
  );

  if (!task) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-secondary">
        <div className="text-center">
          <p className="text-muted-foreground">Task not found.</p>
          <Link href="/" className="mt-3 inline-block text-sm font-medium text-foreground underline">
            Back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-secondary">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Exit Focus Mode
        </Link>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
          <div className="flex items-center gap-2">
            <PriorityDot priority={task.priority} />
            <StatusBadge status={task.status} />
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">{task.title}</h1>
          <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
            <span>{getProject(task.projectId)?.name}</span>
            <span>·</span>
            <span>{formatHour(task.start)} – {formatHour(task.end)}</span>
            <Avatar memberId={task.assigneeId} size={24} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-8 rounded-3xl border border-border bg-surface p-10 text-center shadow-soft"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Focus Session</p>
          <p className="mt-4 text-7xl font-semibold tabular-nums tracking-tight">25:00</p>
          <button
            onClick={() => setRunning((r) => !r)}
            className="mx-auto mt-6 flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary-dark"
          >
            {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {running ? "Pause" : "Start"}
          </button>
        </motion.div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
            <h2 className="text-base font-semibold">Checklist</h2>
            <div className="mt-4 space-y-2">
              {(task.checklist ?? []).map((c) => (
                <button
                  key={c.id}
                  onClick={() => setChecks((p) => ({ ...p, [c.id]: !p[c.id] }))}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-surface-hover"
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-md border transition",
                      checks[c.id] ? "border-primary bg-primary" : "border-border",
                    )}
                  >
                    {checks[c.id] && <span className="h-2 w-2 rounded-sm bg-primary-foreground" />}
                  </span>
                  <span className={cn("text-sm", checks[c.id] && "text-muted-foreground line-through")}>
                    {c.label}
                  </span>
                </button>
              ))}
              {!task.checklist?.length && <p className="text-sm text-muted-foreground">No checklist items.</p>}
              <button className="mt-1 flex items-center gap-2 px-2 text-sm font-medium text-muted-foreground transition hover:text-foreground">
                <Plus className="h-4 w-4" /> Add item
              </button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
            <h2 className="text-base font-semibold">Notes</h2>
            <textarea
              defaultValue={task.notes}
              placeholder="Capture your thoughts…"
              className="mt-4 h-40 w-full resize-none rounded-lg border border-border bg-surface p-3 text-sm outline-none transition placeholder:text-placeholder focus:border-primary focus:shadow-[0_0_0_4px_oklch(0.95_0.13_125_/_0.25)]"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
