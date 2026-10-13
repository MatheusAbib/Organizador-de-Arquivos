export interface Usuario {
  id: number
  nome: string
  email: string
  tipo: 'user' | 'admin'
}

export interface RespostaLogin {
  message: string
  token: string
  usuario: Usuario
}

export interface AuthContextValue {
  usuario: Usuario | null
  autenticado: boolean
  ehAdmin: boolean
  login: (email: string, senha: string) => Promise<void>
  logout: () => void
  atualizarUsuario: (usuario: Usuario) => void
}
