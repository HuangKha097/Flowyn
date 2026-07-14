"use client";

import { Card, PageHeader, SectionTitle } from "@/components/ui/surface";
import { useRoleStore } from "@/stores/role-store";


export default function SettingsPage() {
  const user = useRoleStore((state) => state.user);

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Settings" subtitle="Workspace and profile preferences" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle>Profile</SectionTitle>
          {user && (
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {user.name.split(" ").filter(Boolean).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}
              </div>
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          )}
          <div className="mt-5 space-y-3">
            <Field label="Display name" value={user?.name ?? ""} />
            <Field label="Email" value={user?.email ?? ""} readOnly />
            <Field label="Role" value={user?.role ?? ""} readOnly />
            <Field label="Working hours" value="8:30 AM – 6:00 PM" />
          </div>
        </Card>

        <Card>
          <SectionTitle>Preferences</SectionTitle>
          <div className="mt-4 space-y-3">
            <Toggle label="Calendar-first home" on />
            <Toggle label="Subtle notifications" on />
            <Toggle label="Show lunch break" on />
            <Toggle label="Hide weekends" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, value, readOnly = false }: { label: string; value: string; readOnly?: boolean }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        defaultValue={value}
        readOnly={readOnly}
        className="mt-1 h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none transition focus:border-primary focus:shadow-[0_0_0_4px_oklch(0.95_0.13_125_/_0.25)]"
      />
    </div>
  );
}

function Toggle({ label, on = false }: { label: string; on?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border-soft px-3 py-2.5">
      <span className="text-sm">{label}</span>
      <span
        className={`flex h-5 w-9 items-center rounded-full px-0.5 transition ${on ? "bg-primary" : "bg-surface-secondary"}`}
      >
        <span className={`h-4 w-4 rounded-full bg-surface shadow-soft transition ${on ? "translate-x-4" : ""}`} />
      </span>
    </div>
  );
}
