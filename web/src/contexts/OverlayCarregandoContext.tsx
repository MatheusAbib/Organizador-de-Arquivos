import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import './OverlayCarregando.css'

interface OverlayCarregandoContextValue {
  mostrar: (mensagem?: string) => void
  esconder: () => void
}

const OverlayCarregandoContext = createContext<OverlayCarregandoContextValue | null>(null)

export function OverlayCarregandoProvider({ children }: { children: ReactNode }) {
  const [visivel, setVisivel] = useState(false)
  const [mensagem, setMensagem] = useState('Carregando...')

  const mostrar = useCallback((msg?: string) => {
    setMensagem(msg ?? 'Carregando...')
    setVisivel(true)
  }, [])

  const esconder = useCallback(() => setVisivel(false), [])

  const value = useMemo(() => ({ mostrar, esconder }), [mostrar, esconder])

  return (
    <OverlayCarregandoContext.Provider value={value}>
      {children}
      {visivel &&
        createPortal(
          <div className="overlay-carregando">
            <div className="overlay-carregando-caixa">
              <div className="overlay-carregando-spinner" />
              <p className="overlay-carregando-mensagem">{mensagem}</p>
            </div>
          </div>,
          document.body
        )}
    </OverlayCarregandoContext.Provider>
  )
}

export { OverlayCarregandoContext }
