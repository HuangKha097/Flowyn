export type Role = "member" | "head" | "admin";

export type TaskStatus = "todo" | "progress" | "review" | "done" | "overdue";
export type Priority = "low" | "medium" | "high";

export interface Member {
  id: string;
  name: string;
  initials: string;
  color: string; // avatar bg
  role: Role;
  title: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  projectId: string;
  assigneeId: string;
  status: TaskStatus;
  priority: Priority;
  day: number; // 0 = Monday ... 6 = Sunday
  start: number; // hours, e.g. 9.5 = 9:30
  end: number;
  checklist?: { id: string; label: string; done: boolean }[];
  notes?: string;
}

export interface Sprint {
  name: string;
  progress: number; // 0-100
  totalTasks: number;
  doneTasks: number;
  daysLeft: number;
}

export const members: Member[] = [
  { id: "m1", name: "Minh Tran", initials: "MT", color: "oklch(0.86 0.16 123)", role: "member", title: "Frontend Engineer" },
  { id: "m2", name: "An Pham", initials: "AP", color: "oklch(0.8 0.1 230)", role: "member", title: "Backend Engineer" },
  { id: "m3", name: "Nam Le", initials: "NL", color: "oklch(0.82 0.13 60)", role: "member", title: "Designer" },
  { id: "m4", name: "Linh Vo", initials: "LV", color: "oklch(0.78 0.13 350)", role: "head", title: "Team Head" },
  { id: "m5", name: "Khoa Bui", initials: "KB", color: "oklch(0.75 0.12 290)", role: "admin", title: "Workspace Admin" },
];

export const currentUserByRole: Record<Role, string> = {
  member: "m1",
  head: "m4",
  admin: "m5",
};

export const projects: Project[] = [
  { id: "p1", name: "Mobile App", color: "oklch(0.86 0.16 123)" },
  { id: "p2", name: "Web Platform", color: "oklch(0.8 0.1 230)" },
  { id: "p3", name: "Design System", color: "oklch(0.82 0.13 60)" },
  { id: "p4", name: "Infrastructure", color: "oklch(0.78 0.13 350)" },
];

export const tasks: Task[] = [
  {
    id: "t1", title: "API Integration", projectId: "p2", assigneeId: "m1",
    status: "progress", priority: "high", day: 0, start: 9, end: 11,
    checklist: [
      { id: "c1", label: "Define endpoints", done: true },
      { id: "c2", label: "Auth headers", done: true },
      { id: "c3", label: "Error handling", done: false },
      { id: "c4", label: "Write tests", done: false },
    ],
    notes: "Coordinate with backend on the new pagination contract.",
  },
  { id: "t2", title: "Design Review", projectId: "p3", assigneeId: "m1", status: "review", priority: "medium", day: 0, start: 13.5, end: 15 },
  { id: "t3", title: "Standup Sync", projectId: "p2", assigneeId: "m1", status: "done", priority: "low", day: 0, start: 8.5, end: 9 },
  { id: "t4", title: "Build Calendar Grid", projectId: "p1", assigneeId: "m1", status: "progress", priority: "high", day: 1, start: 9.5, end: 12 },
  { id: "t5", title: "Refactor Auth", projectId: "p4", assigneeId: "m2", status: "todo", priority: "medium", day: 1, start: 14, end: 16.5 },
  { id: "t6", title: "Onboarding Flow", projectId: "p1", assigneeId: "m3", status: "review", priority: "high", day: 2, start: 9, end: 11.5 },
  { id: "t7", title: "DB Migration", projectId: "p4", assigneeId: "m2", status: "overdue", priority: "high", day: 2, start: 15, end: 17 },
  { id: "t8", title: "Polish Animations", projectId: "p3", assigneeId: "m1", status: "todo", priority: "low", day: 3, start: 10, end: 11.5 },
  { id: "t9", title: "Sprint Planning", projectId: "p2", assigneeId: "m4", status: "done", priority: "medium", day: 3, start: 13.5, end: 15 },
  { id: "t10", title: "Performance Audit", projectId: "p2", assigneeId: "m2", status: "progress", priority: "medium", day: 4, start: 9, end: 11 },
  { id: "t11", title: "Icon Set", projectId: "p3", assigneeId: "m3", status: "todo", priority: "low", day: 4, start: 14, end: 16 },
  { id: "t12", title: "Release Notes", projectId: "p1", assigneeId: "m1", status: "todo", priority: "medium", day: 4, start: 16, end: 17.5 },
];

export const sprint: Sprint = {
  name: "Sprint 24 — Velocity",
  progress: 68,
  totalTasks: 42,
  doneTasks: 28,
  daysLeft: 4,
};

export interface ReviewItem {
  id: string;
  taskTitle: string;
  authorId: string;
  projectId: string;
  submitted: string;
}

export const reviewQueue: ReviewItem[] = [
  { id: "r1", taskTitle: "Onboarding Flow", authorId: "m3", projectId: "p1", submitted: "2h ago" },
  { id: "r2", taskTitle: "Design Review", authorId: "m1", projectId: "p3", submitted: "4h ago" },
  { id: "r3", taskTitle: "API Pagination", authorId: "m2", projectId: "p2", submitted: "Yesterday" },
];

export const weeklyVelocity = [
  { week: "W1", completed: 18, planned: 24 },
  { week: "W2", completed: 22, planned: 26 },
  { week: "W3", completed: 31, planned: 30 },
  { week: "W4", completed: 28, planned: 34 },
];

export const completionTrend = [
  { day: "Mon", rate: 72 },
  { day: "Tue", rate: 80 },
  { day: "Wed", rate: 65 },
  { day: "Thu", rate: 88 },
  { day: "Fri", rate: 76 },
];

export interface Notification {
  id: string;
  text: string;
  time: string;
}

export const notifications: Notification[] = [
  { id: "n1", text: "Linh approved your Design Review", time: "10m" },
  { id: "n2", text: "New task assigned: Release Notes", time: "1h" },
  { id: "n3", text: "DB Migration is overdue", time: "3h" },
];

export const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const DAY_DATES = [3, 4, 5, 6, 7, 8, 9];

export const WORK_START = 8.5; // 8:30
export const WORK_END = 18; // 18:00
export const LUNCH_START = 12;
export const LUNCH_END = 13.5;
export const DAY_START = 8;
export const DAY_END = 19;
export const HOUR_HEIGHT = 72;

export function getMember(id: string) {
  return members.find((m) => m.id === id);
}
export function getProject(id: string) {
  return projects.find((p) => p.id === id);
}

export function formatHour(h: number) {
  const hour = Math.floor(h);
  const min = Math.round((h - hour) * 60);
  const ampm = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${min.toString().padStart(2, "0")} ${ampm}`;
}

export const STATUS_META: Record<TaskStatus, { label: string }> = {
  todo: { label: "To Do" },
  progress: { label: "In Progress" },
  review: { label: "Review" },
  done: { label: "Done" },
  overdue: { label: "Overdue" },
};
