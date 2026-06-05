"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, PageHeader } from "@/components/ui/surface";
import { WorkloadBar } from "@/components/ui/workload-bar";
import { Avatar } from "@/components/ui/member-avatar";
import { members } from "@/lib/mock-data";
import { useTaskStore } from "@/stores/task-store";


const roleLabel: Record<string, string> = {
  admin: "Admin",
  head: "Team Head",
  member: "Member",
};

export default function TeamPage() {
  const tasks = useTaskStore((s) => s.tasks);
  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Team" subtitle="People and capacity at a glance" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((m, i) => {
          const load = tasks.filter((t) => t.assigneeId === m.id && t.status !== "done").length;
          return (
            <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card>
                <div className="flex items-center gap-3">
                  <Avatar memberId={m.id} size={44} />
                  <div>
                    <p className="font-semibold">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.title}</p>
                  </div>
                </div>
                <span className="mt-3 inline-block rounded-full bg-surface-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  {roleLabel[m.role]}
                </span>
                <div className="mt-4">
                  <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                    <span>Workload</span>
                    <span>{load} active</span>
                  </div>
                  <WorkloadBar value={load} max={5} />
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
