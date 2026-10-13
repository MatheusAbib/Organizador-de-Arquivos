import { api } from './api'
import type {
  CompartilhamentoFeito,
  CompartilhamentoRecebido,
  Permissao
} from '@/types/compartilhamento'

export async function listarCompartilhadosComigo(
  usuarioId: number
): Promise<CompartilhamentoRecebido[]> {
  const { data } = await api.get<CompartilhamentoRecebido[]>(
    `/compartilhados/${usuarioId}`
  )
  return data
}

export async function listarCompartilhadosPorMim(
  usuarioId: number
): Promise<CompartilhamentoFeito[]> {
  const { data } = await api.get<CompartilhamentoFeito[]>(
    `/compartilhados-por-mim/${usuarioId}`
  )
  return data
}

export async function compartilharPasta(
  pastaId: number,
  email: string,
  permissao: Permissao
): Promise<void> {
  await api.post('/compartilhar', {
    pasta_id: pastaId,
    email_compartilhado: email,
    permissao
  })
}

export async function editarPermissao(
  pastaId: number,
  usuarioId: number,
  permissao: Permissao
): Promise<void> {
  await api.put(`/compartilhamentos/${pastaId}/${usuarioId}`, { permissao })
}

export async function removerCompartilhamento(
  pastaId: number,
  usuarioId: number
): Promise<void> {
  await api.delete(`/compartilhamentos/${pastaId}`, {
    params: { usuario_id: usuarioId }
  })
}
