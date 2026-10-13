import { useMemo, useState } from 'react'

export function usePaginacao<T>(itens: T[], itensPorPaginaInicial = 8) {
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [itensPorPagina, setItensPorPagina] = useState(itensPorPaginaInicial)

  const totalPaginas = Math.max(1, Math.ceil(itens.length / itensPorPagina))

  const paginaSegura = Math.min(paginaAtual, totalPaginas)

  const itensPaginados = useMemo(() => {
    const inicio = (paginaSegura - 1) * itensPorPagina
    const fim = inicio + itensPorPagina
    return itens.slice(inicio, fim)
  }, [itens, paginaSegura, itensPorPagina])

  function mudarPagina(nova: number) {
    const limitada = Math.min(Math.max(1, nova), totalPaginas)
    setPaginaAtual(limitada)
  }

  function mudarItensPorPagina(novo: number) {
    setItensPorPagina(novo)
    setPaginaAtual(1)
  }

  function resetar() {
    setPaginaAtual(1)
  }

  return {
    paginaAtual: paginaSegura,
    itensPorPagina,
    totalPaginas,
    itensPaginados,
    totalItens: itens.length,
    mudarPagina,
    mudarItensPorPagina,
    resetar
  }
}
