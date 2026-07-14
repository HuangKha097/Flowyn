"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  FolderKanban,
  CheckSquare,
  Users,
  BarChart3,
  Settings,
  Plus,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRoleStore } from "@/stores/role-store";

const nav = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Calendar", to: "/calendar", icon: Calendar },
  { label: "Projects", to: "/projects", icon: FolderKanban },
  { label: "Tasks", to: "/tasks", icon: CheckSquare },
  { label: "Team", to: "/team", icon: Users },
  { label: "Analytics", to: "/analytics", icon: BarChart3 },
  { label: "Settings", to: "/settings", icon: Settings },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const user = useRoleStore((state) => state.user);

  return (
    <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-[280px] shrink-0 flex-col rounded-3xl border border-border bg-sidebar-bg p-5 lg:flex">
      <div className="flex items-center gap-2.5 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
          <Sparkles className="h-5 w-5 text-primary-foreground" strokeWidth={2} />
        </div>
        <span className="text-lg font-semibold tracking-tight">Flowspace</span>
      </div>

      <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground shadow-soft transition-colors hover:bg-primary-dark">
        <Plus className="h-4 w-4" strokeWidth={2.2} />
        Quick Create
      </button>

      <nav className="mt-6 flex flex-1 flex-col gap-1">
        {nav.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              href={item.to}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-[oklch(0.96_0.04_125)] hover:text-foreground",
              )}
            >
              <item.icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border-soft bg-surface p-3">
          <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {initials(user.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs capitalize text-muted-foreground">{user.role}</p>
          </div>
        </div>
      )}
    </aside>
  );
}

function initials(name: string) {
  return name.split(" ").filter(Boolean).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}
