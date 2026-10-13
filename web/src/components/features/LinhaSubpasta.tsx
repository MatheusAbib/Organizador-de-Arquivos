import { FiChevronRight, FiFolder } from 'react-icons/fi'
import type { Pasta } from '@/types/arquivo'
import './LinhaSubpasta.css'

interface LinhaSubpastaProps {
  pasta: Pasta
  contagemArquivos: number
  onAbrir: (pasta: Pasta) => void
}

export function LinhaSubpasta({ pasta, contagemArquivos, onAbrir }: LinhaSubpastaProps) {
  return (
    <div className="linha-subpasta" onClick={() => onAbrir(pasta)}>
      <div className="linha-subpasta-preview">
        <FiFolder />
      </div>

      <div className="linha-subpasta-info">
        <h3 className="linha-subpasta-nome" title={pasta.nome}>
          {pasta.nome}
        </h3>
        <div className="linha-subpasta-meta">
          <span className="linha-subpasta-tipo">Pasta</span>
          <span>
            {contagemArquivos} {contagemArquivos === 1 ? 'item' : 'itens'}
          </span>
        </div>
      </div>

      <FiChevronRight className="linha-subpasta-seta" />
    </div>
  )
}
