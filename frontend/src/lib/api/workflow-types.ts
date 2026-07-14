export interface ProjectUser {
  id: string;
  name: string;
  email: string;
}

export interface WorkflowProject {
  id: string;
  name: string;
  color: string;
  manager: ProjectUser;
  staff: ProjectUser[];
}

export interface WorkflowSchedule {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  notes?: string;
  priority: "important" | "less_important" | "easy" | "other";
  project: { id: string; name: string; color: string };
  staff: ProjectUser;
}
