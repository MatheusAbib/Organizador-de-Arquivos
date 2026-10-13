import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { TemaProvider } from '@/contexts/TemaContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { FavoritosProvider } from '@/contexts/FavoritosContext'
import { OverlayCarregandoProvider } from '@/contexts/OverlayCarregandoContext'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { PublicOnlyRoute } from '@/components/layout/PublicOnlyRoute'
import { LoginPage } from '@/pages/Login/LoginPage'
import { DashboardPage } from '@/pages/Dashboard/DashboardPage'
import { AdminPage } from '@/pages/Admin/AdminPage'
import { NaoEncontradoPage } from '@/pages/NaoEncontradoPage'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <TemaProvider>
        <ToastProvider>
          <AuthProvider>
            <FavoritosProvider>
              <OverlayCarregandoProvider>
                <Routes>
                <Route element={<PublicOnlyRoute />}>
                  <Route path="/login" element={<LoginPage />} />
                </Route>

                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                </Route>

                <Route element={<ProtectedRoute somenteAdmin />}>
                  <Route path="/admin" element={<AdminPage />} />
                </Route>

                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<NaoEncontradoPage />} />
                </Routes>
              </OverlayCarregandoProvider>
            </FavoritosProvider>
          </AuthProvider>
        </ToastProvider>
      </TemaProvider>
    </BrowserRouter>
  )
}
