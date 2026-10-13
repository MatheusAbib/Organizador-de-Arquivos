import { useContext } from 'react'
import { FavoritosContext } from '@/contexts/FavoritosContext'

export function useFavoritos() {
  const ctx = useContext(FavoritosContext)
  if (!ctx) {
    throw new Error('useFavoritos precisa estar dentro de FavoritosProvider')
  }
  return ctx
}
