"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Card, PageHeader } from "@/components/ui/surface";
import { apiFetch } from "@/lib/api/client";
import type { Role } from "@/lib/mock-data";
import { useRoleStore, type AuthUser } from "@/stores/role-store";

const roleLabel: Record<Role, string> = {
  admin: "Admin",
  manager: "Manager",
  staff: "Staff",
};

export default function TeamPage() {
  const currentRole = useRoleStore((state) => state.role);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<AuthUser[]>("/users")
      .then(setUsers)
      .catch((error) => toast.error(error instanceof Error ? error.message : "Unable to load users"))
      .finally(() => setLoading(false));
  }, []);

  async function changeRole(userId: string, role: Role) {
    try {
      const updated = await apiFetch<AuthUser>(`/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      setUsers((items) => items.map((item) => item.id === userId ? updated : item));
      toast.success(`Role changed to ${roleLabel[role]}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to change role");
    }
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Team" subtitle="People and access roles at a glance" />
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading team…</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((user, index) => (
            <motion.div key={user.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <Card>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {user.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                {currentRole === "admin" ? (
                  <select
                    aria-label={`Role for ${user.name}`}
                    value={user.role}
                    onChange={(event) => void changeRole(user.id, event.target.value as Role)}
                    className="mt-4 h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm"
                  >
                    <option value="staff">Staff</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : (
                  <span className="mt-4 inline-block rounded-full bg-surface-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {roleLabel[user.role]}
                  </span>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
