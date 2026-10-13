import { useState } from 'react'
import { FiDownload, FiEdit2, FiFolder, FiFolderPlus, FiMessageSquare, FiTrash2, FiStar } from 'react-icons/fi'
import { FaStar } from 'react-icons/fa'
import { ImagemCarregando } from '@/components/ui/ImagemCarregando'
import type { Arquivo, Pasta } from '@/types/arquivo'
import { formatarData, formatarTamanho, obterUrlArquivo } from '@/utils/formatadores'
import { obterEstiloTipo } from '@/utils/tiposArquivo'
import './CardArquivo.css'

interface CardArquivoProps {
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

export function CardArquivo({
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
}: CardArquivoProps) {
  const [erroImagem, setErroImagem] = useState(false)
  const estilo = obterEstiloTipo(arquivo.tipo_arquivo)
  const favorito = arquivo.favorito === 1 || arquivo.favorito === true

  const mostrarPreview = arquivo.tipo_arquivo === 'imagem' && !erroImagem
  const url = obterUrlArquivo(arquivo.nome_arquivo)

  const estaNaRaiz = !arquivo.pasta_id
  const nomePasta = pasta?.nome ?? ''

  return (
    <div className="card-arquivo">
      <div className="card-arquivo-topo">
        <span
          className="card-arquivo-tipo"
          style={{
            background: `${estilo.cor}1a`,
            color: estilo.cor
          }}
        >
          {estilo.label}
        </span>

        <div className="card-arquivo-acoes-topo">
          <button
            type="button"
            className={`card-arquivo-acao ${
              arquivo.comentario ? 'card-arquivo-acao-comentario' : ''
            }`}
            onClick={() => onComentar?.(arquivo)}
            title={arquivo.comentario ? 'Editar comentário' : 'Adicionar comentário'}
          >
            <FiMessageSquare />
          </button>
          {podeEditar && (
            <button
              type="button"
              className="card-arquivo-acao"
              onClick={() => onMover?.(arquivo)}
              title="Mover para pasta"
            >
              <FiFolderPlus />
            </button>
          )}
          {podeEditar && (
            <button
              type="button"
              className="card-arquivo-acao card-arquivo-acao-perigo"
              onClick={() => onDeletar?.(arquivo)}
              title="Excluir"
            >
              <FiTrash2 />
            </button>
          )}
          <button
            type="button"
            className={`card-arquivo-acao ${favorito ? 'card-arquivo-acao-favorito' : ''}`}
            onClick={() => onFavoritar?.(arquivo)}
            title={favorito ? 'Remover dos favoritos' : 'Favoritar'}
          >
            {favorito ? <FaStar /> : <FiStar />}
          </button>
        </div>
      </div>

      <div
        className={`card-arquivo-preview ${mostrarPreview ? '' : 'card-arquivo-preview-icone'}`}
        onClick={() => onAbrir?.(arquivo)}
      >
        {mostrarPreview ? (
          <ImagemCarregando
            src={url}
            alt={arquivo.nome_original}
            onError={() => setErroImagem(true)}
          />
        ) : (
          <span
            className="card-arquivo-icone-grande"
            style={{ color: estilo.cor }}
          >
            {estilo.icone}
          </span>
        )}
      </div>

      <div className="card-arquivo-info">
        <div className="card-arquivo-nome-linha">
          <h3 className="card-arquivo-nome" title={arquivo.nome_original}>
            {arquivo.nome_original}
          </h3>
          {podeEditar && (
            <button
              type="button"
              className="card-arquivo-renomear"
              onClick={() => onRenomear?.(arquivo)}
              title="Renomear"
            >
              <FiEdit2 />
            </button>
          )}
        </div>

        <div className="card-arquivo-meta">
          <span>{formatarTamanho(arquivo.tamanho)}</span>
          <span>·</span>
          <span>{formatarData(arquivo.data_upload)}</span>
        </div>
      </div>

      <button
        type="button"
        className="card-arquivo-pasta"
        onClick={() => {
          if (arquivo.pasta_id) onAbrirPasta?.(arquivo.pasta_id)
        }}
        title={estaNaRaiz ? 'Arquivo na raiz' : `Ir para pasta ${nomePasta}`}
        disabled={estaNaRaiz}
      >
        <FiFolder />
        <span className="card-arquivo-pasta-nome">
          {estaNaRaiz ? 'Raiz' : nomePasta}
        </span>
      </button>

      <button
        type="button"
        className="card-arquivo-baixar"
        onClick={() => onBaixar?.(arquivo)}
        title="Baixar"
      >
        <FiDownload />
      </button>
    </div>
  )
}
