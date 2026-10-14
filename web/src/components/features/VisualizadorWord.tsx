import { useEffect, useState } from 'react'
import { FiDownload, FiFileText, FiPrinter, FiX } from 'react-icons/fi'
import { createPortal } from 'react-dom'
import mammoth from 'mammoth'
import type { Arquivo } from '@/types/arquivo'
import { obterUrlArquivo } from '@/utils/formatadores'
import { ErroVisualizador } from '@/components/ui/ErroVisualizador'
import './VisualizadorWord.css'

interface VisualizadorWordProps {
  arquivo: Arquivo | null
  onClose: () => void
  onBaixar: (arquivo: Arquivo) => void
}

type Estado = 'carregando' | 'ok' | 'erro'

export function VisualizadorWord({ arquivo, onClose, onBaixar }: VisualizadorWordProps) {
  const [html, setHtml] = useState<string>('')
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
    setHtml('')

    async function carregar() {
      try {
        const url = obterUrlArquivo(arquivo!.nome_arquivo)
        const response = await fetch(url)

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
        if (contentType.includes('text/html') || contentType.includes('application/json')) {
          setEstado('erro')
          setMensagemErro('O arquivo não é um documento válido')
          return
        }

        const arrayBuffer = await response.arrayBuffer()

        if (cancelado) return

        const resultado = await mammoth.convertToHtml(
          { arrayBuffer },
          {
            styleMap: [
              "p[style-name='Section Title'] => h1:fresh",
              "p[style-name='Subsection Title'] => h2:fresh"
            ]
          }
        )

        if (!cancelado) {
          setHtml(resultado.value)
          setEstado('ok')
        }
      } catch (err) {
        if (!cancelado) {
          console.error('Erro ao converter Word:', err)
          setEstado('erro')
          setMensagemErro('Não foi possível processar o documento')
        }
      }
    }

    void carregar()

    return () => {
      cancelado = true
    }
  }, [arquivo])

  function imprimir() {
    if (!html || !arquivo) return

    const win = window.open('', '_blank')
    if (!win) return

    win.document.write(`
      <html>
        <head>
          <title>${arquivo.nome_original}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; padding: 40px; color: #2c2c2c; }
            img { max-width: 100%; height: auto; }
            table { border-collapse: collapse; width: 100%; margin: 15px 0; }
            td, th { border: 1px solid #ddd; padding: 8px; }
            h1, h2, h3 { font-family: Georgia, serif; }
          </style>
        </head>
        <body>${html}</body>
      </html>
    `)
    win.document.close()
    win.focus()
    win.print()
  }

  if (!arquivo) return null

  return createPortal(
    <div className="visualizador-word" onClick={onClose}>
      <div className="visualizador-word-caixa" onClick={(e) => e.stopPropagation()}>
        <header className="visualizador-word-topo">
          <h2 className="visualizador-word-titulo">{arquivo.nome_original}</h2>
          <div className="visualizador-word-acoes">
            {estado === 'ok' && (
              <button
                type="button"
                className="visualizador-word-btn"
                onClick={imprimir}
                title="Imprimir"
              >
                <FiPrinter />
              </button>
            )}
            <button
              type="button"
              className="visualizador-word-btn"
              onClick={() => onBaixar(arquivo)}
              title="Baixar"
            >
              <FiDownload />
            </button>
            <button
              type="button"
              className="visualizador-word-btn visualizador-word-btn-fechar"
              onClick={onClose}
              title="Fechar"
            >
              <FiX />
            </button>
          </div>
        </header>

        <div className="visualizador-word-conteudo">
          {estado === 'carregando' && (
            <div className="visualizador-word-loading">
              <div className="visualizador-word-spinner" />
              <p>Convertendo documento...</p>
            </div>
          )}

          {estado === 'erro' && (
            <ErroVisualizador
              icone={<FiFileText />}
              titulo="Não foi possível abrir o documento"
              descricao={mensagemErro}
              onBaixar={() => onBaixar(arquivo)}
            />
          )}

          {estado === 'ok' && (
            <div
              className="visualizador-word-html"
              dangerouslySetInnerHTML={{ __html: html || '<p>Documento vazio</p>' }}
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
