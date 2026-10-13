import { FiDownload, FiX } from 'react-icons/fi'
import { createPortal } from 'react-dom'
import { useEffect } from 'react'
import { ImagemCarregando } from '@/components/ui/ImagemCarregando'
import type { Arquivo } from '@/types/arquivo'
import { obterUrlArquivo } from '@/utils/formatadores'
import './VisualizadorImagem.css'

interface VisualizadorImagemProps {
  arquivo: Arquivo | null
  onClose: () => void
  onBaixar: (arquivo: Arquivo) => void
}

export function VisualizadorImagem({ arquivo, onClose, onBaixar }: VisualizadorImagemProps) {
  useEffect(() => {
    if (!arquivo) return

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [arquivo, onClose])

  if (!arquivo) return null

  return createPortal(
    <div className="visualizador-imagem" onClick={onClose}>
      <div className="visualizador-imagem-topo" onClick={(e) => e.stopPropagation()}>
        <span className="visualizador-imagem-nome">{arquivo.nome_original}</span>
        <div className="visualizador-imagem-acoes">
          <button
            type="button"
            className="visualizador-imagem-btn"
            onClick={() => onBaixar(arquivo)}
            title="Baixar"
          >
            <FiDownload />
          </button>
          <button
            type="button"
            className="visualizador-imagem-btn visualizador-imagem-btn-fechar"
            onClick={onClose}
            title="Fechar"
          >
            <FiX />
          </button>
        </div>
      </div>

      <div className="visualizador-imagem-conteudo" onClick={(e) => e.stopPropagation()}>
        <ImagemCarregando
          src={obterUrlArquivo(arquivo.nome_arquivo)}
          alt={arquivo.nome_original}
        />
      </div>
    </div>,
    document.body
  )
}
