"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRoleStore } from "@/stores/role-store";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useRoleStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push("/login");
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted || !isAuthenticated) {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
}
