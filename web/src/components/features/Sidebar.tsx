import { useEffect, useMemo, useRef, useState } from 'react'
import {
  FiChevronDown,
  FiChevronRight,
  FiCopy,
  FiEdit2,
  FiFolderPlus,
  FiMoreVertical,
  FiShare2,
  FiTrash2,
  FiUsers,
  FiX
} from 'react-icons/fi'
import { FaFolder, FaFolderOpen } from 'react-icons/fa'
import type { Pasta } from '@/types/arquivo'
import type {
  CompartilhamentoFeito,
  CompartilhamentoRecebido
} from '@/types/compartilhamento'
import './Sidebar.css'

interface SidebarProps {
  pastas: Pasta[]
  subpastasCompartilhadas?: Pasta[]
  pastaAtiva: number | null
  contagensArquivos: Record<number, number>
  compartilhadosComigo: CompartilhamentoRecebido[]
  compartilhadosPorMim: CompartilhamentoFeito[]
  onSelecionarPasta: (id: number | null) => void
  onNovaPasta: () => void
  onRenomearPasta: (pasta: Pasta) => void
  onDeletarPasta: (pasta: Pasta) => void
  onCompartilharPasta: (pasta: Pasta) => void
  onAdicionarExistentes: (pasta: Pasta) => void
  onAdicionarSubpasta: (pasta: Pasta) => void
  onAbrirCompartilhada: (pastaId: number) => void
  onEditarPermissao: (item: CompartilhamentoFeito) => void
  onRemoverCompartilhamentoFeito: (item: CompartilhamentoFeito) => void
  onRemoverCompartilhamentoRecebido: (item: CompartilhamentoRecebido) => void
}

const INDENTACAO = '\u3000'

