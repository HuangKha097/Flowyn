import { motion } from "framer-motion";
import { Check, X, MessageSquare, AlertTriangle, Flag, Clock } from "lucide-react";
import { Card, SectionTitle } from "@/components/ui/surface";
import { WorkloadBar } from "@/components/ui/workload-bar";
import { Avatar } from "@/components/ui/member-avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  sprint,
  reviewQueue,
  members,
  getMember,
  getProject,
} from "@/lib/mock-data";
import { useTaskStore } from "@/stores/task-store";

const fade = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

export function HeadDashboard() {
  const tasks = useTaskStore((s) => s.tasks);
  const teamMembers = members.filter((m) => m.role === "member");
  const blocked = tasks.filter((t) => t.status === "overdue");

  return (
    <div className="space-y-6 p-6">
      <motion.div {...fade}>
        <h1 className="text-2xl font-semibold tracking-tight">Team Head</h1>
        <p className="mt-1 text-sm text-muted-foreground">Coordinate sprints, reviews, and capacity.</p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div {...fade} transition={{ delay: 0.05 }}>
          <Card>
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-muted-foreground" />
              <SectionTitle>Sprint Progress</SectionTitle>
            </div>
            <p className="mt-3 text-sm font-medium">{sprint.name}</p>
            <div className="mt-3 flex items-end justify-between">
              <span className="text-3xl font-semibold">{sprint.progress}%</span>
              <span className="text-xs text-muted-foreground">{sprint.daysLeft} days left</span>
            </div>
            <WorkloadBar value={sprint.progress} max={100} className="mt-3" />
            <p className="mt-2 text-xs text-muted-foreground">
              {sprint.doneTasks}/{sprint.totalTasks} tasks complete
            </p>
          </Card>
        </motion.div>

        <motion.div {...fade} transition={{ delay: 0.1 }}>
          <Card>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <SectionTitle>Pending Reviews</SectionTitle>
            </div>
            <p className="mt-3 text-3xl font-semibold">{reviewQueue.length}</p>
            <p className="text-xs text-muted-foreground">awaiting your approval</p>
          </Card>
        </motion.div>

        <motion.div {...fade} transition={{ delay: 0.15 }}>
          <Card>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[oklch(0.65_0.2_25)]" />
              <SectionTitle>Blocked Tasks</SectionTitle>
            </div>
            <p className="mt-3 text-3xl font-semibold">{blocked.length}</p>
            <p className="text-xs text-muted-foreground">need attention</p>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div {...fade} transition={{ delay: 0.2 }} className="lg:col-span-2">
          <Card>
            <SectionTitle>Review Queue</SectionTitle>
            <div className="mt-4 space-y-3">
              {reviewQueue.map((r) => (
                <div key={r.id} className="flex items-center gap-3 rounded-xl border border-border-soft px-3 py-3">
                  <Avatar memberId={r.authorId} size={34} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{r.taskTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {getMember(r.authorId)?.name} · {getProject(r.projectId)?.name} · {r.submitted}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition hover:bg-primary-dark" title="Approve">
                      <Check className="h-4 w-4" />
                    </button>
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface transition hover:bg-surface-hover" title="Request changes">
                      <X className="h-4 w-4" />
                    </button>
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface transition hover:bg-surface-hover" title="Comment">
                      <MessageSquare className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div {...fade} transition={{ delay: 0.25 }}>
          <Card>
            <SectionTitle>Capacity</SectionTitle>
            <div className="mt-4 space-y-4">
              {teamMembers.map((m) => {
                const load = tasks.filter((t) => t.assigneeId === m.id && t.status !== "done").length;
                return (
                  <div key={m.id}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar memberId={m.id} size={24} />
                        <span className="text-sm font-medium">{m.name.split(" ")[0]}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {load >= 4 ? "Overloaded" : load <= 1 ? "Free" : "Balanced"}
                      </span>
                    </div>
                    <WorkloadBar value={load} max={5} />
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div {...fade} transition={{ delay: 0.3 }}>
        <Card>
          <SectionTitle>Blocked & Overdue</SectionTitle>
          <div className="mt-4 space-y-2">
            {blocked.map((t) => (
              <div key={t.id} className="flex items-center gap-3 rounded-xl bg-status-overdue px-3 py-2.5">
                <AlertTriangle className="h-4 w-4 text-[oklch(0.6_0.2_25)]" />
                <span className="flex-1 text-sm font-medium">{t.title}</span>
                <span className="text-xs text-muted-foreground">{getMember(t.assigneeId)?.name}</span>
                <StatusBadge status={t.status} />
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
