import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

interface ProtectedRouteProps {
  somenteAdmin?: boolean
}

export function ProtectedRoute({ somenteAdmin = false }: ProtectedRouteProps) {
  const { autenticado, ehAdmin } = useAuth()
  const location = useLocation()

  if (!autenticado) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (somenteAdmin && !ehAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
