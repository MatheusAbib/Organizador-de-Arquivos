import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi'
import './Paginacao.css'

interface PaginacaoProps {
  paginaAtual: number
  totalPaginas: number
  totalItens: number
  itensPorPagina: number
  onMudarPagina: (pagina: number) => void
  onMudarItensPorPagina?: (itens: number) => void
  opcoesItensPorPagina?: number[]
}

export function Paginacao({
  paginaAtual,
  totalPaginas,
  totalItens,
  itensPorPagina,
  onMudarPagina,
  onMudarItensPorPagina,
  opcoesItensPorPagina = [8, 12, 16, 24, 32]
}: PaginacaoProps) {
  if (totalPaginas <= 1 && !onMudarItensPorPagina) return null

  const inicio = totalItens > 0 ? (paginaAtual - 1) * itensPorPagina + 1 : 0
  const fim = Math.min(paginaAtual * itensPorPagina, totalItens)

  const paginas: (number | '...')[] = []

  if (totalPaginas <= 7) {
    for (let i = 1; i <= totalPaginas; i++) paginas.push(i)
  } else {
    paginas.push(1)

    const inicioRange = Math.max(2, paginaAtual - 1)
    const fimRange = Math.min(totalPaginas - 1, paginaAtual + 1)

    if (inicioRange > 2) paginas.push('...')
    for (let i = inicioRange; i <= fimRange; i++) paginas.push(i)
    if (fimRange < totalPaginas - 1) paginas.push('...')

    paginas.push(totalPaginas)
  }

  return (
    <div className="paginacao">
      <span className="paginacao-info">
        Mostrando <strong>{inicio}</strong>–<strong>{fim}</strong> de{' '}
        <strong>{totalItens}</strong>
      </span>

      <div className="paginacao-botoes">
        <button
          type="button"
          className="paginacao-btn"
          onClick={() => onMudarPagina(1)}
          disabled={paginaAtual === 1}
          title="Primeira página"
        >
          <FiChevronsLeft />
        </button>

        <button
          type="button"
          className="paginacao-btn"
          onClick={() => onMudarPagina(paginaAtual - 1)}
          disabled={paginaAtual === 1}
          title="Página anterior"
        >
          <FiChevronLeft />
        </button>

        {paginas.map((p, i) =>
          p === '...' ? (
            <span key={`reticencias-${i}`} className="paginacao-reticencias">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className={`paginacao-btn ${p === paginaAtual ? 'paginacao-btn-ativo' : ''}`}
              onClick={() => onMudarPagina(p)}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          className="paginacao-btn"
          onClick={() => onMudarPagina(paginaAtual + 1)}
          disabled={paginaAtual === totalPaginas}
          title="Próxima página"
        >
          <FiChevronRight />
        </button>

        <button
          type="button"
          className="paginacao-btn"
          onClick={() => onMudarPagina(totalPaginas)}
          disabled={paginaAtual === totalPaginas}
          title="Última página"
        >
          <FiChevronsRight />
        </button>
      </div>

      {onMudarItensPorPagina && (
        <div className="paginacao-tamanho">
          <label htmlFor="paginacao-tamanho">Mostrar:</label>
          <select
            id="paginacao-tamanho"
            value={itensPorPagina}
            onChange={(e) => onMudarItensPorPagina(Number(e.target.value))}
          >
            {opcoesItensPorPagina.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
