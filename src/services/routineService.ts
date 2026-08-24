import { supabase, isConfiguredSupabase } from '@/lib/supabase'
import { RoutineTemplate, CreateRoutineTemplateInput, DailyRoutineRun } from '@/types/routine.types'
import { taskService } from './taskService'

const MOCK_ROUTINES_KEY = 'tracker_mock_routines'
const MOCK_ROUTINE_RUNS_KEY = 'tracker_mock_routine_runs'

const DEFAULT_ROUTINES = [
  {
    name: 'Morning Focus Kickoff',
    items: [
      { title: 'Hydrate & 5 min light stretch', estimated_minutes: 5 },
      { title: 'Review Must-Win 3 priorities for today', estimated_minutes: 5 },
      { title: 'Clear inbox to zero & flag urgent bills', estimated_minutes: 15 },
    ],
  },
  {
    name: 'Evening Wind-down',
    items: [
      { title: 'Log completed tasks & actual tracked time', estimated_minutes: 10 },
      { title: 'Draft tomorrow’s top 3 tasks', estimated_minutes: 5 },
    ],
  },
]

export const routineService = {
  // 1. Fetch or Seed Routine Templates
  async fetchRoutineTemplates(userId: string): Promise<RoutineTemplate[]> {
    if (isConfiguredSupabase) {
      const { data, error } = await supabase
        .from('routine_templates')
        .select('*, items:routine_template_items(*)')
        .eq('user_id', userId)
        .is('archived_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data && data.length > 0) {
        return (data || []).map((t: any) => ({
          ...t,
          items: (t.items || []).map((item: any) => ({
            ...item,
            template_id: item.routine_template_id || item.template_id,
            estimated_duration_minutes: item.estimated_minutes || item.estimated_duration_minutes,
            sort_order: item.position ?? item.sort_order,
          })),
        })) as RoutineTemplate[]
      }

      // Seed defaults if empty
      for (const def of DEFAULT_ROUTINES) {
        await this.createRoutineTemplate(userId, def)
      }
      return this.fetchRoutineTemplates(userId)
    } else {
      const raw = localStorage.getItem(`${MOCK_ROUTINES_KEY}_${userId}`)
      if (raw) return JSON.parse(raw)

      const seeded: RoutineTemplate[] = DEFAULT_ROUTINES.map((def, idx) => {
        const tId = `temp_${Date.now()}_${idx}`
        return {
          id: tId,
          user_id: userId,
          name: def.name,
          items: def.items.map((item, itemIdx) => ({
            id: `item_${tId}_${itemIdx}`,
            routine_template_id: tId,
            title: item.title,
            estimated_minutes: item.estimated_minutes,
            position: itemIdx + 1,
          })),
          created_at: new Date().toISOString(),
        }
      })
      localStorage.setItem(`${MOCK_ROUTINES_KEY}_${userId}`, JSON.stringify(seeded))
      return seeded
    }
  },

  // 2. Create Routine Template
  async createRoutineTemplate(userId: string, input: CreateRoutineTemplateInput): Promise<RoutineTemplate> {
    if (isConfiguredSupabase) {
      const { data: tmpl, error: tmplErr } = await supabase
        .from('routine_templates')
        .insert({ user_id: userId, name: input.name })
        .select()
        .single()

      if (tmplErr) throw tmplErr

      const itemsToInsert = input.items.map((item, idx) => ({
        routine_template_id: tmpl.id,
        user_id: userId,
        title: item.title,
        estimated_minutes: item.estimated_minutes || 15,
        position: idx + 1,
      }))

      const { data: itemsData, error: itemsErr } = await supabase
        .from('routine_template_items')
        .insert(itemsToInsert)
        .select()

      if (itemsErr) throw itemsErr

      return { ...tmpl, items: itemsData } as RoutineTemplate
    } else {
      const templates = await this.fetchRoutineTemplates(userId)
      const tId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
      const newTmpl: RoutineTemplate = {
        id: tId,
        user_id: userId,
        name: input.name,
        items: input.items.map((item, idx) => ({
          id: `item_${tId}_${idx}`,
          routine_template_id: tId,
          title: item.title,
          estimated_minutes: item.estimated_minutes || 15,
          position: idx + 1,
        })),
        created_at: new Date().toISOString(),
      }

      templates.unshift(newTmpl)
      localStorage.setItem(`${MOCK_ROUTINES_KEY}_${userId}`, JSON.stringify(templates))
      return newTmpl
    }
  },

  // 3. One-Click Idempotent Apply Routine Template to Date
  async applyRoutineTemplate(
    userId: string,
    templateId: string,
    targetDate: string = new Date().toISOString().split('T')[0]
  ): Promise<{ success: boolean; isDuplicate?: boolean; message: string; createdTasksCount?: number }> {
    if (isConfiguredSupabase) {
      // Attempt RPC call first
      const { data: rpcTasks, error: rpcErr } = await supabase.rpc('apply_daily_routine', {
        p_template_id: templateId,
        p_target_date: targetDate,
      })

      if (!rpcErr && rpcTasks) {
        return {
          success: true,
          message: `Successfully applied routine template for ${targetDate}.`,
          createdTasksCount: rpcTasks.length,
        }
      }

      // Check daily_routine_runs table fallback
      const { data: existingRuns, error: checkErr } = await supabase
        .from('daily_routine_runs')
        .select('id')
        .eq('user_id', userId)
        .eq('routine_template_id', templateId)
        .eq('target_date', targetDate)

      if (checkErr) throw checkErr

      if (existingRuns && existingRuns.length > 0) {
        return {
          success: false,
          isDuplicate: true,
          message: `This routine template was already applied for ${targetDate}. Duplicate application blocked.`,
        }
      }

      // Fetch template details
      const { data: tmpl, error: tmplErr } = await supabase
        .from('routine_templates')
        .select('*, items:routine_template_items(*)')
        .eq('id', templateId)
        .single()

      if (tmplErr || !tmpl) throw new Error('Routine template not found')

      // Insert tasks for targetDate
      for (const item of tmpl.items || []) {
        await taskService.createTask(userId, {
          title: item.title,
          estimated_minutes: item.estimated_minutes || item.estimated_duration_minutes,
          due_date: targetDate,
          priority: 'medium',
        })
      }

      // Record routine run
      await supabase.from('daily_routine_runs').insert({
        user_id: userId,
        routine_template_id: templateId,
        target_date: targetDate,
      })

      return {
        success: true,
        message: `Successfully applied "${tmpl.name}" for ${targetDate} (${tmpl.items?.length || 0} tasks created).`,
        createdTasksCount: tmpl.items?.length || 0,
      }
    } else {
      // Local Storage Mock Idempotency Check
      const rawRuns = localStorage.getItem(`${MOCK_ROUTINE_RUNS_KEY}_${userId}`)
      const runs: DailyRoutineRun[] = rawRuns ? JSON.parse(rawRuns) : []

      const existingRun = runs.find((r) => r.routine_template_id === templateId && r.target_date === targetDate)
      if (existingRun) {
        return {
          success: false,
          isDuplicate: true,
          message: `This routine template was already applied for ${targetDate}. Duplicate application blocked.`,
        }
      }

      const templates = await this.fetchRoutineTemplates(userId)
      const tmpl = templates.find((t) => t.id === templateId)
      if (!tmpl) throw new Error('Routine template not found')

      // Insert tasks
      for (const item of tmpl.items) {
        await taskService.createTask(userId, {
          title: item.title,
          estimated_minutes: item.estimated_minutes,
          due_date: targetDate,
          priority: 'medium',
        })
      }

      // Record run
      const newRun: DailyRoutineRun = {
        id: `run_${Date.now()}`,
        user_id: userId,
        routine_template_id: templateId,
        target_date: targetDate,
        created_at: new Date().toISOString(),
      }
      runs.push(newRun)
      localStorage.setItem(`${MOCK_ROUTINE_RUNS_KEY}_${userId}`, JSON.stringify(runs))

      return {
        success: true,
        message: `Successfully applied "${tmpl.name}" for ${targetDate} (${tmpl.items.length} tasks created).`,
        createdTasksCount: tmpl.items.length,
      }
    }
  },

  // 4. Archive / Soft-Delete Routine Template
  async deleteRoutineTemplate(userId: string, templateId: string): Promise<void> {
    if (isConfiguredSupabase) {
      const { error } = await supabase
        .from('routine_templates')
        .update({ archived_at: new Date().toISOString() })
        .eq('id', templateId)
        .eq('user_id', userId)
      if (error) throw error
    } else {
      const templates = await this.fetchRoutineTemplates(userId)
      const filtered = templates.filter((t) => t.id !== templateId)
      localStorage.setItem(`${MOCK_ROUTINES_KEY}_${userId}`, JSON.stringify(filtered))
    }
  },
}
