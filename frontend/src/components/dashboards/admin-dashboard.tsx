import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { TrendingUp, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Card, SectionTitle } from "@/components/ui/surface";
import { WorkloadBar } from "@/components/ui/workload-bar";
import { Avatar } from "@/components/ui/member-avatar";
import {
  members,
  weeklyVelocity,
  completionTrend,
  getMember,
} from "@/lib/mock-data";
import { useTaskStore } from "@/stores/task-store";

const fade = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

const metrics = [
  { label: "Completion Rate", value: "82%", icon: CheckCircle2, delta: "+6%" },
  { label: "Weekly Velocity", value: "28", icon: TrendingUp, delta: "+12%" },
  { label: "Active Hours", value: "164h", icon: Clock, delta: "+3%" },
  { label: "Overdue", value: "7%", icon: AlertTriangle, delta: "-2%" },
];

export function AdminDashboard() {
  const tasks = useTaskStore((s) => s.tasks);
  const teamMembers = members.filter((m) => m.role === "staff");

  // Conflict detection: overlapping tasks per member
  const conflicts: { member: string; a: string; b: string }[] = [];
  for (const m of teamMembers) {
    const mt = tasks.filter((t) => t.assigneeId === m.id).sort((a, b) => a.day - b.day || a.start - b.start);
    for (let i = 0; i < mt.length - 1; i++) {
      if (mt[i].day === mt[i + 1].day && mt[i].end > mt[i + 1].start) {
        conflicts.push({ member: m.name, a: mt[i].title, b: mt[i + 1].title });
      }
    }
  }

  return (
    <div className="space-y-6 p-6">
      <motion.div {...fade}>
        <h1 className="text-2xl font-semibold tracking-tight">Workspace Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">Operational visibility across teams and projects.</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m, i) => (
          <motion.div key={m.label} {...fade} transition={{ delay: i * 0.04 }}>
            <Card>
              <div className="flex items-center justify-between">
                <m.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-primary-dark">{m.delta}</span>
              </div>
              <p className="mt-3 text-2xl font-semibold">{m.value}</p>
              <p className="text-xs text-muted-foreground">{m.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div {...fade} transition={{ delay: 0.1 }}>
          <Card>
            <SectionTitle>Weekly Velocity</SectionTitle>
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyVelocity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.94 0.008 120)" vertical={false} />
                  <XAxis dataKey="week" tickLine={false} axisLine={false} fontSize={12} stroke="oklch(0.55 0.02 260)" />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="oklch(0.55 0.02 260)" />
                  <Tooltip cursor={{ fill: "oklch(0.97 0.01 120)" }} contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.94 0.008 120)", fontSize: 12 }} />
                  <Bar dataKey="planned" fill="oklch(0.92 0.01 120)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="completed" fill="oklch(0.86 0.16 123)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        <motion.div {...fade} transition={{ delay: 0.15 }}>
          <Card>
            <SectionTitle>Completion Rate</SectionTitle>
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={completionTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.94 0.008 120)" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="oklch(0.55 0.02 260)" />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="oklch(0.55 0.02 260)" domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.94 0.008 120)", fontSize: 12 }} />
                  <Line type="monotone" dataKey="rate" stroke="oklch(0.78 0.16 123)" strokeWidth={3} dot={{ r: 4, fill: "oklch(0.78 0.16 123)" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div {...fade} transition={{ delay: 0.2 }}>
          <Card>
            <SectionTitle>Team Workload</SectionTitle>
            <div className="mt-4 space-y-4">
              {teamMembers.map((m) => {
                const load = tasks.filter((t) => t.assigneeId === m.id && t.status !== "done").length;
                return (
                  <div key={m.id}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar memberId={m.id} size={24} />
                        <span className="text-sm font-medium">{m.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{load} active</span>
                    </div>
                    <WorkloadBar value={load} max={5} />
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        <motion.div {...fade} transition={{ delay: 0.25 }}>
          <Card>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[oklch(0.65_0.2_25)]" />
              <SectionTitle>Conflict Detection</SectionTitle>
            </div>
            <div className="mt-4 space-y-2">
              {conflicts.length === 0 && (
                <p className="text-sm text-muted-foreground">No scheduling conflicts detected.</p>
              )}
              {conflicts.map((c, i) => (
                <div key={i} className="rounded-xl bg-status-overdue px-3 py-2.5">
                  <p className="text-sm font-medium">{c.member} — overlapping tasks</p>
                  <p className="text-xs text-muted-foreground">"{c.a}" overlaps "{c.b}"</p>
                </div>
              ))}
              <div className="rounded-xl bg-status-review px-3 py-2.5">
                <p className="text-sm font-medium">Overtime risk</p>
                <p className="text-xs text-muted-foreground">2 members scheduled past 6:00 PM this week</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
