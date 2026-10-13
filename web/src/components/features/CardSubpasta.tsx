import { FiFolder, FiMoreVertical } from 'react-icons/fi'
import type { Pasta } from '@/types/arquivo'
import './CardSubpasta.css'

interface CardSubpastaProps {
  pasta: Pasta
  contagemArquivos: number
  onAbrir: (pasta: Pasta) => void
  onAcoes?: (pasta: Pasta) => void
}

export function CardSubpasta({
  pasta,
  contagemArquivos,
  onAbrir,
  onAcoes
}: CardSubpastaProps) {
  return (
    <div className="card-subpasta" onClick={() => onAbrir(pasta)}>
      <div className="card-subpasta-topo">
        <span className="card-subpasta-tipo">
          <FiFolder /> Pasta
        </span>

        {onAcoes && (
          <button
            type="button"
            className="card-subpasta-acao"
            onClick={(e) => {
              e.stopPropagation()
              onAcoes(pasta)
            }}
            title="Ações da pasta"
          >
            <FiMoreVertical />
          </button>
        )}
      </div>

      <div className="card-subpasta-preview">
        <FiFolder />
      </div>

      <div className="card-subpasta-info">
        <h3 className="card-subpasta-nome" title={pasta.nome}>
          {pasta.nome}
        </h3>
        <span className="card-subpasta-contagem">
          {contagemArquivos} {contagemArquivos === 1 ? 'item' : 'itens'}
        </span>
      </div>
    </div>
  )
}
