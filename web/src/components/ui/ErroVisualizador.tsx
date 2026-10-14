import type { ReactNode } from 'react'
import { FiAlertTriangle, FiDownload } from 'react-icons/fi'
import './ErroVisualizador.css'

interface ErroVisualizadorProps {
  titulo?: string
  descricao?: string
  icone?: ReactNode
  onBaixar?: () => void
}

export function ErroVisualizador({
  titulo = 'Não foi possível visualizar',
  descricao = 'Este arquivo pode estar corrompido, indisponível ou em um formato não suportado.',
  icone = <FiAlertTriangle />,
  onBaixar
}: ErroVisualizadorProps) {
  return (
    <div className="erro-visualizador">
      <div className="erro-visualizador-icone">{icone}</div>
      <h3 className="erro-visualizador-titulo">{titulo}</h3>
      <p className="erro-visualizador-descricao">{descricao}</p>

      {onBaixar && (
        <button
          type="button"
          className="erro-visualizador-btn"
          onClick={onBaixar}
        >
          <FiDownload />
          Baixar arquivo
        </button>
      )}
    </div>
  )
}
