import { useContext } from 'react'
import { OverlayCarregandoContext } from '@/contexts/OverlayCarregandoContext'

export function useOverlayCarregando() {
  const ctx = useContext(OverlayCarregandoContext)
  if (!ctx) {
    throw new Error('useOverlayCarregando precisa estar dentro de OverlayCarregandoProvider')
  }
  return ctx
}
