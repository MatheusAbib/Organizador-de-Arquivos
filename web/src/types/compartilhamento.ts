export type Permissao = 'visualizar' | 'editar'

export interface CompartilhamentoRecebido {
  id: number
  usuario_id: number
  nome: string
  pasta_pai_id: number | null
  favorito: 0 | 1 | boolean
  data_criacao: string
  compartilhamento_id: number
  permissao: Permissao
  proprietario_email: string
}

export interface CompartilhamentoFeito {
  id: number
  pasta_id: number
  permissao: Permissao
  pasta_nome: string
  usuario_email: string
  usuario_id: number
}
