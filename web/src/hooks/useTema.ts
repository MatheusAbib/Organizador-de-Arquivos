import { useContext } from 'react'
import { TemaContext } from '@/contexts/TemaContext'

export function useTema() {
  const ctx = useContext(TemaContext)
  if (!ctx) {
    throw new Error('useTema precisa estar dentro de TemaProvider')
  }
  return ctx
}
