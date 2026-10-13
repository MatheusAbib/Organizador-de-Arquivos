import { useEffect, useMemo, useState } from 'react'
import {
  FiAlertTriangle,
  FiAward,
  FiCheckCircle,
  FiEdit2,
  FiFile,
  FiFolder,
  FiHardDrive,
  FiRefreshCw,
  FiTrash2,
  FiUser,
  FiUsers,
  FiXCircle
} from 'react-icons/fi'
import { AppLayout } from '@/components/layout/AppLayout'
import { StatCard } from '@/components/ui/StatCard'
import { Spinner } from '@/components/ui/Spinner'
import { EstadoVazio } from '@/components/ui/EstadoVazio'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Paginacao } from '@/components/ui/Paginacao'
import { useToast } from '@/hooks/useToast'
import { usePaginacao } from '@/hooks/usePaginacao'
import {
  listarUsuarios,
  listarTodosArquivos,
  listarTodasPastas,
  atualizarUsuario,
  inativarUsuario,
  reativarUsuario,
  tornarAdmin,
  deletarUsuario,
  type UsuarioAdmin
} from '@/services/admin'
import type { Arquivo, Pasta } from '@/types/arquivo'
import { formatarData, formatarTamanho } from '@/utils/formatadores'
import {
  validarCampos,
  validarEmail,
  validarObrigatorio,
  validarSenhaOpcional
} from '@/utils/validacao'
import './AdminPage.css'

