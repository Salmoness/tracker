import React, { useState, useEffect } from 'react'
import { useTasks } from '@/context/TaskContext'
import { Task, PriorityLevel } from '@/types/task.types'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Plus, Trash2, Clock, Calendar, Tag, AlertTriangle } from 'lucide-react'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  taskToEdit?: Task | null
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, taskToEdit }) => {
  const { categories, createTask, updateTask } = useTasks()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [priority, setPriority] = useState<PriorityLevel>('medium')
  const [duration, setDuration] = useState<number>(30)
  const [dueDate, setDueDate] = useState<string>('')
  const [subtasks, setSubtasks] = useState<{ id?: string; title: string; is_completed: boolean }[]>([])

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title)
      setDescription(taskToEdit.description || '')
      setCategoryId(taskToEdit.category_id || '')
      setPriority(taskToEdit.priority)
      setDuration(taskToEdit.estimated_minutes)
      setDueDate(taskToEdit.due_date || '')
      setSubtasks(taskToEdit.subtasks || [])
    } else {
      setTitle('')
      setDescription('')
      setCategoryId(categories.length > 0 ? categories[0].id : '')
      setPriority('medium')
      setDuration(30)
      setDueDate(new Date().toISOString().split('T')[0])
      setSubtasks([])
    }
  }, [taskToEdit, categories, isOpen])

  const handleAddSubtask = () => {
    setSubtasks((prev) => [...prev, { title: '', is_completed: false }])
  }

  const handleRemoveSubtask = (index: number) => {
    setSubtasks((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const validSubtasks = subtasks.filter((s) => s.title.trim().length > 0)

    if (taskToEdit) {
      await updateTask(taskToEdit.id, {
        title: title.trim(),
        description: description.trim(),
        category_id: categoryId || undefined,
        priority,
        estimated_minutes: duration,
        due_date: dueDate || undefined,
        subtasks: validSubtasks,
      })
    } else {
      await createTask({
        title: title.trim(),
        description: description.trim(),
        category_id: categoryId || undefined,
        priority,
        estimated_minutes: duration,
        due_date: dueDate || undefined,
        subtasks: validSubtasks.map((s) => s.title.trim()),
      })
    }

    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={taskToEdit ? 'Edit Task' : 'Create New Task'}
      description="Add task details, priority level, duration, and subtask checklist."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <Input
          label="Task Title"
          placeholder="e.g. Draft quarterly financial roadmap..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Category Picker */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full h-11 surface-input text-xs px-3 text-[var(--text-foreground)]"
            >
              <option value="">No Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Level */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityLevel)}
              className="w-full h-11 surface-input text-xs px-3 text-[var(--text-foreground)]"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Estimated Duration */}
          <Input
            label="Estimated Minutes"
            type="number"
            min="5"
            step="5"
            leftIcon={<Clock className="w-4 h-4" />}
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value) || 15)}
            required
          />

          {/* Due Date */}
          <Input
            label="Due Date"
            type="date"
            leftIcon={<Calendar className="w-4 h-4" />}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        {/* Subtask Checklist */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Subtasks Checklist
            </label>
            <button
              type="button"
              onClick={handleAddSubtask}
              className="text-xs text-[var(--color-primary)] hover:underline font-semibold"
            >
              + Add Subtask
            </button>
          </div>

          <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
            {subtasks.map((sub, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={sub.is_completed}
                  onChange={(e) => {
                    const copy = [...subtasks]
                    copy[idx].is_completed = e.target.checked
                    setSubtasks(copy)
                  }}
                  className="w-4 h-4 rounded text-[var(--color-primary)] focus:ring-0 cursor-pointer"
                />
                <input
                  type="text"
                  placeholder={`Subtask #${idx + 1}...`}
                  value={sub.title}
                  onChange={(e) => {
                    const copy = [...subtasks]
                    copy[idx].title = e.target.value
                    setSubtasks(copy)
                  }}
                  className="flex-1 h-9 surface-input text-xs px-3"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveSubtask(idx)}
                  className="p-1 text-[var(--text-muted)] hover:text-[var(--color-danger)]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-3 border-t border-[var(--border-color)]">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit">
            {taskToEdit ? 'Update Task' : 'Save Task'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
