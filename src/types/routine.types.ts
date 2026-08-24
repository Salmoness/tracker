export interface RoutineTemplateItem {
  id: string
  routine_template_id: string
  title: string
  estimated_minutes: number
  position: number
}

export interface RoutineTemplate {
  id: string
  user_id: string
  name: string
  items: RoutineTemplateItem[]
  created_at: string
}

export interface CreateRoutineTemplateInput {
  name: string
  items: { title: string; estimated_minutes?: number }[]
}

export interface DailyRoutineRun {
  id: string
  user_id: string
  routine_template_id: string
  target_date: string // YYYY-MM-DD
  created_at: string
}

