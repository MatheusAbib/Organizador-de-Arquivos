import type { ReactNode } from 'react'
import './EstadoVazio.css'

interface EstadoVazioProps {
  icone: ReactNode
  titulo: string
  descricao?: string
  acao?: ReactNode
}

export function EstadoVazio({ icone, titulo, descricao, acao }: EstadoVazioProps) {
  return (
    <div className="estado-vazio">
      <div className="estado-vazio-icone">{icone}</div>
      <h3 className="estado-vazio-titulo">{titulo}</h3>
      {descricao && <p className="estado-vazio-descricao">{descricao}</p>}
      {acao && <div className="estado-vazio-acao">{acao}</div>}
    </div>
  )
}
