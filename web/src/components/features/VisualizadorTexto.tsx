import { useEffect, useState } from 'react'
import { FiDownload, FiFileText, FiX } from 'react-icons/fi'
import { createPortal } from 'react-dom'
import type { Arquivo } from '@/types/arquivo'
import { obterUrlArquivo } from '@/utils/formatadores'
import { ErroVisualizador } from '@/components/ui/ErroVisualizador'
import './VisualizadorTexto.css'

interface VisualizadorTextoProps {
  arquivo: Arquivo | null
  onClose: () => void
  onBaixar: (arquivo: Arquivo) => void
}

type Estado = 'carregando' | 'ok' | 'erro'

export function VisualizadorTexto({ arquivo, onClose, onBaixar }: VisualizadorTextoProps) {
  const [conteudo, setConteudo] = useState<string>('')
  const [estado, setEstado] = useState<Estado>('carregando')
  const [mensagemErro, setMensagemErro] = useState('')

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
    setEstado('carregando')
    setMensagemErro('')
    setConteudo('')

    async function carregar() {
      try {
        const response = await fetch(obterUrlArquivo(arquivo!.nome_arquivo))

        if (cancelado) return

        if (!response.ok) {
          setEstado('erro')
          setMensagemErro(
            response.status === 404
              ? 'Arquivo não encontrado no servidor'
              : 'Erro ao carregar o arquivo'
          )
          return
        }

        const texto = await response.text()

        if (!cancelado) {
          setConteudo(texto)
          setEstado('ok')
        }
      } catch {
        if (!cancelado) {
          setEstado('erro')
          setMensagemErro('Não foi possível carregar o arquivo')
        }
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
          {estado === 'carregando' && (
            <div className="visualizador-texto-loading">
              <div className="visualizador-texto-spinner" />
              <p>Carregando arquivo...</p>
            </div>
          )}

          {estado === 'erro' && (
            <ErroVisualizador
              icone={<FiFileText />}
              titulo="Não foi possível abrir o arquivo"
              descricao={mensagemErro}
              onBaixar={() => onBaixar(arquivo)}
            />
          )}

          {estado === 'ok' && <pre className="visualizador-texto-pre">{conteudo}</pre>}
        </div>
      </div>
    </div>,
    document.body
  )
}
