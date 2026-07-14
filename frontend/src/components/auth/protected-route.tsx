"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRoleStore } from "@/stores/role-store";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, status, hydrate } = useRoleStore();

  useEffect(() => {
    if (status === "checking") void hydrate();
  }, [status, hydrate]);

  useEffect(() => {
    if (status === "guest" && !isAuthenticated) {
      router.replace("/login");
    }
  }, [status, isAuthenticated, router]);

  if (status === "checking" || !isAuthenticated) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Restoring your session…</div>;
  }

  return <>{children}</>;
}
