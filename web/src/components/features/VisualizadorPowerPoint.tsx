import { useEffect, useRef, useState } from 'react'
import { FiDownload, FiExternalLink, FiX } from 'react-icons/fi'
import { createPortal } from 'react-dom'
import { init } from 'pptx-preview'
import type { Arquivo } from '@/types/arquivo'
import { obterUrlArquivo } from '@/utils/formatadores'
import './VisualizadorPowerPoint.css'

interface VisualizadorPowerPointProps {
  arquivo: Arquivo | null
  onClose: () => void
  onBaixar: (arquivo: Arquivo) => void
}

export function VisualizadorPowerPoint({
  arquivo,
  onClose,
  onBaixar
}: VisualizadorPowerPointProps) {
  const containerRef = useRef<HTMLDivElement>(null)
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
    if (!arquivo || !containerRef.current) return

    let cancelado = false

    async function carregar() {
      setCarregando(true)
      setErro(null)

      if (containerRef.current) containerRef.current.innerHTML = ''

      try {
        const url = obterUrlArquivo(arquivo!.nome_arquivo)
        const response = await fetch(url)
        if (!response.ok) throw new Error('Erro ao carregar arquivo')

        const arrayBuffer = await response.arrayBuffer()

        if (cancelado || !containerRef.current) return

        const largura = Math.min(containerRef.current.clientWidth || 900, 1000)

        const previewer = init(containerRef.current, {
          width: largura,
          height: Math.round(largura * 0.5625)
        })

        await previewer.preview(arrayBuffer)
      } catch (err) {
        if (!cancelado) {
          console.error('Erro ao renderizar PPTX:', err)
          setErro('Não foi possível renderizar a apresentação')
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

  function abrirOfficeOnline() {
    if (!arquivo) return
    const url = `${window.location.origin}/uploads/${arquivo.nome_arquivo}`
    const officeUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`
    window.open(officeUrl, '_blank')
  }

  if (!arquivo) return null

  return createPortal(
    <div className="visualizador-ppt" onClick={onClose}>
      <div className="visualizador-ppt-caixa" onClick={(e) => e.stopPropagation()}>
        <header className="visualizador-ppt-topo">
          <h2 className="visualizador-ppt-titulo">{arquivo.nome_original}</h2>
          <div className="visualizador-ppt-acoes">
            <button
              type="button"
              className="visualizador-ppt-btn"
              onClick={abrirOfficeOnline}
              title="Abrir no Office Online"
            >
              <FiExternalLink />
            </button>
            <button
              type="button"
              className="visualizador-ppt-btn"
              onClick={() => onBaixar(arquivo)}
              title="Baixar"
            >
              <FiDownload />
            </button>
            <button
              type="button"
              className="visualizador-ppt-btn visualizador-ppt-btn-fechar"
              onClick={onClose}
              title="Fechar"
            >
              <FiX />
            </button>
          </div>
        </header>

        <div className="visualizador-ppt-conteudo">
          {carregando && (
            <div className="visualizador-ppt-estado">
              <div className="visualizador-ppt-spinner" />
              <p>Renderizando apresentação...</p>
            </div>
          )}

          {erro && !carregando && (
            <div className="visualizador-ppt-estado visualizador-ppt-estado-erro">
              <p>{erro}</p>
              <p>Você pode abrir no Office Online ou baixar o arquivo.</p>
              <div className="visualizador-ppt-erro-botoes">
                <button
                  type="button"
                  className="visualizador-ppt-btn-texto"
                  onClick={abrirOfficeOnline}
                >
                  <FiExternalLink /> Abrir no Office Online
                </button>
                <button
                  type="button"
                  className="visualizador-ppt-btn-texto"
                  onClick={() => onBaixar(arquivo)}
                >
                  <FiDownload /> Baixar
                </button>
              </div>
            </div>
          )}

          <div
            ref={containerRef}
            className="visualizador-ppt-render"
            style={{ display: carregando || erro ? 'none' : 'block' }}
          />
        </div>
      </div>
    </div>,
    document.body
  )
}
