import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

const TOKEN_KEY = 'auth_token'
const USUARIO_KEY = 'auth_usuario'

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; expirado?: boolean }>) => {
    if (error.response?.status === 401) {
      const expirado = error.response.data?.expirado
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USUARIO_KEY)

      if (expirado && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export function salvarSessao(token: string, usuario: unknown) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario))
}

export function limparSessao() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USUARIO_KEY)
}

export function obterToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function obterUsuarioSalvo<T>(): T | null {
  const raw = localStorage.getItem(USUARIO_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}
