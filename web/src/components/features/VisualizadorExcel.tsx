import { useEffect, useState } from 'react'
import { FiDownload, FiX } from 'react-icons/fi'
import { createPortal } from 'react-dom'
import * as XLSX from 'xlsx'
import type { Arquivo } from '@/types/arquivo'
import { obterUrlArquivo } from '@/utils/formatadores'
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

export function VisualizadorExcel({ arquivo, onClose, onBaixar }: VisualizadorExcelProps) {
  const [planilhas, setPlanilhas] = useState<PlanilhaRenderizada[]>([])
  const [planilhaAtiva, setPlanilhaAtiva] = useState(0)
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
      setPlanilhas([])
      setPlanilhaAtiva(0)

      try {
        const url = obterUrlArquivo(arquivo!.nome_arquivo)
        const response = await fetch(url)
        if (!response.ok) throw new Error('Erro ao carregar arquivo')

        const arrayBuffer = await response.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer, { type: 'array' })

        const renderizadas: PlanilhaRenderizada[] = workbook.SheetNames.map((nome) => {
          const sheet = workbook.Sheets[nome]
          const html = XLSX.utils.sheet_to_html(sheet, {
            id: `sheet-${nome}`,
            editable: false
          })
          return { nome, html }
        })

        if (!cancelado) setPlanilhas(renderizadas)
      } catch (err) {
        if (!cancelado) {
          console.error('Erro ao ler Excel:', err)
          setErro('Não foi possível renderizar a planilha')
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

        {planilhas.length > 1 && (
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
          {carregando ? (
            <div className="visualizador-excel-estado">
              <div className="visualizador-excel-spinner" />
              <p>Lendo planilha...</p>
            </div>
          ) : erro ? (
            <div className="visualizador-excel-estado visualizador-excel-estado-erro">
              <p>{erro}</p>
              <p>Você pode baixar o arquivo para abri-lo no Excel.</p>
            </div>
          ) : planilhas.length === 0 ? (
            <div className="visualizador-excel-estado">
              <p>Nenhuma planilha encontrada</p>
            </div>
          ) : (
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
