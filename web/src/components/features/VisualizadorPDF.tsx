import { useEffect } from 'react'
import { FiDownload, FiExternalLink, FiX } from 'react-icons/fi'
import { createPortal } from 'react-dom'
import type { Arquivo } from '@/types/arquivo'
import { obterUrlArquivo } from '@/utils/formatadores'
import './VisualizadorPDF.css'

interface VisualizadorPDFProps {
  arquivo: Arquivo | null
  onClose: () => void
  onBaixar: (arquivo: Arquivo) => void
}

export function VisualizadorPDF({ arquivo, onClose, onBaixar }: VisualizadorPDFProps) {
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

  const url = obterUrlArquivo(arquivo.nome_arquivo)

  return createPortal(
    <div className="visualizador-pdf" onClick={onClose}>
      <div className="visualizador-pdf-caixa" onClick={(e) => e.stopPropagation()}>
        <header className="visualizador-pdf-topo">
          <h2 className="visualizador-pdf-titulo">{arquivo.nome_original}</h2>
          <div className="visualizador-pdf-acoes">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="visualizador-pdf-btn"
              title="Abrir em nova aba"
            >
              <FiExternalLink />
            </a>
            <button
              type="button"
              className="visualizador-pdf-btn"
              onClick={() => onBaixar(arquivo)}
              title="Baixar"
            >
              <FiDownload />
            </button>
            <button
              type="button"
              className="visualizador-pdf-btn visualizador-pdf-btn-fechar"
              onClick={onClose}
              title="Fechar"
            >
              <FiX />
            </button>
          </div>
        </header>

        <div className="visualizador-pdf-conteudo">
          <iframe
            src={url}
            title={arquivo.nome_original}
            className="visualizador-pdf-iframe"
          />
        </div>
      </div>
    </div>,
    document.body
  )
}
