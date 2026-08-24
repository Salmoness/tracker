import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { TaskProvider, useTasks } from '@/context/TaskContext'
import { MustWinThreeCard } from '@/features/priorities/MustWinThreeCard'
import { RoutineBar } from '@/features/routines/RoutineBar'
import { TaskList } from '@/features/tasks/TaskList'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  Zap,
  LogOut,
  User as UserIcon,
  Sparkles,
  ShieldCheck,
  Key,
  CheckCircle2,
  Calendar,
  Clock,
  DollarSign,
  Copy,
  Check,
  X,
  AlertCircle,
} from 'lucide-react'

const DashboardContent: React.FC = () => {
  const { user, profile, logout, jwtToken, isMockMode } = useAuth()
  const { toasts, removeToast } = useTasks()
  const navigate = useNavigate()
  const [copiedToken, setCopiedToken] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/logout-confirm')
  }

  const handleCopyToken = () => {
    if (jwtToken) {
      navigator.clipboard.writeText(jwtToken)
      setCopiedToken(true)
      setTimeout(() => setCopiedToken(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-background)] text-[var(--text-foreground)] p-4 md:p-8 space-y-6">
      {/* Toast Notification Container */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-3.5 rounded-[var(--radius-md)] surface-card border shadow-lg flex items-center justify-between text-xs space-x-2 animate-scaleUp ${
              toast.type === 'success'
                ? 'border-[var(--color-success)] text-[var(--color-success)]'
                : toast.type === 'warning'
                ? 'border-[var(--color-warning)] text-[var(--color-warning)]'
                : toast.type === 'error'
                ? 'border-[var(--color-danger)] text-[var(--color-danger)]'
                : 'border-[var(--color-info)] text-[var(--color-info)]'
            }`}
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{toast.message}</span>
            </div>
            <button onClick={() => removeToast(toast.id)} className="p-1 hover:opacity-80">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--primary-subtle)] border border-[var(--primary-border)] flex items-center justify-center text-[var(--color-primary)] font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-[var(--text-foreground)] tracking-tight">
              Tracker Focus Dashboard
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              Personal Productivity, Daily Routines & Must-Win 3 Priorities.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {isMockMode && <Badge variant="warning">Local Mock Engine</Badge>}

          <Link
            to="/design-system"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--primary-subtle)] border border-[var(--primary-border)] text-[var(--color-primary)] text-xs font-semibold hover:opacity-90 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Design System</span>
          </Link>

          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-[var(--radius-sm)] surface-card border border-[var(--border-color)] text-xs">
            <UserIcon className="w-4 h-4 text-[var(--color-primary)]" />
            <span className="text-[var(--text-foreground)] font-medium">
              {profile?.fullName || user?.email}
            </span>
          </div>

          <Button variant="outline" size="sm" onClick={handleLogout} leftIcon={<LogOut className="w-4 h-4" />}>
            Log Out
          </Button>
        </div>
      </header>

      {/* Dashboard Main Grid */}
      <main className="max-w-7xl mx-auto space-y-6">
        {/* Top Hero: Must-Win 3 Priorities */}
        <MustWinThreeCard />

        {/* Routine Quick-Apply Bar */}
        <RoutineBar />

        {/* Task Management Pipeline */}
        <TaskList />
      </main>
    </div>
  )
}

export const DashboardPage: React.FC = () => {
  return (
    <TaskProvider>
      <DashboardContent />
    </TaskProvider>
  )
}
