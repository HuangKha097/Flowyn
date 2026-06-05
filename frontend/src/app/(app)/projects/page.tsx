"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, PageHeader } from "@/components/ui/surface";
import { WorkloadBar } from "@/components/ui/workload-bar";
import { projects, getMember } from "@/lib/mock-data";
import { useTaskStore } from "@/stores/task-store";


export default function ProjectsPage() {
  const tasks = useTaskStore((s) => s.tasks);
  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Projects" subtitle="Active workstreams across the team" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p, i) => {
          const pt = tasks.filter((t) => t.projectId === p.id);
          const done = pt.filter((t) => t.status === "done").length;
          const pct = pt.length ? Math.round((done / pt.length) * 100) : 0;
          const team = [...new Set(pt.map((t) => t.assigneeId))];
          return (
            <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card>
                <div className="flex items-center gap-2.5">
                  <span className="h-3 w-3 rounded-md" style={{ backgroundColor: p.color }} />
                  <h3 className="font-semibold">{p.name}</h3>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <span className="text-2xl font-semibold">{pct}%</span>
                  <span className="text-xs text-muted-foreground">{done}/{pt.length} tasks</span>
                </div>
                <WorkloadBar value={pct} max={100} className="mt-2" />
                <div className="mt-4 flex -space-x-2">
                  {team.map((id) => (
                    <span
                      key={id}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold ring-2 ring-surface"
                      style={{ backgroundColor: getMember(id)?.color }}
                    >
                      {getMember(id)?.initials}
                    </span>
                  ))}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
