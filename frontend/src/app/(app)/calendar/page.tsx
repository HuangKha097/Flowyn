"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { toast } from "sonner";
import { WorkflowWeekCalendar, startOfWeek } from "@/components/calendar/workflow-week-calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, PageHeader } from "@/components/ui/surface";
import { apiFetch } from "@/lib/api/client";
import type { WorkflowProject, WorkflowSchedule } from "@/lib/api/workflow-types";
import { useRoleStore } from "@/stores/role-store";

export default function CalendarPage() {
  const role = useRoleStore((state) => state.role);
  const [projects, setProjects] = useState<WorkflowProject[]>([]);
  const [schedules, setSchedules] = useState<WorkflowSchedule[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState(() => startOfWeek());
  const [staffId, setStaffId] = useState("");
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [priority, setPriority] = useState<WorkflowSchedule["priority"]>("other");
  const [notes, setNotes] = useState("");
  const selectedProject = useMemo(() => projects.find((project) => project.id === selectedId), [projects, selectedId]);
  const projectSchedules = useMemo(() => schedules.filter((schedule) => schedule.project.id === selectedId), [schedules, selectedId]);

  const load = useCallback(async () => {
    const [projectRows, scheduleRows] = await Promise.all([
      apiFetch<WorkflowProject[]>("/projects"),
      apiFetch<WorkflowSchedule[]>("/schedules"),
    ]);
    setProjects(projectRows);
    setSchedules(scheduleRows);
  }, []);

  useEffect(() => { load().catch((error) => toast.error(error.message)); }, [load]);

  const changeSchedule = useCallback(async (id: string, newStart: Date, newEnd: Date) => {
    try {
      const updated = await apiFetch<WorkflowSchedule>(`/schedules/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ startsAt: newStart.toISOString(), endsAt: newEnd.toISOString() }),
      });
      setSchedules((rows) => rows.map((row) => row.id === id ? updated : row));
      toast.success("Timeline updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update timeline");
      throw error;
    }
  }, []);

  const deleteSchedule = useCallback(async (id: string) => {
    try {
      await apiFetch(`/schedules/${id}`, { method: "DELETE" });
      setSchedules((rows) => rows.filter((row) => row.id !== id));
      toast.success("Schedule removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to remove schedule");
    }
  }, []);

  async function createSchedule(event: FormEvent) {
    event.preventDefault();
    if (!selectedProject) return;
    try {
      const created = await apiFetch<WorkflowSchedule>("/schedules", {
        method: "POST",
        body: JSON.stringify({ projectId: selectedProject.id, staffId, title, priority, notes, startsAt: new Date(startsAt).toISOString(), endsAt: new Date(endsAt).toISOString() }),
      });
      setSchedules((rows) => [...rows, created]);
      setTitle(""); setStartsAt(""); setEndsAt(""); setPriority("other"); setNotes("");
      toast.success("Schedule created");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to create schedule"); }
  }

  if (!selectedProject) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader title="Calendar" subtitle="Select a project to open its detailed weekly calendar" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const count = schedules.filter((schedule) => schedule.project.id === project.id).length;
            return (
              <button key={project.id} onClick={() => { setSelectedId(project.id); setStaffId(""); }} className="text-left">
                <Card className="h-full transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-soft-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5"><span className="h-3 w-3 rounded-md" style={{ backgroundColor: project.color }} /><h2 className="font-semibold">{project.name}</h2></div>
                    <CalendarDays className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">Managed by {project.manager.name}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {project.staff.length} staff</span>
                    <span>{count} schedule blocks</span>
                  </div>
                </Card>
              </button>
            );
          })}
        </div>
        {projects.length === 0 && <p className="text-sm text-muted-foreground">No projects are available yet.</p>}
      </div>
    );
  }

  return (
    <div className="space-y-5 p-6">
      <PageHeader
        title={selectedProject.name}
        subtitle={role === "manager" ? "Drag blocks to move; drag side edges for dates and the bottom edge for time" : "Your project calendar is read only"}
        action={<div className="flex gap-2"><Button variant="outline" onClick={() => setWeekStart((date) => addDays(date, -7))}><ChevronLeft /> Previous</Button><Button variant="outline" onClick={() => setWeekStart(startOfWeek())}>This week</Button><Button variant="outline" onClick={() => setWeekStart((date) => addDays(date, 7))}>Next <ChevronRight /></Button></div>}
      />
      <Button variant="ghost" onClick={() => setSelectedId(null)}><ArrowLeft /> All projects</Button>

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span>Company shift: 8:30 AM–6:00 PM</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-5 rounded border border-amber-400 bg-amber-300/70" /> Lunch: 12:00–1:30 PM</span>
      </div>

      {role === "manager" && (
        <Card>
          <form onSubmit={createSchedule} className="grid items-end gap-3 md:grid-cols-2 lg:grid-cols-6">
            <div className="space-y-1.5"><Label htmlFor="schedule-staff">Staff</Label><select id="schedule-staff" required value={staffId} onChange={(event) => setStaffId(event.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">Select accepted staff</option>{selectedProject.staff.map((staff) => <option key={staff.id} value={staff.id}>{staff.name}</option>)}</select></div>
            <div className="space-y-1.5"><Label htmlFor="schedule-title">Block name</Label><Input id="schedule-title" required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Schedule title" /></div>
            <div className="space-y-1.5"><Label htmlFor="schedule-priority">Priority</Label><select id="schedule-priority" value={priority} onChange={(event) => setPriority(event.target.value as WorkflowSchedule["priority"])} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="important">Important</option><option value="less_important">Less important</option><option value="easy">Easy</option><option value="other">Other</option></select></div>
            <div className="space-y-1.5"><Label htmlFor="schedule-from">From date and time</Label><Input id="schedule-from" required type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} /></div>
            <div className="space-y-1.5"><Label htmlFor="schedule-to">To date and time</Label><Input id="schedule-to" required type="datetime-local" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} /></div>
            <Button>Create block</Button>
            <div className="space-y-1.5 md:col-span-2 lg:col-span-6"><Label htmlFor="schedule-notes">Task notes</Label><Textarea id="schedule-notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add instructions, context, links, or other details for the staff member…" rows={3} /></div>
          </form>
        </Card>
      )}

      <WorkflowWeekCalendar schedules={projectSchedules} weekStart={weekStart} editable={role === "manager"} onChange={changeSchedule} onDelete={deleteSchedule} />
    </div>
  );
}

function addDays(date: Date, days: number) { const result = new Date(date); result.setDate(result.getDate() + days); return result; }
