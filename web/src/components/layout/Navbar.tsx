import { useEffect, useRef, useState } from 'react'
import { FiFolder, FiMenu, FiStar, FiX } from 'react-icons/fi'
import { BotaoTema } from '@/components/ui/BotaoTema'
import { MenuUsuario } from './MenuUsuario'
import { ModalFavoritos } from './ModalFavoritos'
import { useFavoritos } from '@/hooks/useFavoritos'
import { useAuth } from '@/hooks/useAuth'
import './Navbar.css'

interface NavbarProps {
  children?: React.ReactNode
  compacta?: boolean
}

export function Navbar({ children, compacta = false }: NavbarProps) {
  const { contador, abrirModal } = useFavoritos()
  const { ehAdmin } = useAuth()
  const [menuAberto, setMenuAberto] = useState(false)
  const refNav = useRef<HTMLElement>(null)

  useEffect(() => {
    function fechar(e: MouseEvent) {
      if (refNav.current && !refNav.current.contains(e.target as Node)) {
        setMenuAberto(false)
      }
    }
    if (menuAberto) {
      document.addEventListener('mousedown', fechar)
    }
    return () => document.removeEventListener('mousedown', fechar)
  }, [menuAberto])

  function handleFavoritos() {
    setMenuAberto(false)
    abrirModal()
  }

  return (
    <>
      <header className="navbar" ref={refNav}>
        <div className="navbar-brand">
          <FiFolder className="navbar-brand-icon" />
          <h1>Organizador de Arquivos</h1>
        </div>

        {!compacta && (
          <button
            type="button"
            className="navbar-hamburguer"
            onClick={() => setMenuAberto((v) => !v)}
            aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuAberto}
          >
            {menuAberto ? <FiX /> : <FiMenu />}
          </button>
        )}

        <div
          className={`navbar-actions ${
            menuAberto ? 'navbar-actions-aberto' : ''
          } ${compacta ? 'navbar-actions-compacta' : ''}`}
        >
          {children}

          {!compacta && !ehAdmin && (
            <button
              type="button"
              className="navbar-favoritos-btn"
              onClick={handleFavoritos}
              title="Meus favoritos"
            >
              <FiStar />
              <span className="navbar-favoritos-texto">Favoritos</span>
              {contador > 0 && <span className="navbar-favoritos-contador">{contador}</span>}
            </button>
          )}

          <BotaoTema />

          {!compacta && <MenuUsuario />}
        </div>
      </header>

      <ModalFavoritos />
    </>
  )
}