import { useEffect, useMemo, useState } from 'react'
import { FiCheckSquare, FiCopy, FiFolder, FiSearch, FiSquare } from 'react-icons/fi'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/hooks/useToast'
import { moverArquivo } from '@/services/arquivos'
import { ImagemCarregando } from '@/components/ui/ImagemCarregando'
import type { Arquivo, Pasta } from '@/types/arquivo'
import { formatarTamanho, obterUrlArquivo } from '@/utils/formatadores'
import { obterEstiloTipo } from '@/utils/tiposArquivo'
import './ModalSeletorArquivos.css'

interface ModalSeletorArquivosProps {
  aberto: boolean
  onFechar: () => void
  pastaDestinoId: number | null
  arquivosDisponiveis: Arquivo[]
  pastas: Pasta[]
  onAdicionados: (idsAdicionados: number[]) => void
}

export function ModalSeletorArquivos({
  aberto,
  onFechar,
  pastaDestinoId,
  arquivosDisponiveis,
  pastas,
  onAdicionados
}: ModalSeletorArquivosProps) {
  const toast = useToast()
  const [busca, setBusca] = useState('')
  const [selecionados, setSelecionados] = useState<Set<number>>(new Set())
  const [adicionando, setAdicionando] = useState(false)

  useEffect(() => {
    if (!aberto) return
    setBusca('')
    setSelecionados(new Set())
  }, [aberto])

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    const candidatos = arquivosDisponiveis.filter(
      (a) => a.pasta_id !== pastaDestinoId
    )

    if (!termo) return candidatos
    return candidatos.filter((a) => a.nome_original.toLowerCase().includes(termo))
  }, [arquivosDisponiveis, pastaDestinoId, busca])

  function alternar(id: number) {
    setSelecionados((atual) => {
      const novos = new Set(atual)
      if (novos.has(id)) novos.delete(id)
      else novos.add(id)
      return novos
    })
  }

  function alternarTodos() {
    if (selecionados.size === filtrados.length) {
      setSelecionados(new Set())
    } else {
      setSelecionados(new Set(filtrados.map((a) => a.id)))
    }
  }

  async function adicionarSelecionados() {
    if (selecionados.size === 0) return

    setAdicionando(true)
    let sucessos = 0
    let falhas = 0
    const idsOk: number[] = []

    for (const id of selecionados) {
      try {
        await moverArquivo(id, pastaDestinoId)
        sucessos++
        idsOk.push(id)
      } catch {
        falhas++
      }
    }

    setAdicionando(false)

    if (sucessos > 0) {
      onAdicionados(idsOk)
      toast.sucesso(
        `${sucessos} arquivo${sucessos > 1 ? 's' : ''} adicionado${sucessos > 1 ? 's' : ''}`
      )
      onFechar()
    }

    if (falhas > 0) {
      toast.erro(`${falhas} arquivo${falhas > 1 ? 's' : ''} falhou`)
    }
  }

  const todosSelecionados = filtrados.length > 0 && selecionados.size === filtrados.length

  return (
    <Modal
      open={aberto}
      onClose={onFechar}
      title="Adicionar arquivos existentes"
      icon={<FiCopy />}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onFechar} disabled={adicionando}>
            Cancelar
          </Button>
          <Button
            onClick={adicionarSelecionados}
            loading={adicionando}
            loadingText="Adicionando..."
            disabled={selecionados.size === 0}
            icon={<FiCheckSquare />}
          >
            Adicionar {selecionados.size > 0 ? `(${selecionados.size})` : ''}
          </Button>
        </>
      }
    >
      <div className="seletor-conteudo">
        <div className="seletor-busca">
          <FiSearch className="seletor-busca-icon" />
          <input
            type="text"
            className="seletor-busca-input"
            placeholder="Buscar arquivos pelo nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {filtrados.length > 0 && (
          <button
            type="button"
            className="seletor-todos"
            onClick={alternarTodos}
            disabled={adicionando}
          >
            {todosSelecionados ? <FiCheckSquare /> : <FiSquare />}
            {todosSelecionados ? 'Desmarcar todos' : 'Selecionar todos'}
          </button>
        )}

        <div className="seletor-lista">
          {filtrados.length === 0 ? (
            <div className="seletor-vazio">
              <FiFolder />
              <p>Nenhum arquivo disponível para adicionar</p>
              <small>
                Arquivos que já estão nesta pasta não aparecem aqui
              </small>
            </div>
          ) : (
            filtrados.map((arquivo) => {
              const estilo = obterEstiloTipo(arquivo.tipo_arquivo)
              const marcado = selecionados.has(arquivo.id)

              return (
                <button
                  key={arquivo.id}
                  type="button"
                  className={`seletor-item ${marcado ? 'seletor-item-marcado' : ''}`}
                  onClick={() => alternar(arquivo.id)}
                  disabled={adicionando}
                >
                  <span className="seletor-checkbox">
                    {marcado ? <FiCheckSquare /> : <FiSquare />}
                  </span>

                  <span className="seletor-preview">
                    {arquivo.tipo_arquivo === 'imagem' ? (
                      <ImagemCarregando
                        src={obterUrlArquivo(arquivo.nome_arquivo)}
                        alt=""
                      />
                    ) : (
                      <span style={{ color: estilo.cor }}>{estilo.icone}</span>
                    )}
                  </span>

                  <span className="seletor-info">
                    <span className="seletor-nome">{arquivo.nome_original}</span>
                    <span className="seletor-meta">
                      <span style={{ color: estilo.cor }}>{estilo.label}</span>
                      <span>·</span>
                      <span>{formatarTamanho(arquivo.tamanho)}</span>
                      <span>·</span>
                      <span>
                        <FiFolder />{' '}
                        {arquivo.pasta_id
                          ? (pastas.find((p) => p.id === arquivo.pasta_id)?.nome ?? 'Pasta')
                          : 'Raiz'}
                      </span>
                    </span>
                  </span>
                </button>
              )
            })
          )}
        </div>
      </div>
    </Modal>
  )
}
