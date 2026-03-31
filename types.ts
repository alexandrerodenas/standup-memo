
export type TodoCategory = 'task' | 'bugfix' | 'idea' | 'reminder';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  category: TodoCategory;
}

export interface DailyData {
  note: string;
  todos: Todo[];
}

export interface AppSettings {
  windowSize: number;
}

export type NotesMap = Record<string, DailyData>;
