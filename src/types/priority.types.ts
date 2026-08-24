export interface DailyPriority {
  id: string
  user_id: string
  priority_date: string // YYYY-MM-DD
  task_id: string
  position: number // 1, 2, or 3
  created_at: string
}

