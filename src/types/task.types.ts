export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'archived'

export interface Category {
  id: string
  user_id: string
  name: string
  color: string // OKLCH or theme color key
  icon?: string
  created_at: string
}

export interface Subtask {
  id: string
  task_id: string
  title: string
  is_completed: boolean
  position: number
}

export interface Task {
  id: string
  user_id: string
  category_id?: string
  title: string
  description?: string
  priority: PriorityLevel
  estimated_minutes: number
  due_date?: string // YYYY-MM-DD
  status: TaskStatus
  subtasks: Subtask[]
  created_at: string
  updated_at: string
}

export interface CreateTaskInput {
  title: string
  description?: string
  category_id?: string
  priority?: PriorityLevel
  estimated_minutes?: number
  due_date?: string
  subtasks?: string[]
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  category_id?: string
  priority?: PriorityLevel
  estimated_minutes?: number
  due_date?: string
  status?: TaskStatus
  subtasks?: { id?: string; title: string; is_completed: boolean; position?: number }[]
}

