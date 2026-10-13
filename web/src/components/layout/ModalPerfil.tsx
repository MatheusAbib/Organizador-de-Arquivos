import { useEffect, useMemo, useState } from 'react'
import { FiEdit2, FiLock, FiMail, FiUser } from 'react-icons/fi'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { atualizarPerfil } from '@/services/usuarios'
import {
  validarCampos,
  validarEmail,
  validarObrigatorio,
  validarSenhaOpcional
} from '@/utils/validacao'
import './ModalPerfil.css'

interface ModalPerfilProps {
  aberto: boolean
  onFechar: () => void
}

export function ModalPerfil({ aberto, onFechar }: ModalPerfilProps) {
  const { usuario, atualizarUsuario } = useAuth()
  const toast = useToast()

  const [modoEdicao, setModoEdicao] = useState(false)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [mostrarErros, setMostrarErros] = useState(false)

  useEffect(() => {
    if (!usuario || !aberto) return
    setNome(usuario.nome)
    setEmail(usuario.email)
    setSenha('')
    setModoEdicao(false)
  }, [usuario, aberto])

  const validacao = useMemo(
    () =>
      validarCampos({
        nome: validarObrigatorio(nome),
        email: validarEmail(email),
        senha: validarSenhaOpcional(senha)
      }),
    [nome, email, senha]
  )

  async function salvar() {
    if (!usuario) return
    setMostrarErros(true)
    if (!validacao.valido) return

    const nomeLimpo = nome.trim()
    const emailLimpo = email.trim()

    setSalvando(true)
    try {
      await atualizarPerfil(usuario.id, {
        nome: nomeLimpo,
        email: emailLimpo,
        senha: senha.trim() || undefined
      })

      atualizarUsuario({
        ...usuario,
        nome: nomeLimpo,
        email: emailLimpo
      })

      toast.sucesso('Perfil atualizado')
      setModoEdicao(false)
      setSenha('')
      setMostrarErros(false)
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 400) {
        toast.erro('Esse email já está em uso')
      } else {
        toast.erro('Não foi possível atualizar o perfil')
      }
    } finally {
      setSalvando(false)
    }
  }

  function cancelar() {
    if (!usuario) return
    setNome(usuario.nome)
    setEmail(usuario.email)
    setSenha('')
    setModoEdicao(false)
    setMostrarErros(false)
  }

  if (!usuario) return null

  return (
    <Modal
      open={aberto}
      onClose={onFechar}
      title={modoEdicao ? 'Editar perfil' : 'Meu perfil'}
      icon={modoEdicao ? <FiEdit2 /> : <FiUser />}
      size="sm"
      footer={
        modoEdicao ? (
          <>
            <Button variant="secondary" onClick={cancelar} disabled={salvando}>
              Cancelar
            </Button>
            <Button
              onClick={salvar}
              loading={salvando}
              loadingText="Salvando..."
              disabled={!validacao.valido}
            >
              Salvar
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={onFechar}>
              Fechar
            </Button>
            <Button icon={<FiEdit2 />} onClick={() => setModoEdicao(true)}>
              Editar perfil
            </Button>
          </>
        )
      }
    >
      {!modoEdicao && (
        <div className="perfil-visualizacao">
          <div className="perfil-avatar">
            <FiUser />
          </div>
          <h3 className="perfil-nome">{usuario.nome}</h3>
          <p className="perfil-email">{usuario.email}</p>

          <div className="perfil-badges">
            <span className="perfil-badge perfil-badge-tipo">
              {usuario.tipo === 'admin' ? 'Administrador' : 'Usuário'}
            </span>
          </div>
        </div>
      )}

      {modoEdicao && (
        <div className="modal-form">
          <Input
            label="Nome"
            icon={<FiUser />}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            error={mostrarErros ? validacao.erros.nome : undefined}
            autoFocus
          />
          <Input
            label="Email"
            icon={<FiMail />}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={mostrarErros ? validacao.erros.email : undefined}
          />
          <Input
            label="Nova senha"
            icon={<FiLock />}
            type="password"
            placeholder="Deixe em branco para manter a atual"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            error={mostrarErros ? validacao.erros.senha : undefined}
            hint="Mínimo 6 caracteres se preencher"
          />
        </div>
      )}
    </Modal>
  )
}
