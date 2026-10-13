import { useEffect, useState } from 'react'
import { FiDownload, FiPrinter, FiX } from 'react-icons/fi'
import { createPortal } from 'react-dom'
import mammoth from 'mammoth'
import type { Arquivo } from '@/types/arquivo'
import { obterUrlArquivo } from '@/utils/formatadores'
import './VisualizadorWord.css'

interface VisualizadorWordProps {
  arquivo: Arquivo | null
  onClose: () => void
  onBaixar: (arquivo: Arquivo) => void
}

export function VisualizadorWord({ arquivo, onClose, onBaixar }: VisualizadorWordProps) {
  const [html, setHtml] = useState<string>('')
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
      setHtml('')

      try {
        const url = obterUrlArquivo(arquivo!.nome_arquivo)
        const response = await fetch(url)
        if (!response.ok) throw new Error('Erro ao carregar arquivo')

        const arrayBuffer = await response.arrayBuffer()
        const resultado = await mammoth.convertToHtml(
          { arrayBuffer },
          {
            styleMap: [
              "p[style-name='Section Title'] => h1:fresh",
              "p[style-name='Subsection Title'] => h2:fresh"
            ]
          }
        )

        if (!cancelado) setHtml(resultado.value)
      } catch (err) {
        if (!cancelado) {
          console.error('Erro ao converter Word:', err)
          setErro('Não foi possível renderizar o documento')
        }
      } finally {
        if (!cancelado) setCarregando(false)
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
            <button
              type="button"
              className="visualizador-word-btn"
              onClick={imprimir}
              title="Imprimir"
              disabled={!html}
            >
              <FiPrinter />
            </button>
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
          {carregando ? (
            <div className="visualizador-word-estado">
              <div className="visualizador-word-spinner" />
              <p>Convertendo documento...</p>
            </div>
          ) : erro ? (
            <div className="visualizador-word-estado visualizador-word-estado-erro">
              <p>{erro}</p>
              <p>Você pode tentar baixar o arquivo para visualizá-lo.</p>
            </div>
          ) : (
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
