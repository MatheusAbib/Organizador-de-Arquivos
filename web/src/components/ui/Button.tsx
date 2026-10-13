import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { FiLoader } from 'react-icons/fi'
import type { ButtonSize, ButtonVariant } from '@/types/ui'
import './Button.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  loadingText?: string
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    loadingText,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    disabled,
    className = '',
    children,
    ...rest
  },
  ref
) {
  const classes = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth ? 'btn-full' : '',
    className
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={classes}
      {...rest}
    >
      {loading ? (
        <>
          <FiLoader className="btn-spinner" aria-hidden />
          <span>{loadingText ?? children}</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="btn-icon" aria-hidden>{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className="btn-icon" aria-hidden>{icon}</span>
          )}
        </>
      )}
    </button>
  )
})
