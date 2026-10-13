import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'
import './Input.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: ReactNode
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, icon, error, hint, className = '', id, ...rest },
  ref
) {
  const autoId = useId()
  const inputId = id ?? autoId

  return (
    <div className="input-group">
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}

      <div className="input-wrapper">
        {icon && (
          <span className="input-icon" aria-hidden>
            {icon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          className={[
            'input-field',
            icon ? 'input-with-icon' : '',
            error ? 'input-error' : '',
            className
          ]
            .filter(Boolean)
            .join(' ')}
          {...rest}
        />
      </div>

      {error ? (
        <span className="input-message input-message-error">{error}</span>
      ) : hint ? (
        <span className="input-message">{hint}</span>
      ) : null}
    </div>
  )
})
