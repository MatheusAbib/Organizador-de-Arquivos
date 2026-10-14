import { useEffect, useState } from 'react'
import { FiDownload, FiExternalLink, FiFileText, FiX } from 'react-icons/fi'
import { createPortal } from 'react-dom'
import type { Arquivo } from '@/types/arquivo'
import { obterUrlArquivo } from '@/utils/formatadores'
import { ErroVisualizador } from '@/components/ui/ErroVisualizador'
import './VisualizadorPDF.css'

interface VisualizadorPDFProps {
  arquivo: Arquivo | null
  onClose: () => void
  onBaixar: (arquivo: Arquivo) => void
}

type Estado = 'carregando' | 'ok' | 'erro'

export function VisualizadorPDF({ arquivo, onClose, onBaixar }: VisualizadorPDFProps) {
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

    const url = obterUrlArquivo(arquivo.nome_arquivo)

    fetch(url, { method: 'HEAD' })
      .then((response) => {
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

        const contentType = response.headers.get('content-type') || ''
        if (!contentType.includes('pdf')) {
          setEstado('erro')
          setMensagemErro('O arquivo não é um PDF válido')
          return
        }

        setEstado('ok')
      })
      .catch(() => {
        if (!cancelado) {
          setEstado('erro')
          setMensagemErro('Não foi possível conectar ao servidor')
        }
      })

    return () => {
      cancelado = true
    }
  }, [arquivo])

  if (!arquivo) return null

  const url = obterUrlArquivo(arquivo.nome_arquivo)

  return createPortal(
    <div className="visualizador-pdf" onClick={onClose}>
      <div className="visualizador-pdf-caixa" onClick={(e) => e.stopPropagation()}>
        <header className="visualizador-pdf-topo">
          <h2 className="visualizador-pdf-titulo">{arquivo.nome_original}</h2>
          <div className="visualizador-pdf-acoes">
            {estado === 'ok' && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="visualizador-pdf-btn"
                title="Abrir em nova aba"
              >
                <FiExternalLink />
              </a>
            )}
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
          {estado === 'carregando' && (
            <div className="visualizador-pdf-loading">
              <div className="visualizador-pdf-spinner" />
              <p>Carregando PDF...</p>
            </div>
          )}

          {estado === 'erro' && (
            <ErroVisualizador
              icone={<FiFileText />}
              titulo="Não foi possível abrir o PDF"
              descricao={mensagemErro || 'O arquivo pode estar corrompido, indisponível ou em um formato inválido.'}
              onBaixar={() => onBaixar(arquivo)}
            />
          )}

          {estado === 'ok' && (
            <iframe
              src={url}
              title={arquivo.nome_original}
              className="visualizador-pdf-iframe"
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