export function AdminPage() {
  const toast = useToast()

  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([])
  const [arquivos, setArquivos] = useState<Arquivo[]>([])
  const [pastas, setPastas] = useState<Pasta[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const [usuarioSelecionado, setUsuarioSelecionado] = useState<UsuarioAdmin | null>(null)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [editNome, setEditNome] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editSenha, setEditSenha] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [mostrarErrosEdicao, setMostrarErrosEdicao] = useState(false)
  const [mostrarErroInativar, setMostrarErroInativar] = useState(false)

  const [confirmacao, setConfirmacao] = useState<{
    titulo: string
    mensagem: string
    acao: () => Promise<void>
    variante?: 'danger' | 'primary'
  } | null>(null)
  const [executando, setExecutando] = useState(false)

  const [usuarioInativando, setUsuarioInativando] = useState<UsuarioAdmin | null>(null)
  const [justificativa, setJustificativa] = useState('')
  const [inativando, setInativando] = useState(false)

  const paginacao = usePaginacao(usuarios, 10)

  async function carregarTudo() {
    setCarregando(true)
    setErro(null)
    try {
      const [u, a, p] = await Promise.all([
        listarUsuarios(),
        listarTodosArquivos(),
        listarTodasPastas()
      ])
      setUsuarios(u)
      setArquivos(a)
      setPastas(p)
    } catch (err) {
      console.error('Erro ao carregar admin:', err)
      setErro('Não foi possível carregar os dados')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    void carregarTudo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const espacoTotal = useMemo(
    () => arquivos.reduce((acc, a) => acc + a.tamanho, 0),
    [arquivos]
  )

  const validacaoEdicao = useMemo(
    () =>
      validarCampos({
        nome: validarObrigatorio(editNome),
        email: validarEmail(editEmail),
        senha: validarSenhaOpcional(editSenha)
      }),
    [editNome, editEmail, editSenha]
  )

  const validacaoInativar = useMemo(
    () => validarCampos({ justificativa: validarObrigatorio(justificativa) }),
    [justificativa]
  )

  function abrirVerUsuario(usuario: UsuarioAdmin) {
    setUsuarioSelecionado(usuario)
    setModoEdicao(false)
    setEditNome(usuario.nome)
    setEditEmail(usuario.email)
    setEditSenha('')
    setMostrarErrosEdicao(false)
  }

  function fecharModalUsuario() {
    setUsuarioSelecionado(null)
    setModoEdicao(false)
    setEditSenha('')
  }

  async function salvarEdicao() {
    if (!usuarioSelecionado) return
    setMostrarErrosEdicao(true)
    if (!validacaoEdicao.valido) return

    const nome = editNome.trim()
    const email = editEmail.trim()

    setSalvando(true)
    try {
      await atualizarUsuario(usuarioSelecionado.id, {
        nome,
        email,
        senha: editSenha.trim() || undefined
      })
      toast.sucesso('Usuário atualizado')
      setMostrarErrosEdicao(false)
      await carregarTudo()
      const atualizado = (await listarUsuarios()).find((u) => u.id === usuarioSelecionado.id)
      if (atualizado) {
        setUsuarioSelecionado(atualizado)
        setModoEdicao(false)
        setEditSenha('')
      }
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 400) {
        toast.erro('Email já está em uso')
      } else {
        toast.erro('Não foi possível atualizar o usuário')
      }
    } finally {
      setSalvando(false)
    }
  }

  function abrirInativar(usuario: UsuarioAdmin) {
    setUsuarioInativando(usuario)
    setJustificativa('')
    setMostrarErroInativar(false)
  }

  async function confirmarInativar() {
    if (!usuarioInativando) return
    setMostrarErroInativar(true)
    if (!validacaoInativar.valido) return
    const texto = justificativa.trim()

    setInativando(true)
    try {
      await inativarUsuario(usuarioInativando.id, texto)
      toast.sucesso('Usuário inativado')
      setUsuarioInativando(null)
      setJustificativa('')
      setMostrarErroInativar(false)
      await carregarTudo()
    } catch {
      toast.erro('Não foi possível inativar o usuário')
    } finally {
      setInativando(false)
    }
  }

  function abrirReativar(usuario: UsuarioAdmin) {
    setConfirmacao({
      titulo: 'Reativar usuário',
      mensagem: `Reativar o acesso de ${usuario.nome}? Ele poderá fazer login novamente.`,
      variante: 'primary',
      acao: async () => {
        await reativarUsuario(usuario.id)
        toast.sucesso('Usuário reativado')
        await carregarTudo()
      }
    })
  }

  function handleToggleStatus(usuario: UsuarioAdmin) {
    if (usuario.status === 'ativo') {
      abrirInativar(usuario)
    } else {
      abrirReativar(usuario)
    }
  }

  function abrirTornarAdmin(usuario: UsuarioAdmin) {
    setConfirmacao({
      titulo: 'Tornar administrador',
      mensagem: `Tornar ${usuario.nome} um administrador? Ele terá acesso total ao sistema.`,
      variante: 'primary',
      acao: async () => {
        await tornarAdmin(usuario.id)
        toast.sucesso('Usuário promovido a administrador')
        await carregarTudo()
      }
    })
  }

  function abrirDeletar(usuario: UsuarioAdmin) {
    setConfirmacao({
      titulo: 'Excluir usuário',
      mensagem: `Tem certeza que deseja excluir ${usuario.nome}? Todos os arquivos e pastas dele serão removidos. Essa ação não pode ser desfeita.`,
      variante: 'danger',
      acao: async () => {
        await deletarUsuario(usuario.id)
        toast.sucesso('Usuário excluído')
        await carregarTudo()
      }
    })
  }

  async function executarConfirmacao() {
    if (!confirmacao) return
    setExecutando(true)
    try {
      await confirmacao.acao()
      setConfirmacao(null)
    } catch {
      toast.erro('Não foi possível concluir a ação')
    } finally {
      setExecutando(false)
    }
  }

  if (carregando) {
    return (
      <AppLayout>
        <Spinner centralizado mensagem="Carregando painel..." />
      </AppLayout>
    )
  }

  if (erro) {
    return (
      <AppLayout>
        <EstadoVazio
          icone={<FiRefreshCw />}
          titulo="Algo deu errado"
          descricao={erro}
          acao={
            <Button onClick={carregarTudo} icon={<FiRefreshCw />}>
              Tentar novamente
            </Button>
          }
        />
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="admin-shell">
        <header className="admin-header">
          <div>
            <h1 className="admin-titulo">Painel Administrativo</h1>
            <p className="admin-subtitulo">
              Gerencie usuários e visualize estatísticas do sistema
            </p>
          </div>
          <Button
            variant="secondary"
            icon={<FiRefreshCw />}
            onClick={() => {
              toast.info('Atualizando...')
              void carregarTudo()
            }}
          >
            Atualizar
          </Button>
        </header>

        <div className="admin-stats">
          <StatCard icone={<FiUsers />} label="Usuários" valor={usuarios.length} cor="#4299e1" />
          <StatCard icone={<FiFile />} label="Arquivos" valor={arquivos.length} cor="#48bb78" />
          <StatCard icone={<FiFolder />} label="Pastas" valor={pastas.length} cor="#ed8936" />
          <StatCard
            icone={<FiHardDrive />}
            label="Espaço usado"
            valor={formatarTamanho(espacoTotal)}
            cor="#9f7aea"
          />
        </div>

        <div className="admin-bloco">
          <div className="admin-bloco-cabecalho">
            <h2 className="admin-bloco-titulo">
              <FiUsers /> Usuários
            </h2>
            <span className="admin-bloco-contagem">{usuarios.length} cadastrados</span>
          </div>

          <div className="admin-tabela-wrapper">
            <table className="admin-tabela">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Tipo</th>
                  <th>Status</th>
                  <th>Cadastro</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginacao.itensPaginados.map((u) => {
                  const ativo = u.status === 'ativo'
                  return (
                    <tr key={u.id} className={!ativo ? 'admin-linha-inativa' : ''}>
                      <td>#{u.id}</td>
                      <td>
                        <div className="admin-celula-nome">
                          <FiUser className="admin-celula-icone" />
                          <span>{u.nome}</span>
                        </div>
                      </td>
                      <td className="admin-celula-email">{u.email}</td>
                      <td>
                        <span
                          className={`admin-badge ${
                            u.tipo === 'admin' ? 'admin-badge-admin' : 'admin-badge-user'
                          }`}
                        >
                          {u.tipo === 'admin' ? (
                            <>
                              <FiAward /> Admin
                            </>
                          ) : (
                            <>
                              <FiUser /> User
                            </>
                          )}
                        </span>
                      </td>
                      <td>
                        {u.tipo === 'admin' ? (
                          <span className="admin-badge admin-badge-ativo">
                            <FiCheckCircle /> Ativo
                          </span>
                        ) : (
                          <button
                            type="button"
                            className={`admin-badge admin-badge-toggle ${
                              ativo ? 'admin-badge-ativo' : 'admin-badge-inativo'
                            }`}
                            onClick={() => handleToggleStatus(u)}
                            title={ativo ? 'Inativar usuário' : 'Reativar usuário'}
                          >
                            {ativo ? (
                              <>
                                <FiCheckCircle /> Ativo
                              </>
                            ) : (
                              <>
                                <FiXCircle /> Inativo
                              </>
                            )}
                          </button>
                        )}
                      </td>
                      <td className="admin-celula-data">{formatarData(u.data_criacao)}</td>
                      <td>
                        <div className="admin-acoes">
                          <button
                            type="button"
                            className="admin-acao-btn admin-acao-ver"
                            title="Ver perfil"
                            onClick={() => abrirVerUsuario(u)}
                          >
                            <FiEdit2 />
                          </button>
                          {u.tipo !== 'admin' && (
                            <>
                              <button
                                type="button"
                                className="admin-acao-btn admin-acao-admin"
                                title="Tornar administrador"
                                onClick={() => abrirTornarAdmin(u)}
                              >
                                <FiAward />
                              </button>
                              <button
                                type="button"
                                className="admin-acao-btn admin-acao-perigo"
                                title="Excluir usuário"
                                onClick={() => abrirDeletar(u)}
                              >
                                <FiTrash2 />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <Paginacao
            paginaAtual={paginacao.paginaAtual}
            totalPaginas={paginacao.totalPaginas}
            totalItens={paginacao.totalItens}
            itensPorPagina={paginacao.itensPorPagina}
            onMudarPagina={paginacao.mudarPagina}
            onMudarItensPorPagina={paginacao.mudarItensPorPagina}
            opcoesItensPorPagina={[10, 20, 30, 50]}
          />
        </div>
      </div>

      <Modal
        open={!!usuarioSelecionado}
        onClose={fecharModalUsuario}
        title={modoEdicao ? 'Editar usuário' : 'Detalhes do usuário'}
        icon={modoEdicao ? <FiEdit2 /> : <FiUser />}
        size="sm"
        footer={
          modoEdicao ? (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  setModoEdicao(false)
                  if (usuarioSelecionado) {
                    setEditNome(usuarioSelecionado.nome)
                    setEditEmail(usuarioSelecionado.email)
                    setEditSenha('')
                  }
                }}
                disabled={salvando}
              >
                Cancelar
              </Button>
              <Button
                onClick={salvarEdicao}
                loading={salvando}
                loadingText="Salvando..."
                disabled={!validacaoEdicao.valido}
              >
                Salvar
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={fecharModalUsuario}>
                Fechar
              </Button>
              <Button onClick={() => setModoEdicao(true)} icon={<FiEdit2 />}>
                Editar
              </Button>
            </>
          )
        }
      >
        {usuarioSelecionado && !modoEdicao && (
          <div className="admin-perfil">
            <div className="admin-perfil-avatar">
              <FiUser />
            </div>
            <h3 className="admin-perfil-nome">{usuarioSelecionado.nome}</h3>
            <p className="admin-perfil-email">{usuarioSelecionado.email}</p>

            <div className="admin-perfil-badges">
              <span
                className={`admin-badge ${
                  usuarioSelecionado.tipo === 'admin' ? 'admin-badge-admin' : 'admin-badge-user'
                }`}
              >
                {usuarioSelecionado.tipo === 'admin' ? (
                  <>
                    <FiAward /> Administrador
                  </>
                ) : (
                  <>
                    <FiUser /> Usuário
                  </>
                )}
              </span>
              <span
                className={`admin-badge ${
                  usuarioSelecionado.status === 'ativo'
                    ? 'admin-badge-ativo'
                    : 'admin-badge-inativo'
                }`}
              >
                {usuarioSelecionado.status === 'ativo' ? (
                  <>
                    <FiCheckCircle /> Ativo
                  </>
                ) : (
                  <>
                    <FiXCircle /> Inativo
                  </>
                )}
              </span>
            </div>

            <div className="admin-perfil-info">
              <div className="admin-perfil-info-item">
                <span className="admin-perfil-info-label">ID</span>
                <span className="admin-perfil-info-valor">#{usuarioSelecionado.id}</span>
              </div>
              <div className="admin-perfil-info-item">
                <span className="admin-perfil-info-label">Cadastrado em</span>
                <span className="admin-perfil-info-valor">
                  {formatarData(usuarioSelecionado.data_criacao)}
                </span>
              </div>
            </div>

            <div className="admin-perfil-acoes">
              {usuarioSelecionado.tipo !== 'admin' && (
                <Button
                  variant={usuarioSelecionado.status === 'ativo' ? 'danger' : 'success'}
                  icon={
                    usuarioSelecionado.status === 'ativo' ? <FiXCircle /> : <FiCheckCircle />
                  }
                  onClick={() => {
                    const usuario = usuarioSelecionado
                    fecharModalUsuario()
                    if (usuario.status === 'ativo') {
                      abrirInativar(usuario)
                    } else {
                      abrirReativar(usuario)
                    }
                  }}
                  fullWidth
                >
                  {usuarioSelecionado.status === 'ativo' ? 'Inativar acesso' : 'Reativar acesso'}
                </Button>
              )}
            </div>

            {usuarioSelecionado.status === 'inativo' &&
              usuarioSelecionado.inativacao_justificativa && (
                <div className="admin-perfil-justificativa">
                  <strong>Justificativa da inativação:</strong>
                  <p>{usuarioSelecionado.inativacao_justificativa}</p>
                </div>
              )}
          </div>
        )}

        {usuarioSelecionado && modoEdicao && (
          <div className="modal-form">
            <Input
              label="Nome"
              value={editNome}
              onChange={(e) => setEditNome(e.target.value)}
              error={mostrarErrosEdicao ? validacaoEdicao.erros.nome : undefined}
              autoFocus
            />
            <Input
              label="Email"
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              error={mostrarErrosEdicao ? validacaoEdicao.erros.email : undefined}
            />
            <Input
              label="Nova senha"
              type="password"
              placeholder="Deixe em branco para manter a atual"
              value={editSenha}
              onChange={(e) => setEditSenha(e.target.value)}
              error={mostrarErrosEdicao ? validacaoEdicao.erros.senha : undefined}
              hint="Mínimo 6 caracteres se preencher"
            />
          </div>
        )}
      </Modal>


      <Modal
        open={!!usuarioInativando}
        onClose={() => setUsuarioInativando(null)}
        title="Inativar usuário"
        icon={<FiAlertTriangle />}
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setUsuarioInativando(null)}
              disabled={inativando}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={confirmarInativar}
              loading={inativando}
              loadingText="Inativando..."
              disabled={!validacaoInativar.valido}
            >
              Inativar
            </Button>
          </>
        }
      >
        {usuarioInativando && (
          <div className="modal-form">
            <p className="modal-form-descricao">
              Tem certeza que deseja inativar <strong>{usuarioInativando.nome}</strong>? Ele
              não poderá mais fazer login até ser reativado.
            </p>

            <div className="modal-form-grupo">
              <label className="modal-form-label">
                Justificativa <span className="modal-form-obrigatorio">*</span>
              </label>
              <textarea
                className={`modal-form-textarea ${
                  mostrarErroInativar && validacaoInativar.erros.justificativa
                    ? 'modal-form-textarea-erro'
                    : ''
                }`}
                placeholder="Motivo da inativação..."
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                rows={4}
                autoFocus
              />
              {mostrarErroInativar && validacaoInativar.erros.justificativa && (
                <span className="modal-form-erro-texto">
                  {validacaoInativar.erros.justificativa}
                </span>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!confirmacao}
        onClose={() => setConfirmacao(null)}
        title={confirmacao?.titulo ?? ''}
        icon={<FiAlertTriangle />}
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setConfirmacao(null)}
              disabled={executando}
            >
              Cancelar
            </Button>
            <Button
              variant={confirmacao?.variante ?? 'primary'}
              onClick={executarConfirmacao}
              loading={executando}
              loadingText="Processando..."
            >
              Confirmar
            </Button>
          </>
        }
      >
        <p>{confirmacao?.mensagem}</p>
      </Modal>
    </AppLayout>
  )
}
