"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkflowSchedule } from "@/lib/api/workflow-types";

const DAY_START = 8.5;
const DAY_END = 18;
const HOUR_HEIGHT = 64;
const SNAP_MINUTES = 15;
const LUNCH_START = 12;
const LUNCH_END = 13.5;
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = [8.5, ...Array.from({ length: 10 }, (_, index) => index + 9)];
type DragMode = "move" | "resize-left" | "resize-right" | "resize-bottom";

interface DragState {
  id: string;
  mode: DragMode;
  pointerX: number;
  pointerY: number;
  start: Date;
  end: Date;
  latestStart: Date;
  latestEnd: Date;
}

export function WorkflowWeekCalendar({ schedules, weekStart, editable, onChange, onDelete }: {
  schedules: WorkflowSchedule[];
  weekStart: Date;
  editable: boolean;
  onChange: (id: string, startsAt: Date, endsAt: Date) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { start: Date; end: Date }>>({});
  const weekEnd = useMemo(() => addDays(weekStart, 7), [weekStart]);
  const gridHeight = (DAY_END - DAY_START) * HOUR_HEIGHT;

  useEffect(() => { dragRef.current = drag; }, [drag]);
  useEffect(() => { if (scrollerRef.current) scrollerRef.current.scrollTop = 0; }, [weekStart]);

  useEffect(() => {
    if (!drag) return;
    function pointerMove(event: PointerEvent) {
      const current = dragRef.current;
      const grid = gridRef.current;
      if (!current || !grid) return;
      const rect = grid.getBoundingClientRect();
      const dayWidth = (rect.width - 64) / 7;
      const deltaDays = Math.round((event.clientX - current.pointerX) / dayWidth);
      const deltaMinutes = snapMinutes(((event.clientY - current.pointerY) / HOUR_HEIGHT) * 60);
      let nextStart = new Date(current.start);
      let nextEnd = new Date(current.end);

      if (current.mode === "move") {
        const safeMinutes = Math.max(DAY_START * 60 - decimalHour(current.start) * 60, Math.min(DAY_END * 60 - decimalHour(current.end) * 60, deltaMinutes));
        nextStart = addMinutes(addDays(current.start, deltaDays), safeMinutes);
        nextEnd = addMinutes(addDays(current.end, deltaDays), safeMinutes);
      } else if (current.mode === "resize-left") {
        nextStart = addDays(current.start, deltaDays);
        if (dateOnly(nextStart) > dateOnly(nextEnd)) nextStart = copyDate(nextEnd, current.start);
      } else if (current.mode === "resize-right") {
        nextEnd = addDays(current.end, deltaDays);
        if (dateOnly(nextEnd) < dateOnly(nextStart)) nextEnd = copyDate(nextStart, current.end);
      } else {
        const endMinutes = Math.max(decimalHour(nextStart) * 60 + 15, Math.min(DAY_END * 60, decimalHour(current.end) * 60 + deltaMinutes));
        nextEnd = new Date(current.end);
        nextEnd.setHours(Math.floor(endMinutes / 60), endMinutes % 60, 0, 0);
      }

      if (nextEnd <= nextStart) {
        if (current.mode === "resize-left") nextStart = addMinutes(nextEnd, -15);
        else nextEnd = addMinutes(nextStart, 15);
      }

      current.latestStart = nextStart;
      current.latestEnd = nextEnd;
      setDrafts((values) => ({ ...values, [current.id]: { start: nextStart, end: nextEnd } }));
    }
    async function pointerUp() {
      const current = dragRef.current;
      if (!current) return;
      setDrag(null);
      try { await onChange(current.id, current.latestStart, current.latestEnd); }
      finally { setDrafts((values) => { const next = { ...values }; delete next[current.id]; return next; }); }
    }
    window.addEventListener("pointermove", pointerMove);
    window.addEventListener("pointerup", pointerUp);
    return () => { window.removeEventListener("pointermove", pointerMove); window.removeEventListener("pointerup", pointerUp); };
  }, [drag?.id, drag?.mode, onChange]);

  const visible = schedules.filter((schedule) => {
    const current = drafts[schedule.id] ?? { start: new Date(schedule.startsAt), end: new Date(schedule.endsAt) };
    return dateOnly(current.start) < dateOnly(weekEnd) && dateOnly(current.end) >= dateOnly(weekStart);
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
      <div className="grid border-b border-border" style={{ gridTemplateColumns: "64px repeat(7, 1fr)" }}>
        <div className="border-r border-border-soft" />
        {DAYS.map((day, index) => { const date = addDays(weekStart, index); return <div key={day} className="border-r border-border-soft px-3 py-3 text-center last:border-r-0"><p className="text-xs font-medium text-muted-foreground">{day}</p><p className="mt-1 text-sm font-semibold">{date.getDate()}</p></div>; })}
      </div>
      <div ref={scrollerRef} className="scrollbar-thin max-h-[calc(100vh-300px)] overflow-y-auto overflow-x-hidden touch-none">
        <div ref={gridRef} className="relative grid" style={{ gridTemplateColumns: "64px repeat(7, 1fr)" }}>
          <div className="relative border-r border-border-soft" style={{ height: gridHeight }}>
            {HOURS.map((hour) => <div key={hour} className="absolute right-2 -translate-y-1/2 text-[11px] text-placeholder" style={{ top: (hour - DAY_START) * HOUR_HEIGHT }}>{formatHour(hour)}</div>)}
          </div>
          {DAYS.map((_, dayIndex) => <div key={dayIndex} className="relative border-r border-border-soft last:border-r-0" style={{ height: gridHeight }}>{HOURS.slice(0, -1).map((hour, index) => <div key={hour} className="absolute left-0 right-0 border-b border-border-soft/60" style={{ top: (hour - DAY_START) * HOUR_HEIGHT, height: (HOURS[index + 1] - hour) * HOUR_HEIGHT }} />)}</div>)}

          <div className="pointer-events-none absolute bottom-0 left-16 right-0 top-0">
            {visible.map((schedule) => {
              const current = drafts[schedule.id] ?? { start: new Date(schedule.startsAt), end: new Date(schedule.endsAt) };
              const actualStartDay = dayOffset(current.start, weekStart);
              const actualEndDay = dayOffset(current.end, weekStart);
              const displayStart = Math.max(0, actualStartDay);
              const displayEnd = Math.min(6, actualEndDay);
              const span = displayEnd - displayStart + 1;
              const startHour = decimalHour(current.start);
              const endHour = decimalHour(current.end);
              const top = (startHour - DAY_START) * HOUR_HEIGHT;
              const height = Math.max(34, Math.max(0.25, endHour - startHour) * HOUR_HEIGHT);
              return (
                <div key={schedule.id} title={schedule.notes || `${schedule.title} · ${priorityLabel[schedule.priority]}`} onPointerDown={editable ? (event) => beginDrag(event, schedule.id, "move", current.start, current.end) : undefined} className={cn("pointer-events-auto group absolute z-10 overflow-hidden rounded-xl border-l-4 px-3 py-1.5 shadow-soft", editable ? "cursor-grab select-none active:cursor-grabbing" : "cursor-default", drag?.id === schedule.id && "z-50 opacity-80")} style={{ left: `calc(${displayStart / 7 * 100}% + 4px)`, width: `calc(${span / 7 * 100}% - 8px)`, top, height, backgroundColor: `${schedule.project.color}26`, borderLeftColor: schedule.project.color }}>
                  <p className="truncate pr-6 text-[13px] font-semibold">{schedule.title}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{formatRange(current.start, current.end)}</p>
                  {height > 58 && <div className="mt-1 flex items-center gap-1.5"><span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-semibold", priorityStyle[schedule.priority])}>{priorityLabel[schedule.priority]}</span><span className="truncate text-[10px] font-medium text-muted-foreground">{schedule.staff.name}</span></div>}
                  {height > 86 && schedule.notes && <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-muted-foreground">{schedule.notes}</p>}
                  {editable && <>
                    <button type="button" aria-label="Delete schedule" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); void onDelete(schedule.id); }} className="absolute right-1.5 top-1.5 rounded p-0.5 text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100"><Trash2 className="h-3.5 w-3.5" /></button>
                    {actualStartDay >= 0 && <div title="Change start date" onPointerDown={(event) => { event.stopPropagation(); beginDrag(event, schedule.id, "resize-left", current.start, current.end); }} className="absolute bottom-0 left-0 top-0 w-2 cursor-ew-resize bg-foreground/10 opacity-0 group-hover:opacity-100" />}
                    {actualEndDay <= 6 && <div title="Change end date" onPointerDown={(event) => { event.stopPropagation(); beginDrag(event, schedule.id, "resize-right", current.start, current.end); }} className="absolute bottom-0 right-0 top-0 w-2 cursor-ew-resize bg-foreground/10 opacity-0 group-hover:opacity-100" />}
                    <div title="Change end time" onPointerDown={(event) => { event.stopPropagation(); beginDrag(event, schedule.id, "resize-bottom", current.start, current.end); }} className="absolute bottom-0 left-2 right-2 h-2 cursor-ns-resize"><div className="mx-auto mt-1 h-1 w-8 rounded-full bg-foreground/30 opacity-0 group-hover:opacity-100" /></div>
                  </>}
                </div>
              );
            })}
          </div>

          <div aria-label="Company lunch break, 12:00 PM to 1:30 PM" className="pointer-events-none absolute left-16 right-0 z-30 border-y border-amber-400/70 bg-amber-300/65" style={{ top: (LUNCH_START - DAY_START) * HOUR_HEIGHT, height: (LUNCH_END - LUNCH_START) * HOUR_HEIGHT }}>
            <span className="sticky left-16 ml-2 rounded bg-amber-100/90 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">Lunch · 12:00–1:30 PM</span>
          </div>
        </div>
      </div>
    </div>
  );

  function beginDrag(event: React.PointerEvent, id: string, mode: DragMode, start: Date, end: Date) {
    const state = { id, mode, pointerX: event.clientX, pointerY: event.clientY, start: new Date(start), end: new Date(end), latestStart: new Date(start), latestEnd: new Date(end) };
    dragRef.current = state;
    setDrag(state);
  }
}

export function startOfWeek(date = new Date()) { const result = new Date(date); result.setHours(0, 0, 0, 0); const day = result.getDay(); result.setDate(result.getDate() - (day === 0 ? 6 : day - 1)); return result; }
function addDays(date: Date, days: number) { const result = new Date(date); result.setDate(result.getDate() + days); return result; }
function addMinutes(date: Date, minutes: number) { return new Date(date.getTime() + minutes * 60000); }
function dayOffset(date: Date, week: Date) { return Math.round((dateOnly(date).getTime() - dateOnly(week).getTime()) / 86400000); }
function dateOnly(date: Date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }
function decimalHour(date: Date) { return date.getHours() + date.getMinutes() / 60; }
function snapMinutes(minutes: number) { return Math.round(minutes / SNAP_MINUTES) * SNAP_MINUTES; }
function copyDate(source: Date, clock: Date) { const result = new Date(source); result.setHours(clock.getHours(), clock.getMinutes(), 0, 0); return result; }
function formatHour(hour: number) { const whole = Math.floor(hour); const minutes = Math.round((hour - whole) * 60); return `${whole % 12 || 12}:${String(minutes).padStart(2, "0")} ${whole >= 12 ? "PM" : "AM"}`; }
function formatRange(start: Date, end: Date) { const date = new Intl.DateTimeFormat([], { month: "short", day: "numeric" }); const time = new Intl.DateTimeFormat([], { hour: "numeric", minute: "2-digit" }); return `${date.format(start)} ${time.format(start)} – ${date.format(end)} ${time.format(end)}`; }

const priorityLabel: Record<WorkflowSchedule["priority"], string> = { important: "Important", less_important: "Less important", easy: "Easy", other: "Other" };
const priorityStyle: Record<WorkflowSchedule["priority"], string> = { important: "bg-red-100 text-red-700", less_important: "bg-amber-100 text-amber-700", easy: "bg-emerald-100 text-emerald-700", other: "bg-slate-100 text-slate-600" };
