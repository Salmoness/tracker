import React, { useState } from 'react'
import { useTasks } from '@/context/TaskContext'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
}

export const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose }) => {
  const { createCategory } = useTasks()
  const [name, setName] = useState('')
  const [color, setColor] = useState('chlorophyll')

  const colorOptions = [
    { label: 'Chlorophyll (Green)', value: 'chlorophyll', hex: '#a0de53' },
    { label: 'Ultraviolet (Purple)', value: 'ultraviolet', hex: '#bc8fff' },
    { label: 'Solar (Orange)', value: 'solar', hex: '#ff8c53' },
    { label: 'Cyan / Aqua', value: 'cyan', hex: '#38bdf8' },
    { label: 'Rose / Danger', value: 'rose', hex: '#ff6f69' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    await createCategory(name.trim(), color)
    setName('')
    setColor('chlorophyll')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Custom Category"
      description="Add a new color-coded category tag for organizing your task pipeline."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <Input
          label="Category Name"
          placeholder="e.g. Deep Work, Fitness, Freelance..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Color Preset
          </label>
          <div className="grid grid-cols-5 gap-2">
            {colorOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setColor(opt.value)}
                className={`h-9 rounded-[var(--radius-sm)] flex items-center justify-center border transition-all cursor-pointer ${
                  color === opt.value
                    ? 'border-2 border-[var(--text-foreground)] scale-105 shadow-sm'
                    : 'border-transparent opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: opt.hex }}
                title={opt.label}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-3 border-t border-[var(--border-color)]">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit">
            Save Category
          </Button>
        </div>
      </form>
    </Modal>
  )
}
