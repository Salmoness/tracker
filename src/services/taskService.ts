import { supabase, isConfiguredSupabase } from '@/lib/supabase'
import { Task, Category, CreateTaskInput, UpdateTaskInput, Subtask } from '@/types/task.types'

const MOCK_CATEGORIES_KEY = 'tracker_mock_categories'
const MOCK_TASKS_KEY = 'tracker_mock_tasks'

const DEFAULT_CATEGORIES = [
  { name: 'Work', color: 'chlorophyll', icon: 'Briefcase' },
  { name: 'Personal', color: 'ultraviolet', icon: 'User' },
  { name: 'Health', color: 'solar', icon: 'Heart' },
  { name: 'Bills', color: 'rose', icon: 'DollarSign' },
  { name: 'Finance', color: 'emerald', icon: 'TrendingUp' },
]

export const taskService = {
  // 1. Fetch or Seed Categories
  async fetchCategories(userId: string): Promise<Category[]> {
    if (isConfiguredSupabase) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true })

      if (error) throw error
      if (data && data.length > 0) return data as Category[]

      // Seed defaults if empty
      const seedData = DEFAULT_CATEGORIES.map((c) => ({
        user_id: userId,
        name: c.name,
        color: c.color,
        icon: c.icon,
      }))
      const { data: seeded, error: seedErr } = await supabase.from('categories').insert(seedData).select()
      if (seedErr) throw seedErr
      return seeded as Category[]
    } else {
      const raw = localStorage.getItem(`${MOCK_CATEGORIES_KEY}_${userId}`)
      if (raw) return JSON.parse(raw)

      const seeded: Category[] = DEFAULT_CATEGORIES.map((c, i) => ({
        id: `cat_${Date.now()}_${i}`,
        user_id: userId,
        name: c.name,
        color: c.color,
        icon: c.icon,
        created_at: new Date().toISOString(),
      }))
      localStorage.setItem(`${MOCK_CATEGORIES_KEY}_${userId}`, JSON.stringify(seeded))
      return seeded
    }
  },

  // 2. Create Category
  async createCategory(userId: string, name: string, color: string, icon?: string): Promise<Category> {
    if (isConfiguredSupabase) {
      const { data, error } = await supabase
        .from('categories')
        .insert({ user_id: userId, name, color, icon })
        .select()
        .single()
      if (error) throw error
      return data as Category
    } else {
      const categories = await this.fetchCategories(userId)
      const newCat: Category = {
        id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        user_id: userId,
        name,
        color,
        icon,
        created_at: new Date().toISOString(),
      }
      categories.push(newCat)
      localStorage.setItem(`${MOCK_CATEGORIES_KEY}_${userId}`, JSON.stringify(categories))
      return newCat
    }
  },

  // 3. Fetch Tasks
  async fetchTasks(userId: string): Promise<Task[]> {
    if (isConfiguredSupabase) {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, subtasks(*)')
        .eq('user_id', userId)
        .neq('status', 'archived')
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []).map((t: any) => ({
        ...t,
        subtasks: (t.subtasks || []).sort((a: Subtask, b: Subtask) => a.position - b.position),
      })) as Task[]
    } else {
      const raw = localStorage.getItem(`${MOCK_TASKS_KEY}_${userId}`)
      if (!raw) return []
      const tasks: Task[] = JSON.parse(raw)
      return tasks.filter((t) => t.status !== 'archived')
    }
  },

  // 4. Create Task
  async createTask(userId: string, input: CreateTaskInput): Promise<Task> {
    const now = new Date().toISOString()
    const taskSubtasks: Subtask[] = (input.subtasks || []).map((title, i) => ({
      id: `sub_${Date.now()}_${i}`,
      task_id: '',
      title,
      is_completed: false,
      position: i,
    }))

    if (isConfiguredSupabase) {
      const { data: taskData, error: taskErr } = await supabase
        .from('tasks')
        .insert({
          user_id: userId,
          category_id: input.category_id || null,
          title: input.title,
          description: input.description || null,
          priority: input.priority || 'medium',
          estimated_minutes: input.estimated_minutes || 30,
          due_date: input.due_date || null,
          status: 'todo',
        })
        .select()
        .single()

      if (taskErr) throw taskErr

      if (taskSubtasks.length > 0) {
        const subInsert = taskSubtasks.map((s) => ({
          task_id: taskData.id,
          title: s.title,
          is_completed: false,
          position: s.position,
        }))
        const { data: subData, error: subErr } = await supabase.from('subtasks').insert(subInsert).select()
        if (subErr) throw subErr
        return { ...taskData, subtasks: subData } as Task
      }

      return { ...taskData, subtasks: [] } as Task
    } else {
      const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
      const newTask: Task = {
        id: taskId,
        user_id: userId,
        category_id: input.category_id,
        title: input.title,
        description: input.description,
        priority: input.priority || 'medium',
        estimated_minutes: input.estimated_minutes || 30,
        due_date: input.due_date,
        status: 'todo',
        subtasks: taskSubtasks.map((s) => ({ ...s, task_id: taskId })),
        created_at: now,
        updated_at: now,
      }

      const tasks = await this.fetchTasks(userId)
      tasks.unshift(newTask)
      localStorage.setItem(`${MOCK_TASKS_KEY}_${userId}`, JSON.stringify(tasks))
      return newTask
    }
  },

  // 5. Update Task
  async updateTask(userId: string, taskId: string, input: UpdateTaskInput): Promise<Task> {
    const now = new Date().toISOString()

    if (isConfiguredSupabase) {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          title: input.title,
          description: input.description,
          category_id: input.category_id,
          priority: input.priority,
          estimated_minutes: input.estimated_minutes,
          due_date: input.due_date,
          status: input.status,
          updated_at: now,
        })
        .eq('id', taskId)
        .eq('user_id', userId)
        .select('*, subtasks(*)')
        .single()

      if (error) throw error

      // Handle subtasks updates if passed
      if (input.subtasks) {
        // Clear old subtasks and insert new ones
        await supabase.from('subtasks').delete().eq('task_id', taskId)
        if (input.subtasks.length > 0) {
          const subInsert = input.subtasks.map((s, idx) => ({
            task_id: taskId,
            title: s.title,
            is_completed: s.is_completed,
            position: s.position ?? idx,
          }))
          await supabase.from('subtasks').insert(subInsert)
        }
        // Refetch complete task with subtasks
        const { data: refreshed } = await supabase
          .from('tasks')
          .select('*, subtasks(*)')
          .eq('id', taskId)
          .single()
        return refreshed as Task
      }

      return data as Task
    } else {
      const tasks = await this.fetchTasks(userId)
      const index = tasks.findIndex((t) => t.id === taskId)
      if (index === -1) throw new Error('Task not found')

      const updated: Task = {
        ...tasks[index],
        ...input,
        subtasks: input.subtasks
          ? input.subtasks.map((s, i) => ({
              id: s.id || `sub_${Date.now()}_${i}`,
              task_id: taskId,
              title: s.title,
              is_completed: s.is_completed,
              position: i,
            }))
          : tasks[index].subtasks,
        updated_at: now,
      }

      tasks[index] = updated
      localStorage.setItem(`${MOCK_TASKS_KEY}_${userId}`, JSON.stringify(tasks))
      return updated
    }
  },

  // 6. Toggle Task Completion
  async toggleTaskCompletion(userId: string, taskId: string): Promise<Task> {
    const tasks = await this.fetchTasks(userId)
    const task = tasks.find((t) => t.id === taskId)
    if (!task) throw new Error('Task not found')

    const newStatus = task.status === 'completed' ? 'todo' : 'completed'

    // Also toggle all subtasks if completing task
    const updatedSubtasks = task.subtasks.map((s) => ({
      ...s,
      is_completed: newStatus === 'completed',
    }))

    return this.updateTask(userId, taskId, {
      status: newStatus,
      subtasks: updatedSubtasks,
    })
  },

  // 7. Toggle Subtask Completion
  async toggleSubtaskCompletion(userId: string, taskId: string, subtaskId: string): Promise<Task> {
    const tasks = await this.fetchTasks(userId)
    const task = tasks.find((t) => t.id === taskId)
    if (!task) throw new Error('Task not found')

    const updatedSubtasks = task.subtasks.map((s) => (s.id === subtaskId ? { ...s, is_completed: !s.is_completed } : s))

    // If all subtasks completed, auto-complete parent task
    const allCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every((s) => s.is_completed)
    const newStatus = allCompleted ? 'completed' : task.status === 'completed' ? 'in_progress' : task.status

    return this.updateTask(userId, taskId, {
      status: newStatus,
      subtasks: updatedSubtasks,
    })
  },

  // 8. Delete / Archive Task
  async deleteTask(userId: string, taskId: string): Promise<void> {
    if (isConfiguredSupabase) {
      const { error } = await supabase.rpc('archive_task', { p_task_id: taskId })
      if (error) {
        // Fallback update if RPC not present yet
        await supabase.from('tasks').update({ status: 'archived' }).eq('id', taskId).eq('user_id', userId)
      }
    } else {
      const tasks = await this.fetchTasks(userId)
      const filtered = tasks.filter((t) => t.id !== taskId)
      localStorage.setItem(`${MOCK_TASKS_KEY}_${userId}`, JSON.stringify(filtered))
    }
  },
}
