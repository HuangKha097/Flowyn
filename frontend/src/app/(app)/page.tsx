"use client";

import { useRoleStore } from "@/stores/role-store";
import { MemberDashboard } from "@/components/dashboards/member-dashboard";
import { HeadDashboard } from "@/components/dashboards/head-dashboard";
import { AdminDashboard } from "@/components/dashboards/admin-dashboard";

export default function Dashboard() {
  const role = useRoleStore((s) => s.role);
  if (role === "admin") return <AdminDashboard />;
  if (role === "head") return <HeadDashboard />;
  return <MemberDashboard />;
}
