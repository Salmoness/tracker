import React from 'react'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  size?: 'sm' | 'md'
  dot?: boolean
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) => {
  const variantStyles = {
    primary: 'bg-[var(--primary-subtle)] border-[var(--primary-border)] text-[var(--color-primary)]',
    success: 'bg-[oklch(78%_0.14_160_/_0.15)] border-[oklch(78%_0.14_160_/_0.35)] text-[var(--color-success)]',
    warning: 'bg-[oklch(82%_0.15_85_/_0.15)] border-[oklch(82%_0.15_85_/_0.35)] text-[var(--color-warning)]',
    danger: 'bg-[oklch(72%_0.18_25_/_0.15)] border-[oklch(72%_0.18_25_/_0.35)] text-[var(--color-danger)]',
    info: 'bg-[oklch(76%_0.13_235_/_0.15)] border-[oklch(76%_0.13_235_/_0.35)] text-[var(--color-info)]',
    neutral: 'bg-[var(--bg-surface-2)] border-[var(--border-color)] text-[var(--text-muted)]',
  }

  const dotColors = {
    primary: 'bg-[var(--color-primary)]',
    success: 'bg-[var(--color-success)]',
    warning: 'bg-[var(--color-warning)]',
    danger: 'bg-[var(--color-danger)]',
    info: 'bg-[var(--color-info)]',
    neutral: 'bg-[var(--text-muted)]',
  }

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-solid ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${dotColors[variant]}`} />}
      <span>{children}</span>
    </span>
  )
}
