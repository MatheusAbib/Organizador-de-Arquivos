import { useEffect, useState } from 'react'
import { FiDownload, FiX } from 'react-icons/fi'
import { createPortal } from 'react-dom'
import type { Arquivo } from '@/types/arquivo'
import { obterUrlArquivo } from '@/utils/formatadores'
import './VisualizadorTexto.css'

interface VisualizadorTextoProps {
  arquivo: Arquivo | null
  onClose: () => void
  onBaixar: (arquivo: Arquivo) => void
}

export function VisualizadorTexto({ arquivo, onClose, onBaixar }: VisualizadorTextoProps) {
  const [conteudo, setConteudo] = useState<string>('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

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

  useEffect(() => {
    if (!arquivo) return

    let cancelado = false

    async function carregar() {
      setCarregando(true)
      setErro(null)
      setConteudo('')

      try {
        const response = await fetch(obterUrlArquivo(arquivo!.nome_arquivo))
        if (!response.ok) throw new Error('Erro ao carregar arquivo')

        const texto = await response.text()
        if (!cancelado) setConteudo(texto)
      } catch {
        if (!cancelado) setErro('Não foi possível carregar o arquivo')
      } finally {
        if (!cancelado) setCarregando(false)
      }
    }

    void carregar()

    return () => {
      cancelado = true
    }
  }, [arquivo])

  if (!arquivo) return null

  return createPortal(
    <div className="visualizador-texto" onClick={onClose}>
      <div className="visualizador-texto-caixa" onClick={(e) => e.stopPropagation()}>
        <header className="visualizador-texto-topo">
          <h2 className="visualizador-texto-titulo">{arquivo.nome_original}</h2>
          <div className="visualizador-texto-acoes">
            <button
              type="button"
              className="visualizador-texto-btn"
              onClick={() => onBaixar(arquivo)}
              title="Baixar"
            >
              <FiDownload />
            </button>
            <button
              type="button"
              className="visualizador-texto-btn visualizador-texto-btn-fechar"
              onClick={onClose}
              title="Fechar"
            >
              <FiX />
            </button>
          </div>
        </header>

        <div className="visualizador-texto-conteudo">
          {carregando ? (
            <p className="visualizador-texto-estado">Carregando...</p>
          ) : erro ? (
            <p className="visualizador-texto-estado visualizador-texto-estado-erro">{erro}</p>
          ) : (
            <pre className="visualizador-texto-pre">{conteudo}</pre>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
