import React from 'react'
import { useAppearance, ThemeMode, AccentPreset } from '@/context/AppearanceContext'
import { Sun, Moon, Monitor, Check } from 'lucide-react'

export const AppearanceSelector: React.FC = () => {
  const { mode, accent, setMode, setAccent } = useAppearance()

  const modeOptions: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { value: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> },
    { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
  ]

  const accentOptions: { value: AccentPreset; label: string; previewHex: string }[] = [
    { value: 'chlorophyll', label: 'Chlorophyll', previewHex: '#a0de53' },
    { value: 'ultraviolet', label: 'Ultraviolet', previewHex: '#bc8fff' },
    { value: 'solar', label: 'Solar', previewHex: '#ff8c53' },
  ]

  return (
    <div className="surface-card p-6 space-y-6">
      {/* Theme Mode Segmented Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Appearance Mode
        </label>
        <div className="grid grid-cols-3 gap-2 p-1 bg-[var(--bg-surface-2)] rounded-[var(--radius-md)]">
          {modeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMode(opt.value)}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-[var(--radius-sm)] text-xs font-semibold transition-all ${
                mode === opt.value
                  ? 'bg-[var(--bg-surface-1)] text-[var(--text-foreground)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-foreground)]'
              }`}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Accent Preset Swatches */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Accent Preset
        </label>
        <div className="grid grid-cols-3 gap-3">
          {accentOptions.map((opt) => {
            const isSelected = accent === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => setAccent(opt.value)}
                className={`flex flex-col items-center justify-center gap-2 p-3 surface-card-subtle transition-all cursor-pointer ${
                  isSelected
                    ? 'border-2 border-[var(--color-primary)]'
                    : 'hover:border-[var(--border-strong)]'
                }`}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: opt.previewHex }}
                >
                  {isSelected && <Check className="w-4 h-4 text-[#001114]" />}
                </div>
                <span className="text-xs font-semibold text-[var(--text-foreground)]">{opt.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
