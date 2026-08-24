import React, { createContext, useContext, useEffect, useState } from 'react'

export type ThemeMode = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'
export type AccentPreset = 'chlorophyll' | 'ultraviolet' | 'solar'

interface AppearanceContextType {
  mode: ThemeMode
  resolvedTheme: ResolvedTheme
  accent: AccentPreset
  setMode: (mode: ThemeMode) => void
  setAccent: (accent: AccentPreset) => void
}

const MODE_KEY = 'tracker.appearance.mode'
const ACCENT_KEY = 'tracker.appearance.accent'

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined)

export const AppearanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(MODE_KEY)
    return (saved as ThemeMode) || 'system'
  })

  const [accent, setAccentState] = useState<AccentPreset>(() => {
    const saved = localStorage.getItem(ACCENT_KEY)
    return (saved as AccentPreset) || 'chlorophyll'
  })

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark')

  useEffect(() => {
    const root = document.documentElement

    // Resolve system theme if needed
    const getSystemTheme = (): ResolvedTheme =>
      window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

    const actualTheme = mode === 'system' ? getSystemTheme() : mode
    setResolvedTheme(actualTheme)

    root.setAttribute('data-theme', actualTheme)
    root.setAttribute('data-accent', accent)
    root.style.colorScheme = actualTheme

    // Listen for system changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemChange = () => {
      if (mode === 'system') {
        const newTheme = getSystemTheme()
        setResolvedTheme(newTheme)
        root.setAttribute('data-theme', newTheme)
        root.style.colorScheme = newTheme
      }
    }

    mediaQuery.addEventListener('change', handleSystemChange)
    return () => mediaQuery.removeEventListener('change', handleSystemChange)
  }, [mode, accent])

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode)
    localStorage.setItem(MODE_KEY, newMode)
  }

  const setAccent = (newAccent: AccentPreset) => {
    setAccentState(newAccent)
    localStorage.setItem(ACCENT_KEY, newAccent)
  }

  return (
    <AppearanceContext.Provider value={{ mode, resolvedTheme, accent, setMode, setAccent }}>
      {children}
    </AppearanceContext.Provider>
  )
}

export const useAppearance = () => {
  const context = useContext(AppearanceContext)
  if (!context) {
    throw new Error('useAppearance must be used within an AppearanceProvider')
  }
  return context
}
