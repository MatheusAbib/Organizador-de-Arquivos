import { createContext, useEffect, useState, type ReactNode } from 'react'
import type { Tema, TemaContextValue } from '@/types/tema'

const STORAGE_KEY = 'tema'

const TemaContext = createContext<TemaContextValue | null>(null)

function obterTemaInicial(): Tema {
  const salvo = localStorage.getItem(STORAGE_KEY)
  if (salvo === 'escuro' || salvo === 'claro') return salvo
  return 'claro'
}

export function TemaProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>(obterTemaInicial)

  useEffect(() => {
    const root = document.documentElement
    if (tema === 'escuro') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem(STORAGE_KEY, tema)
  }, [tema])

  function alternarTema() {
    setTema((atual) => (atual === 'escuro' ? 'claro' : 'escuro'))
  }

  function definirTema(novo: Tema) {
    setTema(novo)
  }

  return (
    <TemaContext.Provider value={{ tema, alternarTema, definirTema }}>
      {children}
    </TemaContext.Provider>
  )
}

export { TemaContext }
