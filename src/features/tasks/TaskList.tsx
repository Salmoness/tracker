import React, { useState } from 'react'
import { useTasks } from '@/context/TaskContext'
import { Task } from '@/types/task.types'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { TaskModal } from './TaskModal'
import { CategoryModal } from '@/features/categories/CategoryModal'
import {
  Search,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Target,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Filter,
  Check,
} from 'lucide-react'

export const TaskList: React.FC = () => {
  const {
    tasks,
    categories,
    searchQuery,
    selectedCategory,
    selectedPriorityFilter,
    setSearchQuery,
    setSelectedCategory,
    setSelectedPriorityFilter,
    toggleTaskCompletion,
    toggleSubtaskCompletion,
    deleteTask,
    setMustWinPriority,
    mustWinPriorities,
  } = useTasks()

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [expandedTaskIds, setExpandedTaskIds] = useState<string[]>([])

  const toggleExpandTask = (id: string) => {
    setExpandedTaskIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const getCategoryById = (catId?: string) => categories.find((c) => c.id === catId)
  const isPinnedToMustWin = (taskId: string) => mustWinPriorities.some((p) => p.task_id === taskId)

  // Filter Tasks
  const filteredTasks = tasks.filter((t) => {
    // Search Query
    if (searchQuery.trim() && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    // Category Filter
    if (selectedCategory && t.category_id !== selectedCategory) {
      return false
    }
    // Priority Filter
    if (selectedPriorityFilter !== 'all' && t.priority !== selectedPriorityFilter) {
      return false
    }
    return true
  })

  return (
    <div className="space-y-4">
      {/* Search & Filters Bar */}
      <div className="surface-card p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search tasks by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 surface-input pl-10 text-xs text-[var(--text-foreground)]"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCategoryModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Category
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingTask(null)
                setIsTaskModalOpen(true)
              }}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              New Task
            </Button>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[var(--border-color)]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Categories:
          </span>
          <button
            onClick={() => setSelectedCategory(null)}
            className={`text-xs px-2.5 py-1 rounded-[var(--radius-sm)] transition-all cursor-pointer ${
              selectedCategory === null
                ? 'bg-[var(--color-primary)] text-[var(--on-primary)] font-bold'
                : 'surface-card-subtle text-[var(--text-muted)] hover:text-[var(--text-foreground)]'
            }`}
          >
            All ({tasks.length})
          </button>
          {categories.map((c) => {
            const count = tasks.filter((t) => t.category_id === c.id).length
            const isSelected = selectedCategory === c.id
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(isSelected ? null : c.id)}
                className={`text-xs px-2.5 py-1 rounded-[var(--radius-sm)] transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--color-primary)] text-[var(--on-primary)] font-bold shadow-sm'
                    : 'surface-card-subtle text-[var(--text-muted)] hover:text-[var(--text-foreground)]'
                }`}
              >
                ● {c.name} ({count})
              </button>
            )
          })}
        </div>

        {/* Priority Filter Bar */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mr-1">
            Priority:
          </span>
          {(['all', 'urgent', 'high', 'medium', 'low'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPriorityFilter(p)}
              className={`px-2 py-0.5 rounded-[var(--radius-sm)] capitalize font-semibold transition-all cursor-pointer ${
                selectedPriorityFilter === p
                  ? 'bg-[var(--bg-surface-2)] text-[var(--color-primary)] border border-[var(--primary-border)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-foreground)]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Task Rows List */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="surface-card p-8 text-center space-y-2">
            <p className="text-sm font-semibold text-[var(--text-muted)]">No tasks found matching filters.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingTask(null)
                setIsTaskModalOpen(true)
              }}
            >
              Create Your First Task
            </Button>
          </div>
        ) : (
          filteredTasks.map((t) => {
            const category = getCategoryById(t.category_id)
            const isCompleted = t.status === 'completed'
            const isExpanded = expandedTaskIds.includes(t.id)
            const isPinned = isPinnedToMustWin(t.id)
            const subtaskCount = t.subtasks?.length || 0
            const completedSubtaskCount = t.subtasks?.filter((s) => s.is_completed).length || 0

            return (
              <div
                key={t.id}
                className={`surface-card p-4 transition-all space-y-3 ${
                  isCompleted ? 'opacity-70 bg-[var(--bg-surface-2)]/50' : 'hover:border-[var(--border-strong)]'
                }`}
              >
                {/* Main Task Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <button
                      onClick={() => toggleTaskCompletion(t.id)}
                      className="mt-0.5 shrink-0 text-[var(--text-muted)] hover:text-[var(--color-success)] transition-colors cursor-pointer"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-[var(--color-success)]" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p
                          className={`text-sm font-semibold text-[var(--text-foreground)] leading-snug ${
                            isCompleted ? 'line-through text-[var(--text-muted)]' : ''
                          }`}
                        >
                          {t.title}
                        </p>
                        {category && <Badge variant="neutral">● {category.name}</Badge>}
                        <Badge
                          variant={
                            t.priority === 'urgent'
                              ? 'danger'
                              : t.priority === 'high'
                              ? 'warning'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {t.priority}
                        </Badge>
                      </div>

                      {t.description && (
                        <p className="text-xs text-[var(--text-muted)] line-clamp-2">{t.description}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-[var(--text-muted)] pt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {t.estimated_minutes}m
                        </span>
                        {t.due_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {t.due_date}
                          </span>
                        )}
                        {subtaskCount > 0 && (
                          <button
                            onClick={() => toggleExpandTask(t.id)}
                            className="flex items-center gap-1 text-[var(--color-primary)] font-semibold hover:underline cursor-pointer"
                          >
                            Checklist ({completedSubtaskCount}/{subtaskCount})
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => {
                        if (!isPinned && mustWinPriorities.length < 3) {
                          setMustWinPriority(t.id, mustWinPriorities.length + 1)
                        }
                      }}
                      disabled={isPinned || mustWinPriorities.length >= 3}
                      className={`p-1.5 rounded-[var(--radius-sm)] transition-colors ${
                        isPinned
                          ? 'text-[var(--color-primary)] bg-[var(--primary-subtle)]'
                          : 'text-[var(--text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--bg-surface-2)] disabled:opacity-30'
                      }`}
                      title={isPinned ? 'Pinned to Must-Win 3' : 'Pin to Must-Win 3'}
                    >
                      <Target className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setEditingTask(t)
                        setIsTaskModalOpen(true)
                      }}
                      className="p-1.5 rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:text-[var(--text-foreground)] hover:bg-[var(--bg-surface-2)] transition-colors"
                      title="Edit Task"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => deleteTask(t.id)}
                      className="p-1.5 rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--bg-surface-2)] transition-colors"
                      title="Archive Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Subtasks Accordion */}
                {isExpanded && subtaskCount > 0 && (
                  <div className="pt-2 border-t border-[var(--border-color)] space-y-1.5 pl-8">
                    {t.subtasks.map((sub) => (
                      <div
                        key={sub.id}
                        onClick={() => toggleSubtaskCompletion(t.id, sub.id)}
                        className="flex items-center space-x-2 text-xs text-[var(--text-foreground)] cursor-pointer py-1 px-2 rounded-[var(--radius-sm)] hover:bg-[var(--bg-surface-2)]"
                      >
                        <span className="text-[var(--text-muted)]">
                          {sub.is_completed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-success)]" />
                          ) : (
                            <Circle className="w-3.5 h-3.5" />
                          )}
                        </span>
                        <span className={sub.is_completed ? 'line-through text-[var(--text-muted)]' : ''}>
                          {sub.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Task & Category Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        taskToEdit={editingTask}
      />
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
    </div>
  )
}
