import { useEffect, useMemo, useState } from 'react'
import { FiMail, FiLock, FiUser, FiLogIn, FiUserPlus } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { useOverlayCarregando } from '@/hooks/useOverlayCarregando'
import { api } from '@/services/api'
import {
  validarCampos,
  validarEmail,
  validarObrigatorio,
  validarSenha
} from '@/utils/validacao'
import './LoginPage.css'

type Aba = 'login' | 'cadastro'

interface RespostaCadastro {
  message: string
  token: string
  usuario: { id: number; nome: string; email: string; tipo: 'user' | 'admin' }
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const overlay = useOverlayCarregando()

  const [aba, setAba] = useState<Aba>('login')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginSenha, setLoginSenha] = useState('')
  const [cadastroNome, setCadastroNome] = useState('')
  const [cadastroEmail, setCadastroEmail] = useState('')
  const [cadastroSenha, setCadastroSenha] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [carregandoLogin, setCarregandoLogin] = useState(false)
  const [carregandoCadastro, setCarregandoCadastro] = useState(false)
  const [mostrarErrosLogin, setMostrarErrosLogin] = useState(false)
  const [mostrarErrosCadastro, setMostrarErrosCadastro] = useState(false)

  useEffect(() => {
    if (!erro && !sucesso) return
    const id = setTimeout(() => {
      setErro('')
      setSucesso('')
    }, 4000)
    return () => clearTimeout(id)
  }, [erro, sucesso])

  function trocarAba(nova: Aba) {
    setAba(nova)
    setErro('')
    setSucesso('')
    setMostrarErrosLogin(false)
    setMostrarErrosCadastro(false)
  }

  const validacaoLogin = useMemo(
    () =>
      validarCampos({
        loginEmail: validarEmail(loginEmail),
        loginSenha: validarObrigatorio(loginSenha)
      }),
    [loginEmail, loginSenha]
  )

  const validacaoCadastro = useMemo(
    () =>
      validarCampos({
        cadastroNome: validarObrigatorio(cadastroNome),
        cadastroEmail: validarEmail(cadastroEmail),
        cadastroSenha: validarSenha(cadastroSenha)
      }),
    [cadastroNome, cadastroEmail, cadastroSenha]
  )

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setSucesso('')

    setMostrarErrosLogin(true)
    if (!validacaoLogin.valido) return

    setCarregandoLogin(true)
    overlay.mostrar('Entrando...')
    try {
      await login(loginEmail, loginSenha)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const mensagem =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Erro ao fazer login'
      setErro(mensagem)
    } finally {
      setCarregandoLogin(false)
      overlay.esconder()
    }
  }

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setSucesso('')

    setMostrarErrosCadastro(true)
    if (!validacaoCadastro.valido) return

    setCarregandoCadastro(true)
    overlay.mostrar('Criando conta...')
    try {
      const { data } = await api.post<RespostaCadastro>('/cadastro', {
        nome: cadastroNome,
        email: cadastroEmail,
        senha: cadastroSenha
      })

      setSucesso('Cadastro realizado! Entrando...')
      setCadastroNome('')
      setCadastroEmail('')
      setCadastroSenha('')
      setMostrarErrosCadastro(false)

      setTimeout(() => {
        setLoginEmail(data.usuario.email)
        setLoginSenha(cadastroSenha)
        setAba('login')
      }, 1200)
    } catch (err) {
      const mensagem =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Erro ao cadastrar'
      setErro(mensagem)
    } finally {
      setCarregandoCadastro(false)
      overlay.esconder()
    }
  }

  return (
    <AuthLayout>
      <div className="login-card">
        <header className="login-header">
          <div className="login-header-icon">
            <FiUser />
          </div>
          <h1 className="login-header-title">Bem-vindo</h1>
          <p className="login-header-subtitle">
            Organize seus arquivos com segurança e elegância
          </p>
        </header>

        <div className="login-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={aba === 'login'}
            className={`login-tab ${aba === 'login' ? 'login-tab-active' : ''}`}
            onClick={() => trocarAba('login')}
          >
            Entrar
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={aba === 'cadastro'}
            className={`login-tab ${aba === 'cadastro' ? 'login-tab-active' : ''}`}
            onClick={() => trocarAba('cadastro')}
          >
            Criar conta
          </button>
        </div>

        {erro && <div className="login-message login-message-error">{erro}</div>}
        {sucesso && <div className="login-message login-message-success">{sucesso}</div>}

        {aba === 'login' && (
          <form className="login-form" onSubmit={handleLogin} noValidate>
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              icon={<FiMail />}
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  void handleLogin(e as unknown as React.FormEvent)
                }
              }}
              autoComplete="email"
              error={mostrarErrosLogin ? validacaoLogin.erros.loginEmail : undefined}
            />
            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              icon={<FiLock />}
              value={loginSenha}
              onChange={(e) => setLoginSenha(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  void handleLogin(e as unknown as React.FormEvent)
                }
              }}
              autoComplete="current-password"
              error={mostrarErrosLogin ? validacaoLogin.erros.loginSenha : undefined}
            />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={carregandoLogin}
              loadingText="Entrando..."
              icon={<FiLogIn />}
              disabled={!validacaoLogin.valido}
            >
              Entrar
            </Button>
          </form>
        )}

        {aba === 'cadastro' && (
          <form className="login-form" onSubmit={handleCadastro} noValidate>
            <Input
              label="Nome"
              type="text"
              placeholder="Seu nome completo"
              icon={<FiUser />}
              value={cadastroNome}
              onChange={(e) => setCadastroNome(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  void handleCadastro(e as unknown as React.FormEvent)
                }
              }}
              autoComplete="name"
              error={mostrarErrosCadastro ? validacaoCadastro.erros.cadastroNome : undefined}
            />
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              icon={<FiMail />}
              value={cadastroEmail}
              onChange={(e) => setCadastroEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  void handleCadastro(e as unknown as React.FormEvent)
                }
              }}
              autoComplete="email"
              error={mostrarErrosCadastro ? validacaoCadastro.erros.cadastroEmail : undefined}
            />
            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              icon={<FiLock />}
              value={cadastroSenha}
              onChange={(e) => setCadastroSenha(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  void handleCadastro(e as unknown as React.FormEvent)
                }
              }}
              autoComplete="new-password"
              error={mostrarErrosCadastro ? validacaoCadastro.erros.cadastroSenha : undefined}
              hint="Mínimo 6 caracteres"
            />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={carregandoCadastro}
              loadingText="Criando conta..."
              icon={<FiUserPlus />}
              disabled={!validacaoCadastro.valido}
            >
              Criar conta
            </Button>
          </form>
        )}

        <footer className="login-footer">
          Ao continuar, você terá seus dados protegidos
        </footer>
      </div>
    </AuthLayout>
  )
}
