import { api } from './api'
import type { Usuario } from '@/types/auth'

export async function atualizarPerfil(
  id: number,
  dados: { nome: string; email: string; senha?: string }
): Promise<void> {
  await api.put(`/usuarios/${id}`, dados)
}

export async function obterUsuario(id: number): Promise<Usuario> {
  const { data } = await api.get<Usuario[]>('/admin/usuarios')
  const encontrado = data.find((u) => u.id === id)
  if (!encontrado) throw new Error('Usuário não encontrado')
  return encontrado
}
