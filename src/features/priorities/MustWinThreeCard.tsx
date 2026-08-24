import React, { useState } from 'react'
import { useTasks } from '@/context/TaskContext'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Target, CheckCircle2, Circle, X, Plus, Sparkles, Check } from 'lucide-react'

export const MustWinThreeCard: React.FC = () => {
  const {
    tasks,
    categories,
    mustWinPriorities,
    toggleTaskCompletion,
    setMustWinPriority,
    removeMustWinPriority,
  } = useTasks()

  const [activeAssignSlot, setActiveAssignSlot] = useState<number | null>(null)

  // Map 3 slot numbers (1, 2, 3)
  const slots = [1, 2, 3]

  const getPriorityForSlot = (slotNumber: number) => {
    return mustWinPriorities.find((p) => p.position === slotNumber)
  }

  const getTaskById = (taskId: string) => {
    return tasks.find((t) => t.id === taskId)
  }

  const getCategoryById = (catId?: string) => {
    return categories.find((c) => c.id === catId)
  }

  // Eligible unassigned tasks for priority assignment
  const assignedTaskIds = mustWinPriorities.map((p) => p.task_id)
  const eligibleTasks = tasks.filter((t) => !assignedTaskIds.includes(t.id) && t.status !== 'archived')

  return (
    <>
      <Card variant="signal" className="relative overflow-hidden">
        <CardHeader className="border-b border-[var(--border-color)] pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--primary-subtle)] border border-[var(--primary-border)] flex items-center justify-center text-[var(--color-primary)]">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base">Must-Win 3 Priorities</CardTitle>
              <CardDescription>
                Constrained daily focus. Complete these top 3 targets today.
              </CardDescription>
            </div>
          </div>
          <Badge variant="primary" dot>
            {mustWinPriorities.length} / 3 Assigned
          </Badge>
        </CardHeader>

        {/* 3 Slots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {slots.map((slotNum) => {
            const prio = getPriorityForSlot(slotNum)
            const task = prio ? getTaskById(prio.task_id) : null
            const category = task ? getCategoryById(task.category_id) : null
            const isCompleted = task?.status === 'completed'

            return (
              <div
                key={slotNum}
                className={`p-3.5 rounded-[var(--radius-md)] surface-card-subtle transition-all relative flex flex-col justify-between min-h-[110px] ${
                  isCompleted ? 'opacity-80 border-l-4 border-l-[var(--color-success)]' : ''
                } ${task && !isCompleted ? 'border-l-4 border-l-[var(--color-primary)]' : ''}`}
              >
                {/* Slot Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-[var(--bg-surface-1)] flex items-center justify-center text-[10px] text-[var(--color-primary)] font-mono">
                      #{slotNum}
                    </span>
                    Slot {slotNum}
                  </span>

                  {task && (
                    <button
                      onClick={() => removeMustWinPriority(task.id)}
                      className="text-[var(--text-muted)] hover:text-[var(--color-danger)] p-1 transition-colors"
                      title="Unpin priority slot (auto-compacts remaining)"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Slot Content */}
                {task ? (
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <button
                        onClick={() => toggleTaskCompletion(task.id)}
                        className="mt-0.5 shrink-0 text-[var(--text-muted)] hover:text-[var(--color-success)] transition-colors cursor-pointer"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>
                      <p
                        className={`text-xs font-semibold text-[var(--text-foreground)] line-clamp-2 leading-snug ${
                          isCompleted ? 'line-through text-[var(--text-muted)]' : ''
                        }`}
                      >
                        {task.title}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      {category ? (
                        <span className="text-[var(--text-muted)] font-medium">● {category.name}</span>
                      ) : (
                        <span className="text-[var(--text-muted)]">{task.estimated_minutes}m</span>
                      )}
                      <Badge
                        variant={
                          task.priority === 'urgent'
                            ? 'danger'
                            : task.priority === 'high'
                            ? 'warning'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-2 space-y-1.5">
                    <button
                      onClick={() => setActiveAssignSlot(slotNum)}
                      className="w-full py-2.5 px-3 rounded-[var(--radius-sm)] border border-dashed border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] hover:bg-[var(--primary-subtle)] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Set Priority #{slotNum}</span>
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Priority Assign Picker Modal */}
      <Modal
        isOpen={activeAssignSlot !== null}
        onClose={() => setActiveAssignSlot(null)}
        title={`Assign Must-Win Priority #${activeAssignSlot}`}
        description="Select a task from your active list to pin to this priority slot."
      >
        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
          {eligibleTasks.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] py-4 text-center">
              No unassigned tasks found. Create a new task first!
            </p>
          ) : (
            eligibleTasks.map((t) => {
              const cat = getCategoryById(t.category_id)
              return (
                <div
                  key={t.id}
                  onClick={() => {
                    if (activeAssignSlot) {
                      setMustWinPriority(t.id, activeAssignSlot)
                      setActiveAssignSlot(null)
                    }
                  }}
                  className="p-3 surface-card-subtle hover:border-[var(--color-primary)] rounded-[var(--radius-md)] cursor-pointer flex items-center justify-between transition-all"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-[var(--text-foreground)]">{t.title}</p>
                    {cat && <span className="text-[10px] text-[var(--text-muted)]">● {cat.name}</span>}
                  </div>
                  <Badge variant={t.priority === 'urgent' ? 'danger' : 'neutral'} size="sm">
                    {t.priority}
                  </Badge>
                </div>
              )
            })
          )}
        </div>
      </Modal>
    </>
  )
}
