export type TipoArquivo =
  | 'pdf'
  | 'word'
  | 'excel'
  | 'powerpoint'
  | 'imagem'
  | 'texto'
  | 'video'
  | 'outros'

export interface Arquivo {
  id: number
  usuario_id: number
  nome_original: string
  nome_arquivo: string
  tipo_arquivo: TipoArquivo
  tamanho: number
  data_upload: string
  pasta_id: number | null
  comentario: string | null
  favorito: 0 | 1 | boolean
}

export interface Pasta {
  id: number
  usuario_id: number
  nome: string
  pasta_pai_id: number | null
  favorito: 0 | 1 | boolean
  data_criacao: string
}
