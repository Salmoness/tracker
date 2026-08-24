import React, { useState } from 'react'
import { useTasks } from '@/context/TaskContext'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Zap, Plus, Trash2, CheckCircle2, Play } from 'lucide-react'

export const RoutineBar: React.FC = () => {
  const { routineTemplates, applyRoutineTemplate, createRoutineTemplate, deleteRoutineTemplate } = useTasks()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [templateDesc, setTemplateDesc] = useState('')
  const [items, setItems] = useState<{ title: string; duration: number }[]>([
    { title: '', duration: 15 },
  ])

  const handleAddItem = () => {
    setItems((prev) => [...prev, { title: '', duration: 15 }])
  }

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!templateName.trim()) return

    const validItems = items.filter((i) => i.title.trim().length > 0)
    if (validItems.length === 0) return

    await createRoutineTemplate({
      name: templateName.trim(),
      items: validItems.map((i) => ({ title: i.title.trim(), estimated_minutes: i.duration })),
    })

    setTemplateName('')
    setItems([{ title: '', duration: 15 }])
    setIsModalOpen(false)
  }

  return (
    <>
      <div className="surface-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--primary-subtle)] border border-[var(--primary-border)] flex items-center justify-center text-[var(--color-primary)] shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold font-display uppercase tracking-wider text-[var(--text-foreground)]">
              Daily Routine Templates
            </h4>
            <p className="text-[10px] text-[var(--text-muted)]">
              1-click insert morning, workday, or evening checklists into today’s schedule.
            </p>
          </div>
        </div>

        {/* Templates List & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {routineTemplates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="group flex items-center space-x-2 px-3 py-1.5 rounded-[var(--radius-sm)] surface-card-subtle border border-[var(--border-color)] hover:border-[var(--color-primary)] transition-all"
            >
              <button
                onClick={() => applyRoutineTemplate(tmpl.id)}
                className="flex items-center space-x-1.5 text-xs font-semibold text-[var(--text-foreground)] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                title={`Apply 1-click routine: ${tmpl.name}`}
              >
                <Play className="w-3 h-3 text-[var(--color-primary)] fill-current" />
                <span>{tmpl.name}</span>
                <span className="text-[10px] text-[var(--text-muted)] font-normal">({tmpl.items.length})</span>
              </button>

              <button
                onClick={() => deleteRoutineTemplate(tmpl.id)}
                className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--color-danger)] p-0.5 transition-opacity"
                title="Delete template"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            New Template
          </Button>
        </div>
      </div>

      {/* Routine Template Builder Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Daily Routine Template"
        description="Build a reusable morning, workday, or evening checklist for 1-click insertion."
      >
        <form onSubmit={handleSaveTemplate} className="space-y-4 pt-2">
          <Input
            label="Template Name"
            placeholder="e.g. Workday Start Routine"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            required
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Checklist Items
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs text-[var(--color-primary)] hover:underline font-semibold"
              >
                + Add Item
              </button>
            </div>

            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[var(--text-muted)] w-4">#{idx + 1}</span>
                  <input
                    type="text"
                    placeholder="Item title..."
                    value={item.title}
                    onChange={(e) => {
                      const copy = [...items]
                      copy[idx].title = e.target.value
                      setItems(copy)
                    }}
                    className="flex-1 h-9 surface-input text-xs px-3"
                    required
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Min"
                    value={item.duration}
                    onChange={(e) => {
                      const copy = [...items]
                      copy[idx].duration = parseInt(e.target.value) || 15
                      setItems(copy)
                    }}
                    className="w-16 h-9 surface-input text-xs px-2 text-center"
                  />
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1 text-[var(--text-muted)] hover:text-[var(--color-danger)]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-[var(--border-color)]">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Template
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
