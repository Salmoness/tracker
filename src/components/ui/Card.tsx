import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'surface-1' | 'surface-2' | 'signal' | 'outline'
  asymmetric?: boolean
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'surface-1',
  asymmetric = false,
  className = '',
  ...props
}) => {
  const variantStyles = {
    'surface-1': 'surface-card',
    'surface-2': 'surface-card-subtle',
    signal: 'bg-[var(--bg-surface-1)] border-l-4 border-l-[var(--color-primary)] border-y border-r border-[var(--border-color)]',
    outline: 'bg-transparent border border-[var(--border-color)] rounded-[var(--radius-lg)]',
  }

  const asymmetricStyle = asymmetric ? 'rounded-[12px_12px_4px_12px]' : 'rounded-[var(--radius-lg)]'

  return (
    <div className={`p-6 ${variantStyles[variant]} ${asymmetricStyle} ${className}`} {...props}>
      {children}
    </div>
  )
}

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`flex items-center justify-between border-b border-[var(--border-color)] pb-3 mb-4 ${className}`} {...props}>
    {children}
  </div>
)

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className = '', ...props }) => (
  <h3 className={`text-lg font-bold font-display text-[var(--text-foreground)] tracking-tight ${className}`} {...props}>
    {children}
  </h3>
)

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ children, className = '', ...props }) => (
  <p className={`text-xs text-[var(--text-muted)] leading-relaxed ${className}`} {...props}>
    {children}
  </p>
)
