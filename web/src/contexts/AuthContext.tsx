import { createContext, useCallback, useState, type ReactNode } from 'react'
import { api, salvarSessao, limparSessao, obterUsuarioSalvo, obterToken } from '@/services/api'
import type { AuthContextValue, RespostaLogin, Usuario } from '@/types/auth'

const AuthContext = createContext<AuthContextValue | null>(null)

function obterUsuarioInicial(): Usuario | null {
  const token = obterToken()
  if (!token) return null
  return obterUsuarioSalvo<Usuario>()
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(obterUsuarioInicial)

  const login = useCallback(async (email: string, senha: string) => {
    const { data } = await api.post<RespostaLogin>('/login', { email, senha })
    salvarSessao(data.token, data.usuario)
    setUsuario(data.usuario)
  }, [])

  const logout = useCallback(() => {
    limparSessao()
    setUsuario(null)
  }, [])

  const atualizarUsuario = useCallback((novo: Usuario) => {
    salvarSessao(obterToken() ?? '', novo)
    setUsuario(novo)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        usuario,
        autenticado: !!usuario,
        ehAdmin: usuario?.tipo === 'admin',
        login,
        logout,
        atualizarUsuario
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }
