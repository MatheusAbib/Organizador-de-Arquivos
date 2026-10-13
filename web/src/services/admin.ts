import { api } from './api'
import type { Usuario } from '@/types/auth'
import type { Arquivo, Pasta } from '@/types/arquivo'

export interface UsuarioAdmin extends Usuario {
  status: 'ativo' | 'inativo'
  inativacao_justificativa: string | null
  data_criacao: string
}

export async function listarUsuarios(): Promise<UsuarioAdmin[]> {
  const { data } = await api.get<UsuarioAdmin[]>('/admin/usuarios')
  return data
}

export async function listarTodosArquivos(): Promise<Arquivo[]> {
  const { data } = await api.get<Arquivo[]>('/admin/arquivos')
  return data
}

export async function listarTodasPastas(): Promise<Pasta[]> {
  const { data } = await api.get<Pasta[]>('/admin/pastas')
  return data
}

export async function atualizarUsuario(
  id: number,
  dados: { nome: string; email: string; senha?: string }
): Promise<void> {
  await api.put(`/admin/usuarios/${id}`, dados)
}

export async function inativarUsuario(id: number, justificativa: string): Promise<void> {
  await api.put(`/admin/usuarios/${id}/inativar`, { justificativa })
}

export async function reativarUsuario(id: number): Promise<void> {
  await api.put(`/admin/usuarios/${id}/reativar`)
}

export async function tornarAdmin(id: number): Promise<void> {
  await api.put(`/admin/usuarios/${id}/tornar-admin`)
}

export async function deletarUsuario(id: number): Promise<void> {
  await api.delete(`/admin/usuarios/${id}`)
}
