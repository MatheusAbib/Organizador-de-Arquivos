import { useRef, type ChangeEvent } from 'react'
import { FiGrid, FiList, FiSearch, FiUploadCloud, FiX } from 'react-icons/fi'
import { Button } from '@/components/ui/Button'
import './BarraAcoes.css'

export type Visualizacao = 'grid' | 'lista'

interface BarraAcoesProps {
  busca: string
  onBuscaChange: (valor: string) => void
  visualizacao: Visualizacao
  onVisualizacaoChange: (valor: Visualizacao) => void
  onUpload: (arquivos: FileList) => void
  onNovaPasta: () => void
  mostrarAcoes?: boolean
  dentroDePasta?: boolean
}

export function BarraAcoes({
  busca,
  onBuscaChange,
  visualizacao,
  onVisualizacaoChange,
  onUpload,
  onNovaPasta,
  mostrarAcoes = true,
  dentroDePasta = false
}: BarraAcoesProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleArquivos(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files)
      e.target.value = ''
    }
  }

  return (
    <div className="barra-acoes">
      <div className="barra-acoes-busca">
        <FiSearch className="barra-acoes-busca-icon" />
        <input
          type="text"
          className="barra-acoes-busca-input"
          placeholder="Buscar arquivos pelo nome..."
          value={busca}
          onChange={(e) => onBuscaChange(e.target.value)}
        />
        {busca && (
          <button
            type="button"
            className="barra-acoes-busca-limpar"
            onClick={() => onBuscaChange('')}
            aria-label="Limpar busca"
          >
            <FiX />
          </button>
        )}
      </div>

      <div className="barra-acoes-visualizacao" role="group" aria-label="Modo de visualização">
        <button
          type="button"
          className={`barra-acoes-visualizacao-btn ${
            visualizacao === 'grid' ? 'ativo' : ''
          }`}
          onClick={() => onVisualizacaoChange('grid')}
          title="Visualização em grade"
        >
          <FiGrid />
          <span>Grid</span>
        </button>
        <button
          type="button"
          className={`barra-acoes-visualizacao-btn ${
            visualizacao === 'lista' ? 'ativo' : ''
          }`}
          onClick={() => onVisualizacaoChange('lista')}
          title="Visualização em lista"
        >
          <FiList />
          <span>Lista</span>
        </button>
      </div>

      {mostrarAcoes && (
        <div className="barra-acoes-botoes">
          <Button
            variant="success"
            icon={<FiUploadCloud />}
            onClick={() => inputRef.current?.click()}
          >
            Upload
          </Button>
        </div>
      )}

      {mostrarAcoes && (
        <input
          ref={inputRef}
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={handleArquivos}
        />
      )}
    </div>
  )
}
