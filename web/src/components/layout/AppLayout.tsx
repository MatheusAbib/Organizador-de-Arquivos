import type { ReactNode } from 'react'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import './AppLayout.css'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="app-layout-content">{children}</main>
      <Footer />
    </div>
  )
}
