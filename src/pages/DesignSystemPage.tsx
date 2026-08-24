import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { AppearanceSelector } from '@/components/ui/AppearanceSelector'
import { useAppearance } from '@/context/AppearanceContext'
import {
  Palette,
  Sparkles,
  Zap,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  DollarSign,
  ShieldCheck,
  Ban,
  Layers,
} from 'lucide-react'

export const DesignSystemPage: React.FC = () => {
  const { mode, resolvedTheme, accent } = useAppearance()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sampleInput, setSampleInput] = useState('')

  return (
    <div className="min-h-screen bg-[var(--bg-background)] text-[var(--text-foreground)] p-6 md:p-12 space-y-12 transition-colors duration-200">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[var(--border-color)] pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-[var(--radius-sm)] bg-[var(--primary-subtle)] border border-[var(--primary-border)] text-[var(--color-primary)] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Phase 1.5 Specification Matrix</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold font-display text-[var(--text-foreground)] tracking-tight">
            Tracker Visual System Specification
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Biotech-Neofuturist Instrument design ruleset, OKLCH tokens, tabular typography, and component recipes.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link to="/dashboard">
            <Button variant="outline" size="sm">
              Back to Dashboard
            </Button>
          </Link>
          <Link to="/">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Landing Page
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section 1: Appearance & Theme Selector */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2 text-[var(--text-foreground)] font-bold font-display text-xl">
            <Palette className="w-5 h-5 text-[var(--color-primary)]" />
            <h2>1. Live Theme & Accent Preset Selector</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <AppearanceSelector />
            </div>

            <div className="md:col-span-2 surface-card p-6 space-y-4">
              <div className="text-xs uppercase font-bold text-[var(--text-muted)]">Active Context Diagnostics</div>
              <div className="grid grid-cols-3 gap-4 text-xs font-mono">
                <div className="surface-card-subtle p-3 space-y-1">
                  <span className="text-[var(--text-muted)] block text-[10px]">Mode Preference</span>
                  <span className="font-bold text-[var(--color-primary)] uppercase">{mode}</span>
                </div>
                <div className="surface-card-subtle p-3 space-y-1">
                  <span className="text-[var(--text-muted)] block text-[10px]">Resolved Theme</span>
                  <span className="font-bold text-[var(--color-primary)] uppercase">{resolvedTheme}</span>
                </div>
                <div className="surface-card-subtle p-3 space-y-1">
                  <span className="text-[var(--text-muted)] block text-[10px]">Active Accent</span>
                  <span className="font-bold text-[var(--color-primary)] uppercase">{accent}</span>
                </div>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Theme attribute <code className="text-[var(--color-primary)]">data-theme="{resolvedTheme}"</code> and accent attribute <code className="text-[var(--color-primary)]">data-accent="{accent}"</code> are dynamically bound to root document element.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: OKLCH Token Swatches & Contrast Pairing */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2 text-[var(--text-foreground)] font-bold font-display text-xl">
            <Layers className="w-5 h-5 text-[var(--color-primary)]" />
            <h2>2. OKLCH Token Layer & Semantic Swatches</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            <div className="surface-card p-4 space-y-2">
              <div className="h-10 rounded-[var(--radius-sm)] bg-[var(--color-primary)] border border-[var(--primary-border)]" />
              <div className="text-xs font-bold text-[var(--text-foreground)]">Primary Accent</div>
              <div className="text-[10px] text-[var(--text-muted)] font-mono">oklch token</div>
            </div>

            <div className="surface-card p-4 space-y-2">
              <div className="h-10 rounded-[var(--radius-sm)] bg-[var(--bg-surface-1)] border border-[var(--border-color)]" />
              <div className="text-xs font-bold text-[var(--text-foreground)]">Surface 1</div>
              <div className="text-[10px] text-[var(--text-muted)] font-mono">oklch token</div>
            </div>

            <div className="surface-card p-4 space-y-2">
              <div className="h-10 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--border-color)]" />
              <div className="text-xs font-bold text-[var(--text-foreground)]">Surface 2</div>
              <div className="text-[10px] text-[var(--text-muted)] font-mono">oklch token</div>
            </div>

            <div className="surface-card p-4 space-y-2">
              <div className="h-10 rounded-[var(--radius-sm)] bg-[var(--color-success)]" />
              <div className="text-xs font-bold text-[var(--text-foreground)]">Success / Paid</div>
              <div className="text-[10px] text-[var(--text-muted)] font-mono">oklch token</div>
            </div>

            <div className="surface-card p-4 space-y-2">
              <div className="h-10 rounded-[var(--radius-sm)] bg-[var(--color-warning)]" />
              <div className="text-xs font-bold text-[var(--text-foreground)]">Warning / Due</div>
              <div className="text-[10px] text-[var(--text-muted)] font-mono">oklch token</div>
            </div>

            <div className="surface-card p-4 space-y-2">
              <div className="h-10 rounded-[var(--radius-sm)] bg-[var(--color-danger)]" />
              <div className="text-xs font-bold text-[var(--text-foreground)]">Danger / Overdue</div>
              <div className="text-[10px] text-[var(--text-muted)] font-mono">oklch token</div>
            </div>
          </div>
        </section>

        {/* Section 3: Typography & Tabular Numerals */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2 text-[var(--text-foreground)] font-bold font-display text-xl">
            <Zap className="w-5 h-5 text-[var(--color-primary)]" />
            <h2>3. Typography & Tabular Numerals</h2>
          </div>

          <Card variant="surface-1" className="space-y-6">
            <div className="space-y-2 border-b border-[var(--border-color)] pb-4">
              <span className="text-xs uppercase font-bold text-[var(--text-muted)]">Display Font (Syne)</span>
              <h2 className="text-3xl font-bold font-display tracking-tight text-[var(--text-foreground)]">
                Optimistic Biotech-Neofuturist Instrument
              </h2>
            </div>

            <div className="space-y-2 border-b border-[var(--border-color)] pb-4">
              <span className="text-xs uppercase font-bold text-[var(--text-muted)]">Interface Body Copy (Manrope)</span>
              <p className="text-sm text-[var(--text-foreground)] leading-relaxed">
                Tracker is designed first for design-conscious professionals seeking a frictionless way to manage daily life, time-blocking, and monthly bills with calm precision.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase font-bold text-[var(--text-muted)]">Tabular Numerals Specimen (Manrope tabular-nums)</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono tabular-nums text-sm">
                <div className="surface-card-subtle p-3 flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Timer:</span>
                  <span className="font-bold text-[var(--color-primary)]">01:42:19</span>
                </div>
                <div className="surface-card-subtle p-3 flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Bill Amount:</span>
                  <span className="font-bold text-[var(--color-success)]">$1,249.50</span>
                </div>
                <div className="surface-card-subtle p-3 flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Due Date:</span>
                  <span className="font-bold text-[var(--text-foreground)]">2026-08-31</span>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Section 4: Component Recipes */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2 text-[var(--text-foreground)] font-bold font-display text-xl">
            <ShieldCheck className="w-5 h-5 text-[var(--color-primary)]" />
            <h2>4. Component Recipes & Primitives</h2>
          </div>

          <Card variant="surface-1" className="space-y-6">
            <div>
              <div className="text-xs uppercase font-bold text-[var(--text-muted)] mb-3">Buttons (STYLE.md Recipe)</div>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Primary Accent</Button>
                <Button variant="secondary">Secondary Surface</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
              </div>
            </div>

            <div>
              <div className="text-xs uppercase font-bold text-[var(--text-muted)] mb-3">Badges & Status Chips</div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="primary" dot>Must-Win 3</Badge>
                <Badge variant="success">Paid Bill</Badge>
                <Badge variant="warning" dot>Due Soon</Badge>
                <Badge variant="danger" dot>Overdue</Badge>
                <Badge variant="info">Focus Mode</Badge>
                <Badge variant="neutral">Archived</Badge>
              </div>
            </div>

            <div>
              <div className="text-xs uppercase font-bold text-[var(--text-muted)] mb-3">Form Controls (Opaque Surface Input)</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Task Title Input"
                  placeholder="e.g. Complete quarterly financial summary..."
                  leftIcon={<Mail className="w-4 h-4" />}
                  value={sampleInput}
                  onChange={(e) => setSampleInput(e.target.value)}
                />
                <Input
                  label="Password Input with Error"
                  placeholder="Enter security key..."
                  leftIcon={<Lock className="w-4 h-4" />}
                  error="Security pin must contain at least 6 characters."
                />
              </div>
            </div>
          </Card>

          <div className="pt-2">
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              Open Motion Dialog Demo
            </Button>
          </div>
        </section>

        {/* Section 5: Anti-AI Slop Rules Prohibited Patterns Checklist */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2 text-[var(--text-foreground)] font-bold font-display text-xl">
            <Ban className="w-5 h-5 text-[var(--color-danger)]" />
            <h2>5. Anti-Generic & Anti-"AI Slop" Enforcement Checklist</h2>
          </div>

          <Card variant="surface-1" className="space-y-3">
            <p className="text-xs text-[var(--text-muted)]">
              Per Section 2 of <code className="text-[var(--color-primary)]">STYLE.md</code>, the following legacy patterns are strictly prohibited from all component implementations:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="surface-card-subtle p-3 flex items-center space-x-2 text-[var(--color-danger)]">
                <Ban className="w-4 h-4 shrink-0" />
                <span>NO Purple-to-blue gradient buttons</span>
              </div>
              <div className="surface-card-subtle p-3 flex items-center space-x-2 text-[var(--color-danger)]">
                <Ban className="w-4 h-4 shrink-0" />
                <span>NO Glass cards with backdrop-filter blur</span>
              </div>
              <div className="surface-card-subtle p-3 flex items-center space-x-2 text-[var(--color-danger)]">
                <Ban className="w-4 h-4 shrink-0" />
                <span>NO Blurred neon blobs behind pages</span>
              </div>
              <div className="surface-card-subtle p-3 flex items-center space-x-2 text-[var(--color-danger)]">
                <Ban className="w-4 h-4 shrink-0" />
                <span>NO Decorative icon boxes next to headings</span>
              </div>
            </div>
          </Card>
        </section>
      </div>

      {/* Interactive Modal Component Demo */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Solid Alpha Motion Dialog"
        description="Built using Motion for React with solid alpha overlay and no backdrop blur per STYLE.md Section 7.1 & 10.5."
      >
        <div className="space-y-4 pt-2">
          <p className="text-sm text-[var(--text-foreground)]">
            Includes full keyboard escape handling, scroll lock, and enter/exit presence orchestration.
          </p>
          <div className="flex justify-end space-x-3 pt-4 border-t border-[var(--border-color)]">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsModalOpen(false)}>
              Confirm Action
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
