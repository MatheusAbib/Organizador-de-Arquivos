import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { FiX } from 'react-icons/fi'
import './Modal.css'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  icon?: ReactNode
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  closeOnOverlay?: boolean
  closeOnEsc?: boolean
}

export function Modal({
  open,
  onClose,
  title,
  icon,
  children,
  footer,
  size = 'md',
  closeOnOverlay = true,
  closeOnEsc = true
}: ModalProps) {
  useEffect(() => {
    if (!open) return

    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKey(e: KeyboardEvent) {
      if (closeOnEsc && e.key === 'Escape') onClose()
    }

    if (closeOnEsc) document.addEventListener('keydown', handleKey)

    return () => {
      document.body.style.overflow = overflowAnterior
      document.removeEventListener('keydown', handleKey)
    }
  }, [open, closeOnEsc, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="modal-overlay"
      onClick={closeOnOverlay ? onClose : undefined}
    >
      <div
        className={`modal-box modal-${size}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {title && (
          <header className="modal-head">
            <h2 className="modal-title">
              {icon && <span className="modal-title-icon">{icon}</span>}
              {title}
            </h2>
            <button
              type="button"
              className="modal-close"
              onClick={onClose}
              aria-label="Fechar"
            >
              <FiX />
            </button>
          </header>
        )}

        <div className="modal-body">{children}</div>

        {footer && <footer className="modal-foot">{footer}</footer>}
      </div>
    </div>,
    document.body
  )
}
