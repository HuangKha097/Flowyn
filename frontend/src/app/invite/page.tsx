"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api/client";

function InvitationResult() {
  const params = useSearchParams();
  const [message, setMessage] = useState("Approving your invitation…");
  useEffect(() => {
    const token = params.get("token");
    apiFetch<{ success: boolean; project: string }>("/invitations/accept", { method: "POST", body: JSON.stringify({ token }) }, false)
      .then((result) => setMessage(`You joined ${result.project}.`))
      .catch((error) => setMessage(error instanceof Error ? error.message : "Unable to accept invitation"));
  }, [params]);
  return <p className="mt-3 text-sm text-muted-foreground">{message}</p>;
}

export default function InvitePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-secondary p-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-soft">
        <h1 className="text-2xl font-semibold">Flowyn invitation</h1>
        <Suspense fallback={<p className="mt-3 text-sm">Loading…</p>}><InvitationResult /></Suspense>
        <Link href="/login" className="mt-6 inline-block text-sm font-semibold text-primary-dark hover:underline">Open Flowyn</Link>
      </div>
    </main>
  );
}
