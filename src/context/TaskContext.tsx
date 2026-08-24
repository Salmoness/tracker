import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Task, Category, CreateTaskInput, UpdateTaskInput, PriorityLevel } from '@/types/task.types'
import { RoutineTemplate, CreateRoutineTemplateInput } from '@/types/routine.types'
import { DailyPriority } from '@/types/priority.types'
import { taskService } from '@/services/taskService'
import { routineService } from '@/services/routineService'
import { priorityService } from '@/services/priorityService'

interface ToastNotification {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  message: string
}

interface TaskContextType {
  tasks: Task[]
  categories: Category[]
  routineTemplates: RoutineTemplate[]
  mustWinPriorities: DailyPriority[]
  selectedDate: string
  loading: boolean
  searchQuery: string
  selectedCategory: string | null
  selectedPriorityFilter: PriorityLevel | 'all'

  setSearchQuery: (q: string) => void
  setSelectedCategory: (catId: string | null) => void
  setSelectedPriorityFilter: (p: PriorityLevel | 'all') => void
  setSelectedDate: (date: string) => void

  // Task Actions
  createTask: (input: CreateTaskInput) => Promise<void>
  updateTask: (taskId: string, input: UpdateTaskInput) => Promise<void>
  toggleTaskCompletion: (taskId: string) => Promise<void>
  toggleSubtaskCompletion: (taskId: string, subtaskId: string) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>

  // Category Actions
  createCategory: (name: string, color: string, icon?: string) => Promise<void>

  // Routine Actions
  createRoutineTemplate: (input: CreateRoutineTemplateInput) => Promise<void>
  applyRoutineTemplate: (templateId: string) => Promise<void>
  deleteRoutineTemplate: (templateId: string) => Promise<void>

  // Must-Win 3 Actions
  setMustWinPriority: (taskId: string, slotNumber: number) => Promise<void>
  removeMustWinPriority: (taskId: string) => Promise<void>

  toasts: ToastNotification[]
  removeToast: (id: string) => void
  addToast: (type: ToastNotification['type'], message: string) => void
  refreshData: () => Promise<void>
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const userId = user?.id || 'demo_user'

  const [tasks, setTasks] = useState<Task[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [routineTemplates, setRoutineTemplates] = useState<RoutineTemplate[]>([])
  const [mustWinPriorities, setMustWinPriorities] = useState<DailyPriority[]>([])
  
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<PriorityLevel | 'all'>('all')

  const [toasts, setToasts] = useState<ToastNotification[]>([])

  const addToast = useCallback((type: ToastNotification['type'], message: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const refreshData = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const [fetchedCats, fetchedTasks, fetchedRoutines, fetchedPriorities] = await Promise.all([
        taskService.fetchCategories(userId),
        taskService.fetchTasks(userId),
        routineService.fetchRoutineTemplates(userId),
        priorityService.fetchDailyPriorities(userId, selectedDate),
      ])

      setCategories(fetchedCats)
      setTasks(fetchedTasks)
      setRoutineTemplates(fetchedRoutines)
      setMustWinPriorities(fetchedPriorities)
    } catch (err: any) {
      console.error('Error refreshing task data:', err)
      addToast('error', err.message || 'Failed to load task data.')
    } finally {
      setLoading(false)
    }
  }, [userId, selectedDate, addToast])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  // --- Task Handlers ---
  const createTask = async (input: CreateTaskInput) => {
    try {
      const created = await taskService.createTask(userId, input)
      setTasks((prev) => [created, ...prev])
      addToast('success', `Task "${created.title}" created successfully.`)
    } catch (err: any) {
      addToast('error', err.message || 'Failed to create task.')
    }
  }

