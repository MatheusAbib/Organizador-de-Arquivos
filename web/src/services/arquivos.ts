import { api } from './api'
import type { Arquivo, Pasta } from '@/types/arquivo'

export async function listarArquivos(usuarioId: number): Promise<Arquivo[]> {
  const { data } = await api.get<Arquivo[]>(`/arquivos/${usuarioId}`)
  return data
}

export async function listarArquivosEmPastas(usuarioId: number): Promise<Arquivo[]> {
  const { data } = await api.get<Arquivo[]>(`/arquivos/${usuarioId}/em-pastas`)
  return data
}

export async function listarPastas(usuarioId: number): Promise<Pasta[]> {
  const { data } = await api.get<Pasta[]>(`/pastas/${usuarioId}`)
  return data
}

export async function criarPasta(
  usuarioId: number,
  nome: string,
  pastaPaiId: number | null
): Promise<Pasta> {
  const { data } = await api.post<{ pasta: Pasta }>('/pastas', {
    usuario_id: usuarioId,
    nome,
    pasta_pai_id: pastaPaiId
  })
  return data.pasta
}

export async function renomearPasta(id: number, nome: string): Promise<void> {
  await api.put(`/pastas/${id}`, { nome })
}

export async function deletarPasta(id: number): Promise<void> {
  await api.delete(`/pastas/${id}`)
}

export async function uploadArquivo(
  arquivo: File,
  usuarioId: number,
  pastaId: number | null
): Promise<void> {
  const formData = new FormData()
  formData.append('arquivo', arquivo)
  formData.append('usuario_id', String(usuarioId))
  formData.append('pasta_id', pastaId ? String(pastaId) : '')

  await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export async function deletarArquivo(id: number): Promise<void> {
  await api.delete(`/arquivos/${id}`)
}

export async function renomearArquivo(id: number, nomeOriginal: string): Promise<void> {
  await api.put(`/arquivos/${id}`, { nome_original: nomeOriginal })
}

export async function favoritarArquivo(id: number, favorito: boolean): Promise<void> {
  await api.put(`/arquivos/${id}/favoritar`, { favorito })
}

export async function comentarArquivo(id: number, comentario: string): Promise<void> {
  await api.post(`/arquivos/${id}/comentario`, { comentario })
}

export async function moverArquivo(id: number, pastaId: number | null): Promise<void> {
  await api.put(`/arquivos/${id}/mover`, { pasta_id: pastaId })
}

export async function obterConteudoPasta(
  pastaId: number,
  usuarioId: number
): Promise<{ pastas: Pasta[]; arquivos: Arquivo[] }> {
  const { data } = await api.get<{ pastas: Pasta[]; arquivos: Arquivo[] }>(
    `/pasta/${pastaId}/conteudo`,
    { params: { usuario_id: usuarioId } }
  )
  return data
}
