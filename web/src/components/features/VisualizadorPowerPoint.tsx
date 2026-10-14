import { useEffect, useRef, useState } from 'react'
import { FiDownload, FiExternalLink, FiFileText, FiX } from 'react-icons/fi'
import { createPortal } from 'react-dom'
import { init } from 'pptx-preview'
import type { Arquivo } from '@/types/arquivo'
import { obterUrlArquivo } from '@/utils/formatadores'
import { ErroVisualizador } from '@/components/ui/ErroVisualizador'
import './VisualizadorPowerPoint.css'

interface VisualizadorPowerPointProps {
  arquivo: Arquivo | null
  onClose: () => void
  onBaixar: (arquivo: Arquivo) => void
}

type Estado = 'carregando' | 'ok' | 'erro'

export function VisualizadorPowerPoint({
  arquivo,
  onClose,
  onBaixar
}: VisualizadorPowerPointProps) {
  const containerRef = useRef<HTMLDivElement>(null)
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
    if (!arquivo || !containerRef.current) return

    let cancelado = false
    setEstado('carregando')
    setMensagemErro('')

    if (containerRef.current) containerRef.current.innerHTML = ''

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
          setMensagemErro('O arquivo não é uma apresentação válida')
          return
        }

        const arrayBuffer = await response.arrayBuffer()

        if (cancelado || !containerRef.current) return

        const largura = Math.min(containerRef.current.clientWidth || 900, 1000)

        const previewer = init(containerRef.current, {
          width: largura,
          height: Math.round(largura * 0.5625)
        })

        await previewer.preview(arrayBuffer)

        if (!cancelado) setEstado('ok')
      } catch (err) {
        if (!cancelado) {
          console.error('Erro ao renderizar PPTX:', err)
          setEstado('erro')
          setMensagemErro('Não foi possível renderizar a apresentação')
        }
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
            {estado === 'ok' && (
              <button
                type="button"
                className="visualizador-ppt-btn"
                onClick={abrirOfficeOnline}
                title="Abrir no Office Online"
              >
                <FiExternalLink />
              </button>
            )}
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
          {estado === 'carregando' && (
            <div className="visualizador-ppt-estado">
              <div className="visualizador-ppt-spinner" />
              <p>Renderizando apresentação...</p>
            </div>
          )}

          {estado === 'erro' && (
            <ErroVisualizador
              icone={<FiFileText />}
              titulo="Não foi possível abrir a apresentação"
              descricao={mensagemErro}
              onBaixar={() => onBaixar(arquivo)}
            />
          )}

          <div
            ref={containerRef}
            className="visualizador-ppt-render"
            style={{ display: estado !== 'ok' ? 'none' : 'block' }}
          />
        </div>
      </div>
    </div>,
    document.body
  )
}
