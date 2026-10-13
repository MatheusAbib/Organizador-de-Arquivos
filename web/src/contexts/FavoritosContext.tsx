import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react'
import type { Arquivo } from '@/types/arquivo'

type AbrirArquivoFn = (arquivo: Arquivo) => void
type BaixarArquivoFn = (arquivo: Arquivo) => void
type AlternarFavoritoFn = (arquivo: Arquivo) => void

interface FavoritosContextValue {
  favoritos: Arquivo[]
  contador: number
  modalAberto: boolean
  abrirModal: () => void
  fecharModal: () => void
  sincronizar: (todosArquivos: Arquivo[]) => void
  registrarHandlers: (handlers: {
    onAbrir: AbrirArquivoFn
    onBaixar: BaixarArquivoFn
    onAlternarFavorito: AlternarFavoritoFn
  }) => void
  abrirArquivo: AbrirArquivoFn
  baixarArquivo: BaixarArquivoFn
  alternarFavorito: AlternarFavoritoFn
}

const FavoritosContext = createContext<FavoritosContextValue | null>(null)

export function FavoritosProvider({ children }: { children: ReactNode }) {
  const [favoritos, setFavoritos] = useState<Arquivo[]>([])
  const [modalAberto, setModalAberto] = useState(false)

  const [handlers, setHandlers] = useState<{
    onAbrir: AbrirArquivoFn
    onBaixar: BaixarArquivoFn
    onAlternarFavorito: AlternarFavoritoFn
  } | null>(null)

  const sincronizar = useCallback((todosArquivos: Arquivo[]) => {
    const apenasFavoritos = todosArquivos.filter(
      (a) => a.favorito === 1 || a.favorito === true
    )

    setFavoritos((atual) => {
      if (atual.length !== apenasFavoritos.length) return apenasFavoritos

      const iguais = atual.every(
        (a, i) => a.id === apenasFavoritos[i].id && a.favorito === apenasFavoritos[i].favorito
      )
      return iguais ? atual : apenasFavoritos
    })
  }, [])

  const registrarHandlers = useCallback(
    (novos: {
      onAbrir: AbrirArquivoFn
      onBaixar: BaixarArquivoFn
      onAlternarFavorito: AlternarFavoritoFn
    }) => {
      setHandlers((antigos) => {
        if (
          antigos &&
          antigos.onAbrir === novos.onAbrir &&
          antigos.onBaixar === novos.onBaixar &&
          antigos.onAlternarFavorito === novos.onAlternarFavorito
        ) {
          return antigos
        }
        return novos
      })
    },
    []
  )

  const abrirArquivo = useCallback<AbrirArquivoFn>(
    (arquivo) => handlers?.onAbrir(arquivo),
    [handlers]
  )

  const baixarArquivo = useCallback<BaixarArquivoFn>(
    (arquivo) => handlers?.onBaixar(arquivo),
    [handlers]
  )

  const alternarFavorito = useCallback<AlternarFavoritoFn>(
    (arquivo) => handlers?.onAlternarFavorito(arquivo),
    [handlers]
  )

  const abrirModal = useCallback(() => setModalAberto(true), [])
  const fecharModal = useCallback(() => setModalAberto(false), [])

  const value = useMemo<FavoritosContextValue>(
    () => ({
      favoritos,
      contador: favoritos.length,
      modalAberto,
      abrirModal,
      fecharModal,
      sincronizar,
      registrarHandlers,
      abrirArquivo,
      baixarArquivo,
      alternarFavorito
    }),
    [
      favoritos,
      modalAberto,
      abrirModal,
      fecharModal,
      sincronizar,
      registrarHandlers,
      abrirArquivo,
      baixarArquivo,
      alternarFavorito
    ]
  )

  return <FavoritosContext.Provider value={value}>{children}</FavoritosContext.Provider>
}

export { FavoritosContext }
