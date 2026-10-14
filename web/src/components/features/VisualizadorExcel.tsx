import { useEffect, useState } from 'react'
import { FiDownload, FiFileText, FiX } from 'react-icons/fi'
import { createPortal } from 'react-dom'
import * as XLSX from 'xlsx'
import type { Arquivo } from '@/types/arquivo'
import { obterUrlArquivo } from '@/utils/formatadores'
import { ErroVisualizador } from '@/components/ui/ErroVisualizador'
import './VisualizadorExcel.css'

interface VisualizadorExcelProps {
  arquivo: Arquivo | null
  onClose: () => void
  onBaixar: (arquivo: Arquivo) => void
}

interface PlanilhaRenderizada {
  nome: string
  html: string
}

type Estado = 'carregando' | 'ok' | 'erro'

export function VisualizadorExcel({ arquivo, onClose, onBaixar }: VisualizadorExcelProps) {
  const [planilhas, setPlanilhas] = useState<PlanilhaRenderizada[]>([])
  const [planilhaAtiva, setPlanilhaAtiva] = useState(0)
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
    setPlanilhas([])
    setPlanilhaAtiva(0)

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
          setMensagemErro('O arquivo não é uma planilha válida')
          return
        }

        const arrayBuffer = await response.arrayBuffer()

        if (cancelado) return

        const workbook = XLSX.read(arrayBuffer, { type: 'array' })

        const renderizadas: PlanilhaRenderizada[] = workbook.SheetNames.map((nome) => {
          const sheet = workbook.Sheets[nome]
          const html = XLSX.utils.sheet_to_html(sheet, {
            id: `sheet-${nome}`,
            editable: false
          })
          return { nome, html }
        })

        if (!cancelado) {
          setPlanilhas(renderizadas)
          setEstado('ok')
        }
      } catch (err) {
        if (!cancelado) {
          console.error('Erro ao ler Excel:', err)
          setEstado('erro')
          setMensagemErro('Não foi possível processar a planilha')
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
    <div className="visualizador-excel" onClick={onClose}>
      <div className="visualizador-excel-caixa" onClick={(e) => e.stopPropagation()}>
        <header className="visualizador-excel-topo">
          <h2 className="visualizador-excel-titulo">{arquivo.nome_original}</h2>
          <div className="visualizador-excel-acoes">
            <button
              type="button"
              className="visualizador-excel-btn"
              onClick={() => onBaixar(arquivo)}
              title="Baixar"
            >
              <FiDownload />
            </button>
            <button
              type="button"
              className="visualizador-excel-btn visualizador-excel-btn-fechar"
              onClick={onClose}
              title="Fechar"
            >
              <FiX />
            </button>
          </div>
        </header>

        {estado === 'ok' && planilhas.length > 1 && (
          <div className="visualizador-excel-abas" role="tablist">
            {planilhas.map((p, i) => (
              <button
                key={p.nome}
                type="button"
                role="tab"
                aria-selected={i === planilhaAtiva}
                className={`visualizador-excel-aba ${
                  i === planilhaAtiva ? 'visualizador-excel-aba-ativa' : ''
                }`}
                onClick={() => setPlanilhaAtiva(i)}
              >
                {p.nome}
              </button>
            ))}
          </div>
        )}

        <div className="visualizador-excel-conteudo">
          {estado === 'carregando' && (
            <div className="visualizador-excel-loading">
              <div className="visualizador-excel-spinner" />
              <p>Lendo planilha...</p>
            </div>
          )}

          {estado === 'erro' && (
            <ErroVisualizador
              icone={<FiFileText />}
              titulo="Não foi possível abrir a planilha"
              descricao={mensagemErro}
              onBaixar={() => onBaixar(arquivo)}
            />
          )}

          {estado === 'ok' && planilhas.length === 0 && (
            <ErroVisualizador
              icone={<FiFileText />}
              titulo="Planilha vazia"
              descricao="Nenhuma aba encontrada neste arquivo"
              onBaixar={() => onBaixar(arquivo)}
            />
          )}

          {estado === 'ok' && planilhas.length > 0 && (
            <div
              className="visualizador-excel-tabela"
              dangerouslySetInnerHTML={{ __html: planilhas[planilhaAtiva].html }}
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