export function Sidebar({
  pastas,
  subpastasCompartilhadas = [],
  pastaAtiva,
  contagensArquivos,
  compartilhadosComigo,
  compartilhadosPorMim,
  onSelecionarPasta,
  onNovaPasta,
  onRenomearPasta,
  onDeletarPasta,
  onCompartilharPasta,
  onAdicionarExistentes,
  onAdicionarSubpasta,
  onAbrirCompartilhada,
  onEditarPermissao,
  onRemoverCompartilhamentoFeito,
  onRemoverCompartilhamentoRecebido
}: SidebarProps) {
  const [expandidas, setExpandidas] = useState<Set<number>>(new Set())
  const [pastasVisiveis, setPastasVisiveis] = useState(true)
  const [menuAberto, setMenuAberto] = useState<number | null>(null)
  const refSidebar = useRef<HTMLElement>(null)

  useEffect(() => {
    function fechar(e: MouseEvent) {
      if (refSidebar.current && !refSidebar.current.contains(e.target as Node)) {
        setMenuAberto(null)
      }
    }
    document.addEventListener('mousedown', fechar)
    return () => document.removeEventListener('mousedown', fechar)
  }, [])

  function alternar(id: number) {
    setExpandidas((antigas) => {
      const novas = new Set(antigas)
      if (novas.has(id)) novas.delete(id)
      else novas.add(id)
      return novas
    })
  }

  function renderizarPasta(pasta: Pasta, nivel = 0): React.ReactNode {
    const filhas = pastas.filter((p) => p.pasta_pai_id === pasta.id)
    const temFilhos = filhas.length > 0
    const estaExpandida = expandidas.has(pasta.id)
    const estaAtiva = pastaAtiva === pasta.id
    const prefixo = nivel > 0 ? INDENTACAO.repeat(nivel - 1) + '└─ ' : ''
    const contagem = contagensArquivos?.[pasta.id] ?? 0

    return (
      <li key={pasta.id}>
        <div
          className={`sidebar-item ${estaAtiva ? 'sidebar-item-ativa' : ''}`}
          onClick={() => onSelecionarPasta(pasta.id)}
        >
          <button
            type="button"
            className="sidebar-item-toggle"
            onClick={(e) => {
              e.stopPropagation()
              if (temFilhos) alternar(pasta.id)
            }}
            style={{ visibility: temFilhos ? 'visible' : 'hidden' }}
            aria-label={estaExpandida ? 'Recolher' : 'Expandir'}
          >
            {estaExpandida ? <FiChevronDown /> : <FiChevronRight />}
          </button>

          {prefixo && <span className="sidebar-prefixo">{prefixo}</span>}

          <FaFolder className="sidebar-item-icon" />
          <span className="sidebar-item-nome">{pasta.nome}</span>

          {contagem > 0 && (
            <span className="sidebar-item-contagem" title={`${contagem} arquivo(s)`}>
              {contagem}
            </span>
          )}

          <button
            type="button"
            className="sidebar-item-menu"
            onClick={(e) => {
              e.stopPropagation()
              setMenuAberto(menuAberto === pasta.id ? null : pasta.id)
            }}
            aria-label="Ações da pasta"
          >
            <FiMoreVertical />
          </button>

          {menuAberto === pasta.id && (
            <div className="sidebar-item-dropdown" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="sidebar-item-dropdown-opcao"
                onClick={() => {
                  setMenuAberto(null)
                  onAdicionarSubpasta(pasta)
                }}
              >
                <FiFolderPlus />
                Adicionar subpasta
              </button>
              <button
                type="button"
                className="sidebar-item-dropdown-opcao"
                onClick={() => {
                  setMenuAberto(null)
                  onAdicionarExistentes(pasta)
                }}
              >
                <FiCopy />
                Adicionar existentes
              </button>
              <button
                type="button"
                className="sidebar-item-dropdown-opcao"
                onClick={() => {
                  setMenuAberto(null)
                  onCompartilharPasta(pasta)
                }}
              >
                <FiShare2 />
                Compartilhar
              </button>
              <button
                type="button"
                className="sidebar-item-dropdown-opcao"
                onClick={() => {
                  setMenuAberto(null)
                  onRenomearPasta(pasta)
                }}
              >
                <FiEdit2 />
                Renomear
              </button>
              <button
                type="button"
                className="sidebar-item-dropdown-opcao sidebar-item-dropdown-perigo"
                onClick={() => {
                  setMenuAberto(null)
                  onDeletarPasta(pasta)
                }}
              >
                <FiTrash2 />
                Excluir
              </button>
            </div>
          )}
        </div>

        {temFilhos && estaExpandida && (
          <ul className="sidebar-subpastas">
            {filhas.map((filha) => renderizarPasta(filha, nivel + 1))}
          </ul>
        )}
      </li>
    )
  }

  const pastasCompartilhadasUnificadas = useMemo(() => {
    const ids = new Set(pastas.map((p) => p.id))
    return subpastasCompartilhadas.filter((p) => !ids.has(p.id))
  }, [pastas, subpastasCompartilhadas])

  const pastasRaiz = pastas.filter((p) => !p.pasta_pai_id)

  return (
    <aside className="sidebar" ref={refSidebar}>
      <div className="sidebar-header">
        <h2 className="sidebar-titulo">
          <FaFolder className="sidebar-titulo-icon" />
          Pastas
        </h2>
        <button
          type="button"
          className="sidebar-nova-pasta"
          onClick={onNovaPasta}
          title="Criar nova pasta"
        >
          <FiFolderPlus />
          <span>Nova</span>
        </button>
      </div>

      <ul className="sidebar-lista">
        <li>
          <div
            className={`sidebar-item sidebar-item-raiz ${
              pastaAtiva === null ? 'sidebar-item-ativa' : ''
            }`}
            onClick={() => onSelecionarPasta(null)}
          >
            {pastas.length > 0 ? (
              <button
                type="button"
                className="sidebar-item-toggle"
                onClick={(e) => {
                  e.stopPropagation()
                  setPastasVisiveis((v) => !v)
                }}
                aria-label={pastasVisiveis ? 'Recolher pastas' : 'Expandir pastas'}
              >
                {pastasVisiveis ? <FiChevronDown /> : <FiChevronRight />}
              </button>
            ) : (
              <span className="sidebar-item-toggle" style={{ visibility: 'hidden' }}>
                <FiChevronRight />
              </span>
            )}

            <FaFolderOpen className="sidebar-item-icon" />
            <span className="sidebar-item-nome">Todos os arquivos</span>
          </div>
        </li>

        {pastasVisiveis && pastasRaiz.map((p) => renderizarPasta(p))}

        {pastas.length === 0 && (
          <li className="sidebar-vazio-pastas">Nenhuma pasta ainda</li>
        )}
      </ul>

      <div className="sidebar-secao">
        <h3 className="sidebar-secao-titulo">
          <FiShare2 className="sidebar-secao-icon" />
          Compartilhados comigo
          {compartilhadosComigo.length > 0 && (
            <span className="sidebar-secao-contagem">{compartilhadosComigo.length}</span>
          )}
        </h3>
        {compartilhadosComigo.length === 0 ? (
          <p className="sidebar-vazio">Nenhuma pasta compartilhada</p>
        ) : (
          <ul className="sidebar-lista">
            {compartilhadosComigo.map((c) => {
              const subpastasDesta = pastasCompartilhadasUnificadas.filter(
                (p) => p.pasta_pai_id === c.id
              )
              const temSubpastas = subpastasDesta.length > 0
              const expandida = expandidas.has(c.id)

              function renderizarSubpastaCompartilhada(sub: Pasta, nivel = 1): React.ReactNode {
                const filhas = pastasCompartilhadasUnificadas.filter(
                  (p) => p.pasta_pai_id === sub.id
                )
                const temFilhos = filhas.length > 0
                const estaExpandida = expandidas.has(sub.id)
                const prefixo = INDENTACAO.repeat(nivel - 1) + '└─ '

                return (
                  <li key={sub.id}>
                    <div
                      className={`sidebar-item ${
                        pastaAtiva === sub.id ? 'sidebar-item-ativa' : ''
                      }`}
                      onClick={() => onAbrirCompartilhada(sub.id)}
                    >
                      <button
                        type="button"
                        className="sidebar-item-toggle"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (temFilhos) alternar(sub.id)
                        }}
                        style={{ visibility: temFilhos ? 'visible' : 'hidden' }}
                      >
                        {estaExpandida ? <FiChevronDown /> : <FiChevronRight />}
                      </button>
                      <span className="sidebar-prefixo">{prefixo}</span>
                      <FaFolder className="sidebar-item-icon" />
                      <span className="sidebar-item-nome">{sub.nome}</span>
                    </div>
                    {temFilhos && estaExpandida && (
                      <ul className="sidebar-subpastas">
                        {filhas.map((f) => renderizarSubpastaCompartilhada(f, nivel + 1))}
                      </ul>
                    )}
                  </li>
                )
              }

              return (
                <li key={c.compartilhamento_id}>
                  <div
                    className={`sidebar-item ${
                      pastaAtiva === c.id ? 'sidebar-item-ativa' : ''
                    }`}
                    onClick={() => onAbrirCompartilhada(c.id)}
                    title={`Compartilhada por ${c.proprietario_email}`}
                  >
                    <button
                      type="button"
                      className="sidebar-item-toggle"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (temSubpastas) alternar(c.id)
                      }}
                      style={{ visibility: temSubpastas ? 'visible' : 'hidden' }}
                    >
                      {expandida ? <FiChevronDown /> : <FiChevronRight />}
                    </button>
                    <FaFolder className="sidebar-item-icon" />
                    <span className="sidebar-item-nome">{c.nome}</span>
                    <span
                      className={`sidebar-item-permissao sidebar-item-permissao-${c.permissao}`}
                    >
                      {c.permissao}
                    </span>
                    <button
                      type="button"
                      className="sidebar-item-acao"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemoverCompartilhamentoRecebido(c)
                      }}
                      title="Remover da minha lista"
                    >
                      <FiX />
                    </button>
                  </div>
                  {temSubpastas && expandida && (
                    <ul className="sidebar-subpastas">
                      {subpastasDesta.map((sub) => renderizarSubpastaCompartilhada(sub, 1))}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="sidebar-secao">
        <h3 className="sidebar-secao-titulo">
          <FiUsers className="sidebar-secao-icon" />
          Compartilhados por mim
          {compartilhadosPorMim.length > 0 && (
            <span className="sidebar-secao-contagem">{compartilhadosPorMim.length}</span>
          )}
        </h3>
        {compartilhadosPorMim.length === 0 ? (
          <p className="sidebar-vazio">Você não compartilhou nada ainda</p>
        ) : (
          <ul className="sidebar-lista">
            {compartilhadosPorMim.map((c) => (
              <li key={c.id}>
                <div
                  className={`sidebar-item sidebar-item-compartilhado ${
                    pastaAtiva === c.pasta_id ? 'sidebar-item-ativa' : ''
                  }`}
                  onClick={() => onSelecionarPasta(c.pasta_id)}
                  title={`Abrir pasta ${c.pasta_nome}`}
                >
                  <FaFolder className="sidebar-item-icon" />
                  <div className="sidebar-item-info">
                    <span className="sidebar-item-nome">{c.pasta_nome}</span>
                    <span className="sidebar-item-subtexto">
                      {c.usuario_email}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="sidebar-item-acao"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditarPermissao(c)
                    }}
                    title="Editar permissão"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    type="button"
                    className="sidebar-item-acao sidebar-item-acao-perigo"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemoverCompartilhamentoFeito(c)
                    }}
                    title="Remover compartilhamento"
                  >
                    <FiX />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}
