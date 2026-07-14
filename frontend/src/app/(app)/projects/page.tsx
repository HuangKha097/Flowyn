"use client";

import { FormEvent, useEffect, useState } from "react";
import { CalendarDays, Mail, Pencil, Plus, Save, Trash2, UserMinus, Users, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, PageHeader } from "@/components/ui/surface";
import { apiFetch } from "@/lib/api/client";
import type { WorkflowProject } from "@/lib/api/workflow-types";
import { useRoleStore } from "@/stores/role-store";

export default function ProjectsPage() {
  const role = useRoleStore((state) => state.role);
  const [projects, setProjects] = useState<WorkflowProject[]>([]);
  const [name, setName] = useState("");
  const [inviteEmails, setInviteEmails] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("#84cc16");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [memberProjectId, setMemberProjectId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const memberProject = projects.find((project) => project.id === memberProjectId);
  const deletingProject = projects.find((project) => project.id === deletingId);

  const load = () => apiFetch<WorkflowProject[]>("/projects").then(setProjects).catch((error) => toast.error(error.message));
  useEffect(() => { void load(); }, []);

  async function createProject(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await apiFetch("/projects", { method: "POST", body: JSON.stringify({ name }) });
      setName("");
      await load();
      toast.success("Project created");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create project");
    } finally { setBusy(false); }
  }

  async function invite(project: WorkflowProject) {
    const email = inviteEmails[project.id]?.trim();
    if (!email) return;
    setBusy(true);
    try {
      await apiFetch(`/projects/${project.id}/invitations`, { method: "POST", body: JSON.stringify({ email }) });
      setInviteEmails((values) => ({ ...values, [project.id]: "" }));
      toast.success(`Invitation sent to ${email}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send invitation");
    } finally { setBusy(false); }
  }

  function startEditing(project: WorkflowProject) {
    setEditingId(project.id);
    setEditName(project.name);
    setEditColor(project.color);
  }

  async function updateProject(project: WorkflowProject) {
    setBusy(true);
    try {
      const updated = await apiFetch<WorkflowProject>(`/projects/${project.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: editName, color: editColor }),
      });
      setProjects((rows) => rows.map((row) => row.id === project.id ? updated : row));
      setEditingId(null);
      toast.success("Project updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update project");
    } finally { setBusy(false); }
  }

  async function removeMember(project: WorkflowProject, memberId: string, memberName: string) {
    if (!window.confirm(`Remove ${memberName} from ${project.name}? Their schedules in this project will also be removed.`)) return;
    setBusy(true);
    try {
      await apiFetch(`/projects/${project.id}/members/${memberId}`, { method: "DELETE" });
      setProjects((rows) => rows.map((row) => row.id === project.id ? { ...row, staff: row.staff.filter((member) => member.id !== memberId) } : row));
      toast.success(`${memberName} removed from the project`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to remove member");
    } finally { setBusy(false); }
  }

  function startDeleting(project: WorkflowProject) {
    setDeletingId(project.id);
    setDeleteConfirmation("");
    setEditingId(null);
  }

  async function deleteProject(event: FormEvent, project: WorkflowProject) {
    event.preventDefault();
    const expected = `delete this ${project.name}`;
    if (deleteConfirmation !== expected) return;
    setBusy(true);
    try {
      await apiFetch(`/projects/${project.id}`, {
        method: "DELETE",
        body: JSON.stringify({ confirmation: deleteConfirmation }),
      });
      setProjects((rows) => rows.filter((row) => row.id !== project.id));
      setDeletingId(null);
      setDeleteConfirmation("");
      toast.success(`${project.name} and its calendar were deleted`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete project");
    } finally { setBusy(false); }
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Projects" subtitle={role === "manager" ? "Create projects, manage details, and invite registered staff" : "Projects you have joined"} />

      {role === "manager" && (
        <Card>
          <form onSubmit={createProject} className="flex flex-col gap-3 sm:flex-row">
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="New project name" required />
            <Button disabled={busy}><Plus /> Create project</Button>
          </form>
        </Card>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="flex h-[340px] flex-col overflow-hidden">
            {editingId === project.id ? (
              <div className="space-y-3">
                <Input aria-label="Project name" value={editName} onChange={(event) => setEditName(event.target.value)} maxLength={120} />
                <div className="flex items-center gap-2">
                  <Input aria-label="Project color" type="color" value={editColor} onChange={(event) => setEditColor(event.target.value)} className="w-14 p-1" />
                  <Button type="button" size="sm" disabled={busy || !editName.trim()} onClick={() => void updateProject(project)}><Save /> Save</Button>
                  <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => setEditingId(null)}><X /> Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex min-w-0 items-center gap-2.5"><span className="h-3 w-3 shrink-0 rounded-md" style={{ backgroundColor: project.color }} /><h3 className="truncate font-semibold">{project.name}</h3></div>
                {role === "manager" && <Button type="button" size="icon" variant="ghost" aria-label={`Edit ${project.name}`} disabled={busy} onClick={() => startEditing(project)}><Pencil /></Button>}
              </div>
            )}
            <p className="mt-2 text-xs text-muted-foreground">Manager: {project.manager.name}</p>
            <button type="button" onClick={() => setMemberProjectId(project.id)} className="mt-4 flex w-full items-center justify-between rounded-xl border border-border bg-surface-hover px-3 py-3 text-left transition hover:border-primary/40 hover:bg-primary-light">
              <span className="flex items-center gap-2 text-sm font-medium"><Users className="h-4 w-4 text-primary" /> Project members</span>
              <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">{project.staff.length}</span>
            </button>
            <div className="mt-auto space-y-3 pt-4">
              {role === "manager" && (
                <div className="flex gap-2">
                <Input type="email" aria-label={`Invite staff to ${project.name}`} value={inviteEmails[project.id] ?? ""} onChange={(event) => setInviteEmails((values) => ({ ...values, [project.id]: event.target.value }))} placeholder="Registered staff email" />
                <Button type="button" size="icon" disabled={busy} onClick={() => void invite(project)}><Mail /></Button>
                </div>
              )}
              {role === "manager" && <Button type="button" variant="ghost" className="text-destructive hover:text-destructive" disabled={busy} onClick={() => startDeleting(project)}><Trash2 /> Delete project</Button>}
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={Boolean(memberProject)} onOpenChange={(open) => { if (!open) setMemberProjectId(null); }}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{memberProject?.name} members</DialogTitle>
            <DialogDescription>Review the people who have accepted this project invitation.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {memberProject?.staff.map((staff) => (
              <div key={staff.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{staff.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{staff.email}</p>
                  <p className="mt-1 text-[11px] font-medium text-emerald-600">Active member</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button asChild type="button" size="icon" variant="ghost" aria-label={`Email ${staff.name}`}><a href={`mailto:${staff.email}`}><Mail /></a></Button>
                  {role === "manager" && <Button type="button" size="icon" variant="ghost" aria-label={`Remove ${staff.name}`} disabled={busy} onClick={() => memberProject && void removeMember(memberProject, staff.id, staff.name)}><UserMinus className="text-destructive" /></Button>}
                </div>
              </div>
            ))}
            {memberProject?.staff.length === 0 && <div className="rounded-xl border border-dashed border-border p-8 text-center"><Users className="mx-auto h-8 w-8 text-muted-foreground" /><p className="mt-2 text-sm text-muted-foreground">No members have joined this project yet.</p></div>}
          </div>
          <Button type="button" variant="outline" onClick={() => { window.location.href = "/calendar"; }}><CalendarDays /> View project calendars</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deletingProject)} onOpenChange={(open) => { if (!open) { setDeletingId(null); setDeleteConfirmation(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {deletingProject?.name}?</DialogTitle>
            <DialogDescription>This deletes the project, its tasks, invitations, members, and calendar.</DialogDescription>
          </DialogHeader>
          {deletingProject && (
            <form className="space-y-3" onSubmit={(event) => void deleteProject(event, deletingProject)}>
              <p className="text-sm text-muted-foreground">Type <strong className="text-foreground">delete this {deletingProject.name}</strong>, then press Enter.</p>
              <Input autoFocus aria-label={`Confirm deletion of ${deletingProject.name}`} value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} placeholder={`delete this ${deletingProject.name}`} autoComplete="off" />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" disabled={busy} onClick={() => { setDeletingId(null); setDeleteConfirmation(""); }}><X /> Cancel</Button>
                <Button type="submit" variant="destructive" disabled={busy || deleteConfirmation !== `delete this ${deletingProject.name}`}><Trash2 /> Delete project</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
