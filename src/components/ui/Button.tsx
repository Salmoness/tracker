import React from 'react'
import { motion, HTMLMotionProps } from 'motion/react'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  className?: string
  disabled?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-[var(--radius-md)] transition-colors duration-160 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none'

  const variantStyles = {
    primary:
      'bg-[var(--color-primary)] text-[var(--on-primary)] hover:opacity-95 shadow-sm font-bold',
    secondary:
      'bg-[var(--bg-surface-2)] text-[var(--text-foreground)] border border-[var(--border-color)] hover:bg-[var(--bg-surface-3)]',
    outline:
      'bg-transparent border border-[var(--border-strong)] text-[var(--text-foreground)] hover:bg-[var(--bg-surface-2)]',
    ghost:
      'bg-transparent text-[var(--text-foreground)] hover:bg-[var(--bg-surface-2)]',
    danger:
      'bg-[var(--color-danger)] text-[var(--on-status)] hover:opacity-90 font-bold',
  }

  const sizeStyles = {
    sm: 'text-xs h-9 px-3 gap-1.5',
    md: 'text-sm h-11 px-4 gap-2', // 44px default height
    lg: 'text-base h-12 px-6 gap-2.5', // 48px large action
  }

  return (
    <motion.button
      whileTap={disabled || isLoading ? undefined : { scale: 0.985 }}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </motion.button>
  )
}
