import {
  FiFileText,
  FiImage,
  FiVideo,
  FiGrid,
  FiArchive
} from 'react-icons/fi'
import {
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint
} from 'react-icons/fa'
import './FiltrosTipo.css'

export type TipoFiltro =
  | 'todos'
  | 'pdf'
  | 'word'
  | 'excel'
  | 'powerpoint'
  | 'imagem'
  | 'texto'
  | 'video'
  | 'outros'

interface FiltroOpcao {
  id: TipoFiltro
  label: string
  icone: React.ReactNode
}

const filtros: FiltroOpcao[] = [
  { id: 'todos', label: 'Todos', icone: <FiGrid /> },
  { id: 'pdf', label: 'PDF', icone: <FaFilePdf /> },
  { id: 'word', label: 'Word', icone: <FaFileWord /> },
  { id: 'excel', label: 'Excel', icone: <FaFileExcel /> },
  { id: 'powerpoint', label: 'PowerPoint', icone: <FaFilePowerpoint /> },
  { id: 'imagem', label: 'Imagens', icone: <FiImage /> },
  { id: 'texto', label: 'Texto', icone: <FiFileText /> },
  { id: 'video', label: 'Vídeos', icone: <FiVideo /> },
  { id: 'outros', label: 'Outros', icone: <FiArchive /> }
]

interface FiltrosTipoProps {
  ativo: TipoFiltro
  onChange: (tipo: TipoFiltro) => void
  contagens?: Partial<Record<TipoFiltro, number>>
}

export function FiltrosTipo({ ativo, onChange, contagens }: FiltrosTipoProps) {
  return (
    <div className="filtros-tipo" role="tablist" aria-label="Filtrar por tipo">
      {filtros.map((filtro) => {
        const contagem = contagens?.[filtro.id]
        const isAtivo = ativo === filtro.id

        return (
          <button
            key={filtro.id}
            type="button"
            role="tab"
            aria-selected={isAtivo}
            className={`filtros-tipo-btn ${isAtivo ? 'filtros-tipo-btn-ativo' : ''}`}
            onClick={() => onChange(filtro.id)}
          >
            <span className="filtros-tipo-icone">{filtro.icone}</span>
            <span className="filtros-tipo-label">{filtro.label}</span>
            {typeof contagem === 'number' && (
              <span className="filtros-tipo-contagem">{contagem}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
