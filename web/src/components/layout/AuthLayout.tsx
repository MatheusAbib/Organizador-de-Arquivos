import type { ReactNode } from 'react'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import './AuthLayout.css'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-layout">
      <Navbar compacta />
      <main className="auth-layout-content">{children}</main>
      <Footer compacto />
    </div>
  )
}
