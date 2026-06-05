"use client";

import Link from "next/link";
import { Card, PageHeader, SectionTitle } from "@/components/ui/surface";
import { useRoleStore } from "@/stores/role-store";
import { currentUserByRole, getMember } from "@/lib/mock-data";
import { Avatar } from "@/components/ui/member-avatar";


export default function SettingsPage() {
  const role = useRoleStore((s) => s.role);
  const user = getMember(currentUserByRole[role]);

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Settings" subtitle="Workspace and profile preferences" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle>Profile</SectionTitle>
          {user && (
            <div className="mt-4 flex items-center gap-3">
              <Avatar memberId={user.id} size={52} />
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.title}</p>
              </div>
            </div>
          )}
          <div className="mt-5 space-y-3">
            <Field label="Display name" value={user?.name ?? ""} />
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

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        defaultValue={value}
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
