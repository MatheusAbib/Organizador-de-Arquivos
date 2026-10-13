import { useState } from 'react'
import {
  FiDownload,
  FiEdit2,
  FiFolder,
  FiFolderPlus,
  FiMessageSquare,
  FiStar,
  FiTrash2
} from 'react-icons/fi'
import { FaStar } from 'react-icons/fa'
import { ImagemCarregando } from '@/components/ui/ImagemCarregando'
import type { Arquivo, Pasta } from '@/types/arquivo'
import { formatarData, formatarTamanho, obterUrlArquivo } from '@/utils/formatadores'
import { obterEstiloTipo } from '@/utils/tiposArquivo'
import './LinhaArquivo.css'

interface LinhaArquivoProps {
  arquivo: Arquivo
  pasta?: Pasta | null
  onFavoritar?: (arquivo: Arquivo) => void
  onDeletar?: (arquivo: Arquivo) => void
  onAbrir?: (arquivo: Arquivo) => void
  onBaixar?: (arquivo: Arquivo) => void
  onRenomear?: (arquivo: Arquivo) => void
  onAbrirPasta?: (pastaId: number) => void
  onMover?: (arquivo: Arquivo) => void
  onComentar?: (arquivo: Arquivo) => void
  podeEditar?: boolean
}

export function LinhaArquivo({
  arquivo,
  pasta,
  onFavoritar,
  onDeletar,
  onAbrir,
  onBaixar,
  onRenomear,
  onAbrirPasta,
  onMover,
  onComentar,
  podeEditar = true
}: LinhaArquivoProps) {
  const [erroImagem, setErroImagem] = useState(false)
  const estilo = obterEstiloTipo(arquivo.tipo_arquivo)
  const favorito = arquivo.favorito === 1 || arquivo.favorito === true
  const url = obterUrlArquivo(arquivo.nome_arquivo)
  const mostrarPreview = arquivo.tipo_arquivo === 'imagem' && !erroImagem
  const estaNaRaiz = !arquivo.pasta_id

  return (
    <div className="linha-arquivo">
      <div className="linha-arquivo-preview" onClick={() => onAbrir?.(arquivo)}>
        {mostrarPreview ? (
          <ImagemCarregando
            src={url}
            alt={arquivo.nome_original}
            onError={() => setErroImagem(true)}
          />
        ) : (
          <span
            className="linha-arquivo-icone"
            style={{ color: estilo.cor }}
          >
            {estilo.icone}
          </span>
        )}
      </div>

      <div className="linha-arquivo-info">
        <div className="linha-arquivo-nome-linha">
          <h3 className="linha-arquivo-nome" title={arquivo.nome_original}>
            {arquivo.nome_original}
          </h3>
          {podeEditar && (
            <button
              type="button"
              className="linha-arquivo-renomear"
              onClick={() => onRenomear?.(arquivo)}
              title="Renomear"
            >
              <FiEdit2 />
            </button>
          )}
        </div>

        <div className="linha-arquivo-meta">
          <span
            className="linha-arquivo-tipo"
            style={{
              background: `${estilo.cor}1a`,
              color: estilo.cor
            }}
          >
            {estilo.label}
          </span>
          <span>{formatarTamanho(arquivo.tamanho)}</span>
          <span>·</span>
          <span>{formatarData(arquivo.data_upload)}</span>
          <span>·</span>
          <button
            type="button"
            className="linha-arquivo-pasta"
            onClick={() => {
              if (arquivo.pasta_id) onAbrirPasta?.(arquivo.pasta_id)
            }}
            disabled={estaNaRaiz}
            title={estaNaRaiz ? 'Arquivo na raiz' : `Ir para pasta ${pasta?.nome ?? ''}`}
          >
            <FiFolder />
            {estaNaRaiz ? 'Raiz' : pasta?.nome ?? '—'}
          </button>
        </div>
      </div>

      <div className="linha-arquivo-acoes">
        <button
          type="button"
          className="linha-arquivo-acao"
          onClick={() => onBaixar?.(arquivo)}
          title="Baixar"
        >
          <FiDownload />
        </button>
        <button
          type="button"
          className={`linha-arquivo-acao ${
            arquivo.comentario ? 'linha-arquivo-acao-comentario-ativo' : ''
          }`}
          onClick={() => onComentar?.(arquivo)}
          title={arquivo.comentario ? 'Editar comentário' : 'Adicionar comentário'}
        >
          <FiMessageSquare />
        </button>
        {podeEditar && (
          <button
            type="button"
            className="linha-arquivo-acao"
            onClick={() => onMover?.(arquivo)}
            title="Mover para pasta"
          >
            <FiFolderPlus />
          </button>
        )}
        {podeEditar && (
          <button
            type="button"
            className="linha-arquivo-acao linha-arquivo-acao-perigo"
            onClick={() => onDeletar?.(arquivo)}
            title="Excluir"
          >
            <FiTrash2 />
          </button>
        )}
        <button
          type="button"
          className={`linha-arquivo-acao ${favorito ? 'linha-arquivo-acao-favorito' : ''}`}
          onClick={() => onFavoritar?.(arquivo)}
          title={favorito ? 'Remover dos favoritos' : 'Favoritar'}
        >
          {favorito ? <FaStar /> : <FiStar />}
        </button>
      </div>
    </div>
  )
}
