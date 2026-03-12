export interface Task {
  id: number;
  kanbanId: number;
  title: string;
  description: string;
  columnId: number;
  assigneeId?: number | null;
  creatorUserId?: number | null;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  dueDate: string;
}

export interface Kanban {
  id?: number;
  projectId?: number | null;
  name: string;
  columns: Column[];
}

export interface Column {
  id?: number;
  kanbanId: number;
  name: string;
  status: string;
}
