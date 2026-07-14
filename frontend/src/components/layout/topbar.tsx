"use client";

import { Search, Bell } from "lucide-react";
import { useRoleStore } from "@/stores/role-store";

import { LogOut } from "lucide-react";

const today = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  month: "short",
  day: "numeric",
});

export function Topbar() {
  const { user, logout } = useRoleStore();

  return (
    <header className="sticky top-0 z-20 flex h-[72px] items-center gap-4 border-b border-border bg-[oklch(1_0_0_/_0.85)] px-6 backdrop-blur-md">
      <div className="relative hidden flex-1 md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-placeholder" />
        <input
          placeholder="Search tasks, projects, people…"
          className="h-10 w-full max-w-md rounded-lg border border-border bg-surface pl-9 pr-3 text-sm outline-none transition placeholder:text-placeholder focus:border-primary focus:shadow-[0_0_0_4px_oklch(0.95_0.13_125_/_0.25)]"
        />
      </div>

      <div className="flex flex-1 items-center justify-end gap-3">
        <span className="hidden text-sm text-muted-foreground lg:block">{today}</span>

        <button
          onClick={() => void logout()}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-surface-hover hover:text-foreground"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>

        <button className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground transition hover:bg-surface-hover">
          <Bell className="h-[18px] w-[18px]" strokeWidth={1.8} />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[oklch(0.65_0.2_25)] ring-2 ring-surface" />
        </button>

        {user && (
          <div title={`${user.name} (${user.role})`} className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {user.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}
          </div>
        )}
      </div>
    </header>
  );
}
