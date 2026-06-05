import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen w-full gap-4 bg-bg-secondary p-4">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-soft">
          <Topbar />
          <main className="scrollbar-thin flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
