import { supabase, isConfiguredSupabase } from '@/lib/supabase'
import { DailyPriority } from '@/types/priority.types'

const MOCK_PRIORITIES_KEY = 'tracker_mock_priorities'

export const priorityService = {
  // 1. Fetch Daily Priorities for Target Date (Default today)
  async fetchDailyPriorities(
    userId: string,
    targetDate: string = new Date().toISOString().split('T')[0]
  ): Promise<DailyPriority[]> {
    if (isConfiguredSupabase) {
      const { data, error } = await supabase
        .from('daily_priorities')
        .select('*')
        .eq('user_id', userId)
        .eq('priority_date', targetDate)
        .order('position', { ascending: true })

      if (error) throw error
      return (data || []).map((p: any) => ({
        ...p,
        priority_date: p.priority_date || p.target_date,
        position: p.position ?? p.slot_number,
      })) as DailyPriority[]
    } else {
      const raw = localStorage.getItem(`${MOCK_PRIORITIES_KEY}_${userId}`)
      if (!raw) return []
      const priorities: DailyPriority[] = JSON.parse(raw)
      return priorities
        .filter((p) => p.priority_date === targetDate)
        .sort((a, b) => a.position - b.position)
    }
  },

  // 2. Set Task as Daily Priority (Slot 1, 2, or 3)
  async setDailyPriority(
    userId: string,
    taskId: string,
    slotNumber: number,
    targetDate: string = new Date().toISOString().split('T')[0]
  ): Promise<DailyPriority[]> {
    if (slotNumber < 1 || slotNumber > 3) {
      throw new Error('Must-Win priorities are limited to slots 1, 2, and 3 only.')
    }

    if (isConfiguredSupabase) {
      // Try RPC set_daily_priority first
      const { data: rpcData, error: rpcErr } = await supabase.rpc('set_daily_priority', {
        p_task_id: taskId,
        p_priority_date: targetDate,
        p_position: slotNumber,
      })

      if (!rpcErr && rpcData) {
        return rpcData as DailyPriority[]
      }

      // Fallback query
      const currentPriorities = await this.fetchDailyPriorities(userId, targetDate)
      const filtered = currentPriorities.filter((p) => p.task_id !== taskId && p.position !== slotNumber)

      const newEntry = {
        user_id: userId,
        priority_date: targetDate,
        task_id: taskId,
        position: slotNumber,
      }

      await supabase.from('daily_priorities').delete().eq('user_id', userId).eq('priority_date', targetDate)
      const toInsert = [...filtered.map((p) => ({ user_id: userId, priority_date: targetDate, task_id: p.task_id, position: p.position })), newEntry]
      const { data, error } = await supabase.from('daily_priorities').insert(toInsert).select()
      if (error) throw error
      return data as DailyPriority[]
    } else {
      const currentPriorities = await this.fetchDailyPriorities(userId, targetDate)

      const existingIndex = currentPriorities.findIndex((p) => p.task_id === taskId)
      if (existingIndex !== -1) {
        currentPriorities.splice(existingIndex, 1)
      }

      const targetSlotIndex = currentPriorities.findIndex((p) => p.position === slotNumber)
      const newEntry: DailyPriority = {
        id: `prio_${Date.now()}_${slotNumber}`,
        user_id: userId,
        priority_date: targetDate,
        task_id: taskId,
        position: slotNumber,
        created_at: new Date().toISOString(),
      }

      if (targetSlotIndex !== -1) {
        currentPriorities[targetSlotIndex] = newEntry
      } else {
        currentPriorities.push(newEntry)
      }

      currentPriorities.sort((a, b) => a.position - b.position)

      const allPrioritiesRaw = localStorage.getItem(`${MOCK_PRIORITIES_KEY}_${userId}`)
      let allPriorities: DailyPriority[] = allPrioritiesRaw ? JSON.parse(allPrioritiesRaw) : []
      allPriorities = allPriorities.filter((p) => p.priority_date !== targetDate)

      const compacted = currentPriorities.map((p, idx) => ({
        ...p,
        position: idx + 1,
      }))

      allPriorities.push(...compacted)
      localStorage.setItem(`${MOCK_PRIORITIES_KEY}_${userId}`, JSON.stringify(allPriorities))
      return compacted
    }
  },

  // 3. Remove Task from Daily Priorities (With Automatic Slot Compaction)
  async removeDailyPriority(
    userId: string,
    taskId: string,
    targetDate: string = new Date().toISOString().split('T')[0]
  ): Promise<DailyPriority[]> {
    if (isConfiguredSupabase) {
      // Try RPC remove_daily_priority
      const { data: rpcData, error: rpcErr } = await supabase.rpc('remove_daily_priority', {
        p_task_id: taskId,
        p_priority_date: targetDate,
      })

      if (!rpcErr) {
        return (rpcData || []) as DailyPriority[]
      }

      const currentPriorities = await this.fetchDailyPriorities(userId, targetDate)
      const remaining = currentPriorities.filter((p) => p.task_id !== taskId)
      const compacted = remaining.map((p, idx) => ({ ...p, position: idx + 1 }))

      await supabase.from('daily_priorities').delete().eq('user_id', userId).eq('priority_date', targetDate)
      if (compacted.length > 0) {
        const toInsert = compacted.map((p) => ({
          user_id: userId,
          priority_date: targetDate,
          task_id: p.task_id,
          position: p.position,
        }))
        const { data, error } = await supabase.from('daily_priorities').insert(toInsert).select()
        if (error) throw error
        return data as DailyPriority[]
      }
      return []
    } else {
      const currentPriorities = await this.fetchDailyPriorities(userId, targetDate)
      const remaining = currentPriorities.filter((p) => p.task_id !== taskId)

      const compacted = remaining.map((p, idx) => ({
        ...p,
        position: idx + 1,
      }))

      const allPrioritiesRaw = localStorage.getItem(`${MOCK_PRIORITIES_KEY}_${userId}`)
      let allPriorities: DailyPriority[] = allPrioritiesRaw ? JSON.parse(allPrioritiesRaw) : []
      allPriorities = allPriorities.filter((p) => p.priority_date !== targetDate)
      allPriorities.push(...compacted)
      localStorage.setItem(`${MOCK_PRIORITIES_KEY}_${userId}`, JSON.stringify(allPriorities))
      return compacted
    }
  },
}
