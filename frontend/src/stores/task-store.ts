import { create } from "zustand";
import { tasks as initialTasks, type Task } from "@/lib/mock-data";

interface TaskState {
  tasks: Task[];
  moveTask: (id: string, day: number, start: number) => void;
  resizeTask: (id: string, end: number) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: initialTasks,
  moveTask: (id, day, start) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id ? { ...t, day, start, end: start + (t.end - t.start) } : t,
      ),
    })),
  resizeTask: (id, end) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id ? { ...t, end: Math.max(t.start + 0.5, end) } : t,
      ),
    })),
}));
