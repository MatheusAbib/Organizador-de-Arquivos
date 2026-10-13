import { createContext, useCallback, useState, type ReactNode } from 'react'
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi'
import './Toast.css'

type TipoToast = 'sucesso' | 'erro' | 'info'

interface Toast {
  id: number
  tipo: TipoToast
  mensagem: string
}

interface ToastContextValue {
  sucesso: (mensagem: string) => void
  erro: (mensagem: string) => void
  info: (mensagem: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const ICONES: Record<TipoToast, ReactNode> = {
  sucesso: <FiCheckCircle />,
  erro: <FiAlertCircle />,
  info: <FiInfo />
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const remover = useCallback((id: number) => {
    setToasts((atual) => atual.filter((t) => t.id !== id))
  }, [])

  const adicionar = useCallback(
    (tipo: TipoToast, mensagem: string) => {
      const id = Date.now() + Math.random()
      setToasts((atual) => [...atual, { id, tipo, mensagem }])
      setTimeout(() => remover(id), 3500)
    },
    [remover]
  )

  return (
    <ToastContext.Provider
      value={{
        sucesso: (m) => adicionar('sucesso', m),
        erro: (m) => adicionar('erro', m),
        info: (m) => adicionar('info', m)
      }}
    >
      {children}

      <div className="toast-container" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.tipo}`}>
            <span className="toast-icone">{ICONES[t.tipo]}</span>
            <span className="toast-mensagem">{t.mensagem}</span>
            <button
              type="button"
              className="toast-fechar"
              onClick={() => remover(t.id)}
              aria-label="Fechar"
            >
              <FiX />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export { ToastContext }
