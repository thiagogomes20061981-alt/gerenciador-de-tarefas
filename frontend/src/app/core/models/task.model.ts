export interface Task {
  id: number;
  title: string;
  description: string | null;
  done: boolean;
  created_at: string; // ISO 8601
}

export type TaskPayload = Pick<Task, 'title' | 'description' | 'done'>;