  const updateTask = async (taskId: string, input: UpdateTaskInput) => {
    try {
      const updated = await taskService.updateTask(userId, taskId, input)
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)))
      addToast('info', 'Task updated.')
    } catch (err: any) {
      addToast('error', err.message || 'Failed to update task.')
    }
  }

  const toggleTaskCompletion = async (taskId: string) => {
    try {
      const updated = await taskService.toggleTaskCompletion(userId, taskId)
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)))
      const msg = updated.status === 'completed' ? `Completed "${updated.title}"!` : `Reopened "${updated.title}".`
      addToast(updated.status === 'completed' ? 'success' : 'info', msg)
    } catch (err: any) {
      addToast('error', err.message || 'Failed to toggle completion.')
    }
  }

  const toggleSubtaskCompletion = async (taskId: string, subtaskId: string) => {
    try {
      const updated = await taskService.toggleSubtaskCompletion(userId, taskId, subtaskId)
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)))
    } catch (err: any) {
      addToast('error', err.message || 'Failed to toggle subtask.')
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      await taskService.deleteTask(userId, taskId)
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
      // Also remove from priorities if present
      await removeMustWinPriority(taskId)
      addToast('info', 'Task archived.')
    } catch (err: any) {
      addToast('error', err.message || 'Failed to delete task.')
    }
  }

  // --- Category Handlers ---
  const createCategory = async (name: string, color: string, icon?: string) => {
    try {
      const created = await taskService.createCategory(userId, name, color, icon)
      setCategories((prev) => [...prev, created])
      addToast('success', `Category "${name}" created.`)
    } catch (err: any) {
      addToast('error', err.message || 'Failed to create category.')
    }
  }

  // --- Routine Handlers ---
  const createRoutineTemplate = async (input: CreateRoutineTemplateInput) => {
    try {
      const created = await routineService.createRoutineTemplate(userId, input)
      setRoutineTemplates((prev) => [created, ...prev])
      addToast('success', `Routine template "${created.name}" created!`)
    } catch (err: any) {
      addToast('error', err.message || 'Failed to create routine template.')
    }
  }

  const applyRoutineTemplate = async (templateId: string) => {
    try {
      const res = await routineService.applyRoutineTemplate(userId, templateId, selectedDate)
      if (!res.success) {
        addToast('warning', res.message)
        return
      }
      addToast('success', res.message)
      await refreshData()
    } catch (err: any) {
      addToast('error', err.message || 'Failed to apply routine template.')
    }
  }

  const deleteRoutineTemplate = async (templateId: string) => {
    try {
      await routineService.deleteRoutineTemplate(userId, templateId)
      setRoutineTemplates((prev) => prev.filter((t) => t.id !== templateId))
      addToast('info', 'Routine template deleted.')
    } catch (err: any) {
      addToast('error', err.message || 'Failed to delete routine template.')
    }
  }

  // --- Must-Win 3 Handlers ---
  const setMustWinPriority = async (taskId: string, slotNumber: number) => {
    try {
      const updated = await priorityService.setDailyPriority(userId, taskId, slotNumber, selectedDate)
      setMustWinPriorities(updated)
      addToast('success', `Assigned task to Must-Win priority slot #${slotNumber}!`)
    } catch (err: any) {
      addToast('error', err.message || 'Failed to assign priority slot.')
    }
  }

  const removeMustWinPriority = async (taskId: string) => {
    try {
      const updated = await priorityService.removeDailyPriority(userId, taskId, selectedDate)
      setMustWinPriorities(updated)
    } catch (err: any) {
      addToast('error', err.message || 'Failed to remove priority slot.')
    }
  }

  return (
    <TaskContext.Provider
      value={{
        tasks,
        categories,
        routineTemplates,
        mustWinPriorities,
        selectedDate,
        loading,
        searchQuery,
        selectedCategory,
        selectedPriorityFilter,
        setSearchQuery,
        setSelectedCategory,
        setSelectedPriorityFilter,
        setSelectedDate,
        createTask,
        updateTask,
        toggleTaskCompletion,
        toggleSubtaskCompletion,
        deleteTask,
        createCategory,
        createRoutineTemplate,
        applyRoutineTemplate,
        deleteRoutineTemplate,
        setMustWinPriority,
        removeMustWinPriority,
        toasts,
        removeToast,
        addToast,
        refreshData,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export const useTasks = () => {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider')
  }
  return context
}
