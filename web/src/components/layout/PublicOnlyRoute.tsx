import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function PublicOnlyRoute() {
  const { autenticado, ehAdmin } = useAuth()

  if (autenticado) {
    return <Navigate to={ehAdmin ? '/admin' : '/dashboard'} replace />
  }

  return <Outlet />
}
