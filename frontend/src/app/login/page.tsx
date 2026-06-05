"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Sparkles, Shield, Users, User, ArrowRight } from "lucide-react";
import { useRoleStore } from "@/stores/role-store";
import type { Role } from "@/lib/mock-data";

const accounts = [
  {
    id: "admin",
    name: "Khoa Bui",
    title: "Workspace Admin",
    role: "admin" as Role,
    icon: Shield,
    color: "bg-[oklch(0.75_0.12_290)]",
    description: "Full system access, manage teams, workloads & analytics.",
  },
  {
    id: "head",
    name: "Linh Vo",
    title: "Team Head",
    role: "head" as Role,
    icon: Users,
    color: "bg-[oklch(0.78_0.13_350)]",
    description: "Manage team sprints, review tasks & coordinate workload.",
  },
  {
    id: "member",
    name: "Minh Tran",
    title: "Frontend Engineer",
    role: "member" as Role,
    icon: User,
    color: "bg-[oklch(0.86_0.16_123)]",
    description: "Execute tasks, manage schedule & use focus mode.",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useRoleStore();

  const handleLogin = (role: Role) => {
    login(role);
    router.push("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-secondary p-4">
      <div className="absolute inset-0 z-0 overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-light/20 via-bg-secondary to-bg-secondary"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-border/60 bg-background/80 p-8 shadow-soft-lg backdrop-blur-xl"
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-soft">
            <Sparkles className="h-7 w-7 text-primary-foreground" strokeWidth={2} />
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight">Flowspace</h1>
          <p className="mt-2 text-sm text-muted-foreground">Select a demo account to enter the workspace</p>
        </div>

        <div className="mt-10 flex flex-col gap-3">
          {accounts.map((acc, index) => (
            <motion.button
              key={acc.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              onClick={() => handleLogin(acc.role)}
              className="group relative flex w-full items-center gap-4 rounded-2xl border border-border-soft bg-surface p-4 text-left transition-all hover:border-primary/40 hover:bg-surface-hover hover:shadow-soft"
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-sm ${acc.color}`}>
                <acc.icon className="h-6 w-6" strokeWidth={1.8} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{acc.name}</p>
                <p className="text-xs font-medium text-muted-foreground">{acc.title}</p>
                <p className="mt-1 text-[11px] leading-tight text-muted-foreground/70 opacity-0 transition-opacity group-hover:opacity-100 hidden sm:block">
                  {acc.description}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 transition-all group-hover:translate-x-1 group-hover:text-primary group-hover:opacity-100" />
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
