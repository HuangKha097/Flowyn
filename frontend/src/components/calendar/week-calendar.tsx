import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  WEEK_DAYS,
  DAY_DATES,
  DAY_START,
  DAY_END,
  WORK_START,
  WORK_END,
  LUNCH_START,
  LUNCH_END,
  HOUR_HEIGHT,
  formatHour,
  getMember,
  getProject,
  type Task,
} from "@/lib/mock-data";
import { useTaskStore } from "@/stores/task-store";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/member-avatar";

const HOURS = Array.from({ length: DAY_END - DAY_START + 1 }, (_, i) => DAY_START + i);
const SNAP = 0.25;

const blockStyles: Record<Task["status"], string> = {
  done: "bg-[oklch(0.96_0_0)] opacity-70 text-foreground",
  progress: "bg-status-progress border-l-4 border-status-progress-bar text-foreground",
  review: "bg-status-review border-l-4 border-status-review-bar text-foreground",
  overdue: "bg-status-overdue border-l-4 border-status-overdue-bar text-foreground",
  todo: "bg-surface border border-border text-foreground",
};

interface DragState {
  taskId: string;
  mode: "move" | "resize";
  startY: number;
  initialStart: number;
  initialEnd: number;
}

export function WeekCalendar({
  tasks,
  showAllAssignees = false,
}: {
  tasks: Task[];
  showAllAssignees?: boolean;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const moveTask = useTaskStore((s) => s.moveTask);
  const resizeTask = useTaskStore((s) => s.resizeTask);
  const [drag, setDrag] = useState<DragState | null>(null);

  const gridHeight = (DAY_END - DAY_START) * HOUR_HEIGHT;

  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;
  const dragRef = useRef(drag);
  dragRef.current = drag;

  function xToDay(clientX: number) {
    if (!gridRef.current) return 0;
    const rect = gridRef.current.getBoundingClientRect();
    const colWidth = rect.width;
    return Math.min(6, Math.max(0, Math.floor((clientX - rect.left) / colWidth)));
  }

  function snap(val: number) {
    return Math.round(val / SNAP) * SNAP;
  }

  useEffect(() => {
    if (!drag) return;

    function handlePointerMove(e: PointerEvent) {
      const currentDrag = dragRef.current;
      if (!currentDrag) return;
      
      const deltaHours = (e.clientY - currentDrag.startY) / HOUR_HEIGHT;

      if (currentDrag.mode === "move") {
        const newStart = Math.max(DAY_START, Math.min(DAY_END - 0.5, snap(currentDrag.initialStart + deltaHours)));
        moveTask(currentDrag.taskId, xToDay(e.clientX), newStart);
      } else {
        const newEnd = Math.max(currentDrag.initialStart + 0.5, Math.min(DAY_END, snap(currentDrag.initialEnd + deltaHours)));
        resizeTask(currentDrag.taskId, newEnd);
      }
    }

    function handlePointerUp() {
      setDrag(null);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [drag?.taskId, drag?.mode, moveTask, resizeTask]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
      {/* Header */}
      <div className="grid border-b border-border" style={{ gridTemplateColumns: "64px repeat(7, 1fr)" }}>
        <div className="border-r border-border-soft" />
        {WEEK_DAYS.map((d, i) => {
          const isToday = i === 0;
          return (
            <div key={d} className="border-r border-border-soft px-3 py-3 text-center last:border-r-0">
              <p className="text-xs font-medium text-muted-foreground">{d}</p>
              <p
                className={cn(
                  "mx-auto mt-1 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold",
                  isToday ? "bg-primary text-primary-foreground" : "text-foreground",
                )}
              >
                {DAY_DATES[i]}
              </p>
            </div>
          );
        })}
      </div>

      {/* Body */}
      <div
        className="scrollbar-thin relative max-h-[calc(100vh-280px)] overflow-y-auto overflow-x-hidden touch-none"
      >
        <div className="grid" style={{ gridTemplateColumns: "64px repeat(7, 1fr)" }}>
          {/* Time gutter */}
          <div className="relative border-r border-border-soft" style={{ height: gridHeight }}>
            {HOURS.map((h, i) => (
              <div
                key={h}
                className="absolute right-2 -translate-y-1/2 text-[11px] font-medium text-placeholder"
                style={{ top: i * HOUR_HEIGHT }}
              >
                {i > 0 && formatHour(h)}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {WEEK_DAYS.map((_, dayIdx) => (
            <div
              key={dayIdx}
              ref={dayIdx === 0 ? gridRef : undefined}
              className="relative border-r border-border-soft last:border-r-0"
              style={{ height: gridHeight }}
            >
              {/* Hour lines + non-working shading */}
              {HOURS.slice(0, -1).map((h, i) => {
                const outside = h < WORK_START || h >= WORK_END;
                const lunch = h >= LUNCH_START && h < LUNCH_END;
                return (
                  <div
                    key={h}
                    className={cn(
                      "absolute left-0 right-0 border-b border-[oklch(0.95_0.006_120)]",
                      outside && "bg-[oklch(0.985_0.004_120)]",
                      lunch && "bg-[oklch(0.97_0.03_120)]",
                    )}
                    style={{ top: i * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                  />
                );
              })}

              {/* Current time line on today */}
              {dayIdx === 0 && <CurrentTimeLine />}

              {/* Tasks */}
              {tasks
                .filter((t) => t.day === dayIdx)
                .map((task) => (
                  <CalendarBlock
                    key={task.id}
                    task={task}
                    showAssignee={showAllAssignees}
                    onStartDrag={(mode, clientY) =>
                      setDrag({
                        taskId: task.id,
                        mode,
                        startY: clientY,
                        initialStart: task.start,
                        initialEnd: task.end,
                      })
                    }
                    dragging={drag?.taskId === task.id}
                  />
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const CalendarBlock = React.memo(function CalendarBlock({
  task,
  showAssignee,
  onStartDrag,
  dragging,
}: {
  task: Task;
  showAssignee: boolean;
  onStartDrag: (mode: "move" | "resize", clientY: number) => void;
  dragging: boolean;
}) {
  const top = (task.start - DAY_START) * HOUR_HEIGHT;
  const height = (task.end - task.start) * HOUR_HEIGHT;
  const project = getProject(task.projectId);
  const member = getMember(task.assigneeId);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{
        opacity: dragging ? 0.8 : 1,
        scale: dragging ? 1.02 : 1,
        zIndex: dragging ? 50 : 1,
      }}
      transition={{ duration: 0.18 }}
      onPointerDown={(e) => {
        e.stopPropagation();
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        onStartDrag("move", e.clientY);
      }}
      whileHover={{ y: -1 }}
      className={cn(
        "group absolute left-1 right-1 cursor-grab touch-none select-none overflow-hidden rounded-xl px-2.5 py-1.5 shadow-soft active:cursor-grabbing",
        blockStyles[task.status],
      )}
      style={{ top, height }}
    >
      <p className="truncate text-[13px] font-semibold leading-tight">{task.title}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">
        {formatHour(task.start)} – {formatHour(task.end)}
      </p>
      {height > 56 && (
        <div className="mt-1 flex items-center justify-between">
          <span className="text-[10px] font-medium text-muted-foreground">{project?.name}</span>
          {showAssignee && member && <Avatar memberId={member.id} size={20} />}
        </div>
      )}
      <div
        onPointerDown={(e) => {
          e.stopPropagation();
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          onStartDrag("resize", e.clientY);
        }}
        className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100"
      >
        <div className="mx-auto mb-0.5 h-1 w-8 rounded-full bg-foreground/20" />
      </div>
    </motion.div>
  );
}, (prev, next) => {
  return prev.task === next.task &&
         prev.showAssignee === next.showAssignee &&
         prev.dragging === next.dragging;
});

function CurrentTimeLine() {
  const now = 10.4; // mock current time within working hours
  const top = (now - DAY_START) * HOUR_HEIGHT;
  return (
    <div className="pointer-events-none absolute left-0 right-0 z-10" style={{ top }}>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.4 }}
        className="relative h-px origin-left bg-[oklch(0.65_0.2_25)]"
      >
        <span className="absolute -left-1 -top-[3px] h-1.5 w-1.5 rounded-full bg-[oklch(0.65_0.2_25)]" />
      </motion.div>
    </div>
  );
}
