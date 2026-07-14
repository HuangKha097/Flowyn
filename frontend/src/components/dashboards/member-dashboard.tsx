import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Play, Timer, Bell, ArrowRight, CheckCircle2 } from "lucide-react";
import { Card, SectionTitle } from "@/components/ui/surface";
import { StatusBadge, PriorityDot } from "@/components/ui/status-badge";
import { useTaskStore } from "@/stores/task-store";
import {
  currentUserByRole,
  getProject,
  formatHour,
  notifications,
  getMember,
} from "@/lib/mock-data";

const fade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

export function MemberDashboard() {
  const tasks = useTaskStore((s) => s.tasks);
  const me = currentUserByRole.staff;
  const user = getMember(me);
  const myTasks = tasks.filter((t) => t.assigneeId === me && t.day === 0).sort((a, b) => a.start - b.start);
  const active = myTasks.find((t) => t.status === "progress");
  const upcoming = tasks
    .filter((t) => t.assigneeId === me && t.status !== "done")
    .sort((a, b) => a.day - b.day || a.start - b.start)
    .slice(0, 4);

  return (
    <div className="space-y-6 p-6">
      <motion.div {...fade}>
        <h1 className="text-2xl font-semibold tracking-tight">
          Good morning, {user?.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          You have {myTasks.length} tasks scheduled today. Stay focused.
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div {...fade} transition={{ delay: 0.05 }} className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between">
              <SectionTitle>Today's Schedule</SectionTitle>
              <Link href="/calendar" className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark">
                Open calendar <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="mt-4 space-y-2">
              {myTasks.map((t) => (
                <Link
                  key={t.id}
                  href={`/focus/${t.id}`}
                  className="flex items-center gap-3 rounded-xl border border-border-soft bg-surface px-3 py-3 transition hover:bg-surface-hover"
                >
                  <div className="flex w-20 items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {formatHour(t.start)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t.title}</p>
                    <p className="text-xs text-muted-foreground">{getProject(t.projectId)?.name}</p>
                  </div>
                  <PriorityDot priority={t.priority} />
                  <StatusBadge status={t.status} />
                </Link>
              ))}
            </div>
          </Card>
        </motion.div>

        <div className="space-y-6">
          <motion.div {...fade} transition={{ delay: 0.1 }}>
            <Card className="bg-primary-light">
              <p className="text-xs font-medium text-muted-foreground">Active Task</p>
              {active ? (
                <>
                  <p className="mt-2 text-lg font-semibold leading-snug">{active.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatHour(active.start)} – {formatHour(active.end)}
                  </p>
                  <Link
                    href={`/focus/${active.id}`}
                    className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary-dark"
                  >
                    <Play className="h-4 w-4" /> Enter Focus Mode
                  </Link>
                </>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">No active task right now.</p>
              )}
            </Card>
          </motion.div>

          <motion.div {...fade} transition={{ delay: 0.15 }}>
            <Card>
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-muted-foreground" />
                <SectionTitle>Focus Timer</SectionTitle>
              </div>
              <p className="mt-3 text-center text-4xl font-semibold tabular-nums tracking-tight">25:00</p>
              <button className="mt-3 w-full rounded-lg border border-border bg-surface py-2 text-sm font-medium transition hover:bg-surface-hover">
                Start session
              </button>
            </Card>
          </motion.div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div {...fade} transition={{ delay: 0.2 }}>
          <Card>
            <SectionTitle>Upcoming Deadlines</SectionTitle>
            <div className="mt-4 space-y-3">
              {upcoming.map((t) => (
                <div key={t.id} className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground/50" />
                  <span className="flex-1 text-sm">{t.title}</span>
                  <span className="text-xs text-muted-foreground">{["Mon", "Tue", "Wed", "Thu", "Fri"][t.day]}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div {...fade} transition={{ delay: 0.25 }}>
          <Card>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <SectionTitle>Notifications</SectionTitle>
            </div>
            <div className="mt-4 space-y-3">
              {notifications.map((n) => (
                <div key={n.id} className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-dark" />
                  <p className="flex-1 text-sm">{n.text}</p>
                  <span className="text-xs text-muted-foreground">{n.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
