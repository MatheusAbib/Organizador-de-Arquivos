import { useEffect, useRef, useState } from 'react'
import {
  FiAlertTriangle,
  FiChevronDown,
  FiLogOut,
  FiMoon,
  FiSun,
  FiUser
} from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useOverlayCarregando } from '@/hooks/useOverlayCarregando'
import { useTema } from '@/hooks/useTema'
import { ModalPerfil } from './ModalPerfil'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import './MenuUsuario.css'

export function MenuUsuario() {
  const { usuario, logout } = useAuth()
  const { tema, alternarTema } = useTema()
  const navigate = useNavigate()
  const overlay = useOverlayCarregando()

  const [aberto, setAberto] = useState(false)
  const [perfilAberto, setPerfilAberto] = useState(false)
  const [confirmarSair, setConfirmarSair] = useState(false)
  const refMenu = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickFora(e: MouseEvent) {
      if (refMenu.current && !refMenu.current.contains(e.target as Node)) {
        setAberto(false)
      }
    }

    if (aberto) {
      document.addEventListener('mousedown', handleClickFora)
    }

    return () => document.removeEventListener('mousedown', handleClickFora)
  }, [aberto])

  function abrirConfirmacaoSair() {
    setAberto(false)
    setConfirmarSair(true)
  }

  function handleLogout() {
    setConfirmarSair(false)
    overlay.mostrar('Saindo...')
    setTimeout(() => {
      logout()
      navigate('/login', { replace: true })
      overlay.esconder()
    }, 300)
  }

  function handleTema() {
    alternarTema()
    setAberto(false)
  }

  function handlePerfil() {
    setAberto(false)
    setPerfilAberto(true)
  }

  const primeiroNome = usuario?.nome?.split(' ')[0] ?? 'Usuário'

  return (
    <>
      <div className="menu-usuario" ref={refMenu}>
        <button
          type="button"
          className="menu-usuario-btn"
          onClick={() => setAberto((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={aberto}
        >
          <FiUser className="menu-usuario-avatar" />
          <span className="menu-usuario-nome">{primeiroNome}</span>
          <FiChevronDown className="menu-usuario-seta" />
        </button>

        {aberto && (
          <div className="menu-usuario-dropdown" role="menu">
            <div className="menu-usuario-header">
              <strong>{usuario?.nome}</strong>
              <small>{usuario?.email}</small>
            </div>

            <button
              type="button"
              className="menu-usuario-item"
              onClick={handlePerfil}
              role="menuitem"
            >
              <FiUser />
              Ver perfil
            </button>

            <button
              type="button"
              className="menu-usuario-item"
              onClick={handleTema}
              role="menuitem"
            >
              {tema === 'escuro' ? <FiSun /> : <FiMoon />}
              {tema === 'escuro' ? 'Tema claro' : 'Tema escuro'}
            </button>

            <div className="menu-usuario-divisor" />

            <button
              type="button"
              className="menu-usuario-item menu-usuario-item-sair"
              onClick={abrirConfirmacaoSair}
              role="menuitem"
            >
              <FiLogOut />
              Sair
            </button>
          </div>
        )}
      </div>

      <ModalPerfil aberto={perfilAberto} onFechar={() => setPerfilAberto(false)} />

      <Modal
        open={confirmarSair}
        onClose={() => setConfirmarSair(false)}
        title="Sair do sistema"
        icon={<FiAlertTriangle />}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmarSair(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleLogout} icon={<FiLogOut />}>
              Sair
            </Button>
          </>
        }
      >
        <p>Tem certeza que deseja sair do sistema?</p>
      </Modal>
    </>
  )
}
