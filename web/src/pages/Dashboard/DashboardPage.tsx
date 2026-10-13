import { useCallback, useEffect, useMemo, useState } from 'react'
import { FiAlertTriangle, FiCopy, FiEdit2, FiFolder, FiFolderPlus, FiMove, FiRefreshCw, FiShare2, FiTrash2, FiUploadCloud } from 'react-icons/fi'
import { AppLayout } from '@/components/layout/AppLayout'
import { Sidebar } from '@/components/features/Sidebar'
import { BarraAcoes, type Visualizacao } from '@/components/features/BarraAcoes'
import { UploadZone } from '@/components/features/UploadZone'
import { FiltrosTipo, type TipoFiltro } from '@/components/features/FiltrosTipo'
import { CardArquivo } from '@/components/features/CardArquivo'
import { LinhaArquivo } from '@/components/features/LinhaArquivo'
import { VisualizadorArquivo } from '@/components/features/VisualizadorArquivo'
import { ModalComentario } from '@/components/features/ModalComentario'
import { ModalFormatos } from '@/components/features/ModalFormatos'
import { ModalSeletorArquivos } from '@/components/features/ModalSeletorArquivos'
import { CardSubpasta } from '@/components/features/CardSubpasta'
import { LinhaSubpasta } from '@/components/features/LinhaSubpasta'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { EstadoVazio } from '@/components/ui/EstadoVazio'
import { Paginacao } from '@/components/ui/Paginacao'
import { useAuth } from '@/hooks/useAuth'
import { useFavoritos } from '@/hooks/useFavoritos'
import { useToast } from '@/hooks/useToast'
import { usePaginacao } from '@/hooks/usePaginacao'
import {
  validarCampos,
  validarEmail,
  validarObrigatorio
} from '@/utils/validacao'
import {
  listarArquivos,
  listarArquivosEmPastas,
  listarPastas,
  obterConteudoPasta,
  criarPasta,
  renomearPasta,
  deletarPasta,
  deletarArquivo,
  renomearArquivo,
  favoritarArquivo,
  uploadArquivo,
  moverArquivo
} from '@/services/arquivos'
import {
  listarCompartilhadosComigo,
  listarCompartilhadosPorMim,
  compartilharPasta,
  editarPermissao,
  removerCompartilhamento
} from '@/services/compartilhamentos'
import type { Arquivo, Pasta } from '@/types/arquivo'
import type {
  CompartilhamentoFeito,
  CompartilhamentoRecebido,
  Permissao
} from '@/types/compartilhamento'
import './DashboardPage.css'

function mesmoConteudo<T extends { id: number }>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (JSON.stringify(a[i]) !== JSON.stringify(b[i])) return false
  }
  return true
}

export function DashboardPage() {
  const { usuario } = useAuth()
  const toast = useToast()
  const favoritos = useFavoritos()

  const [arquivos, setArquivos] = useState<Arquivo[]>([])
  const [pastas, setPastas] = useState<Pasta[]>([])
  const [compartilhadosComigo, setCompartilhadosComigo] = useState<
    CompartilhamentoRecebido[]
  >([])
  const [compartilhadosPorMim, setCompartilhadosPorMim] = useState<
    CompartilhamentoFeito[]
  >([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const [busca, setBusca] = useState('')
  const [visualizacao, setVisualizacao] = useState<Visualizacao>('grid')
  const [filtro, setFiltro] = useState<TipoFiltro>('todos')
  const [pastaAtiva, setPastaAtiva] = useState<number | null>(null)
  const [pastaCompartilhadaAtiva, setPastaCompartilhadaAtiva] = useState<
    CompartilhamentoRecebido | null
  >(null)

  const [arquivoRenomeando, setArquivoRenomeando] = useState<Arquivo | null>(null)
  const [novoNome, setNovoNome] = useState('')
  const [arquivoDeletando, setArquivoDeletando] = useState<Arquivo | null>(null)
  const [arquivoAberto, setArquivoAberto] = useState<Arquivo | null>(null)
  const [arquivoComentando, setArquivoComentando] = useState<Arquivo | null>(null)
  const [modalFormatos, setModalFormatos] = useState(false)
  const [modalSeletor, setModalSeletor] = useState(false)

  const [modalNovaPasta, setModalNovaPasta] = useState(false)
  const [nomeNovaPasta, setNomeNovaPasta] = useState('')
  const [paiNovaPasta, setPaiNovaPasta] = useState<number | null>(null)
  const [criandoPasta, setCriandoPasta] = useState(false)
  const [mostrarErrosNovaPasta, setMostrarErrosNovaPasta] = useState(false)

  const [pastaRenomeando, setPastaRenomeando] = useState<Pasta | null>(null)
  const [nomePastaRenomeando, setNomePastaRenomeando] = useState('')
  const [renomeandoPasta, setRenomeandoPasta] = useState(false)
  const [mostrarErrosRenomearPasta, setMostrarErrosRenomearPasta] = useState(false)

  const [pastaDeletando, setPastaDeletando] = useState<Pasta | null>(null)
  const [deletandoPasta, setDeletandoPasta] = useState(false)

  const [arquivoMovendo, setArquivoMovendo] = useState<Arquivo | null>(null)
  const [pastaDestino, setPastaDestino] = useState<number | null>(null)
  const [movendo, setMovendo] = useState(false)

  const [pastaCompartilhando, setPastaCompartilhando] = useState<Pasta | null>(null)
  const [emailCompartilhar, setEmailCompartilhar] = useState('')
  const [permissaoCompartilhar, setPermissaoCompartilhar] = useState<Permissao>('visualizar')
  const [compartilhando, setCompartilhando] = useState(false)
  const [mostrarErrosCompartilhar, setMostrarErrosCompartilhar] = useState(false)

  const [editandoPermissao, setEditandoPermissao] = useState<CompartilhamentoFeito | null>(null)
  const [novaPermissao, setNovaPermissao] = useState<Permissao>('visualizar')
  const [salvandoPermissao, setSalvandoPermissao] = useState(false)

  const [removendoCompartilhamento, setRemovendoCompartilhamento] = useState<{
    tipo: 'feito' | 'recebido'
    item: CompartilhamentoFeito | CompartilhamentoRecebido
  } | null>(null)
  const [executandoRemocao, setExecutandoRemocao] = useState(false)

  const carregarTudo = useCallback(async (silencioso = false) => {
    if (!usuario) return

    if (!silencioso) {
      setCarregando(true)
      setErro(null)
    }

    try {
      const [listaArquivosRaiz, listaArquivosPastas, listaPastas, listaComigo, listaPorMim] =
        await Promise.all([
          listarArquivos(usuario.id),
          listarArquivosEmPastas(usuario.id),
          listarPastas(usuario.id),
          listarCompartilhadosComigo(usuario.id),
          listarCompartilhadosPorMim(usuario.id)
        ])

      const raiz = listaArquivosRaiz.filter((a) => a.pasta_id === null)
      const todasPastas = [...listaArquivosPastas]
      for (const a of listaArquivosRaiz) {
        if (a.pasta_id !== null && !todasPastas.some((p) => p.id === a.id)) {
          todasPastas.push(a)
        }
      }

      setArquivos((atual) => (mesmoConteudo(atual, raiz) ? atual : raiz))
      setPastas((atual) => (mesmoConteudo(atual, listaPastas) ? atual : listaPastas))
      setCompartilhadosComigo((atual) =>
        mesmoConteudo(atual, listaComigo) ? atual : listaComigo
      )
      setCompartilhadosPorMim((atual) =>
        mesmoConteudo(atual, listaPorMim) ? atual : listaPorMim
      )
    } catch (err) {
      if (!silencioso) {
        console.error('Erro ao carregar dashboard:', err)
        setErro('Não foi possível carregar seus arquivos.')
      }
    } finally {
      if (!silencioso) {
        setCarregando(false)
      }
    }
  }, [usuario])

  useEffect(() => {
    void carregarTudo()
  }, [carregarTudo])

  useEffect(() => {
    const intervalo = setInterval(() => {
      void carregarTudo(true)
    }, 5000)

    return () => clearInterval(intervalo)
  }, [carregarTudo])

  const [arquivosCompartilhados, setArquivosCompartilhados] = useState<Arquivo[]>([])
  const [subpastasCompartilhadas, setSubpastasCompartilhadas] = useState<Pasta[]>([])
  const [, setCarregandoCompartilhada] = useState(false)

  const recarregarPastaAtiva = useCallback(async () => {
    if (pastaAtiva === null || !usuario) return

    setCarregandoCompartilhada(true)
    try {
      const dados = await obterConteudoPasta(pastaAtiva, usuario.id)
      setArquivosCompartilhados((atual) => {
        const idsOutras = new Set(
          atual.filter((a) => a.pasta_id !== pastaAtiva).map((a) => a.id)
        )
        const desta = dados.arquivos
        const combinado = [...atual.filter((a) => idsOutras.has(a.id)), ...desta]
        const idsUnicos = new Set<number>()
        return combinado.filter((a) => {
          if (idsUnicos.has(a.id)) return false
          idsUnicos.add(a.id)
          return true
        })
      })
      setSubpastasCompartilhadas((atual) => {
        const novasSubpastas = dados.pastas.filter(
          (p) => !atual.some((existente) => existente.id === p.id)
        )
        return novasSubpastas.length > 0 ? [...atual, ...novasSubpastas] : atual
      })
    } catch {
      toast.erro('Não foi possível carregar o conteúdo')
    } finally {
      setCarregandoCompartilhada(false)
    }
  }, [pastaAtiva, usuario, toast])

  useEffect(() => {
    void recarregarPastaAtiva()
  }, [recarregarPastaAtiva])

  const arquivosFiltrados = useMemo(() => {
    let lista: Arquivo[]

    if (pastaAtiva !== null) {
      lista = arquivosCompartilhados.filter((a) => a.pasta_id === pastaAtiva)
    } else {
      lista = [...arquivos]
    }

    if (filtro !== 'todos') {
      lista = lista.filter((a) => a.tipo_arquivo === filtro)
    }

    if (busca.trim()) {
      const termo = busca.trim().toLowerCase()
      lista = lista.filter((a) => a.nome_original.toLowerCase().includes(termo))
    }

    return lista
  }, [arquivos, arquivosCompartilhados, filtro, busca, pastaAtiva])

  const paginacao = usePaginacao(arquivosFiltrados, 8)

  useEffect(() => {
    paginacao.resetar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca, filtro, visualizacao, pastaAtiva])

  const contagensPorTipo = useMemo(() => {
    const contagens: Partial<Record<TipoFiltro, number>> = { todos: arquivos.length }
    for (const a of arquivos) {
      contagens[a.tipo_arquivo] = (contagens[a.tipo_arquivo] ?? 0) + 1
    }
    return contagens
  }, [arquivos, arquivosCompartilhados])

  const contagensArquivosPorPasta = useMemo(() => {
    const contagens: Record<number, number> = {}

    const todosArquivosConhecidos = [...arquivos, ...arquivosCompartilhados]
    const idsUnicos = new Set<number>()
    const listaUnica = todosArquivosConhecidos.filter((a) => {
      if (idsUnicos.has(a.id)) return false
      idsUnicos.add(a.id)
      return true
    })

    function contarRecursivo(pastaId: number): number {
      if (contagens[pastaId] !== undefined) return contagens[pastaId]

      const diretos = listaUnica.filter((a) => a.pasta_id === pastaId).length
      const filhas = pastas.filter((p) => p.pasta_pai_id === pastaId)
      const totalFilhas = filhas.reduce((acc, f) => acc + contarRecursivo(f.id), 0)

      contagens[pastaId] = diretos + totalFilhas
      return contagens[pastaId]
    }

    pastas.forEach((p) => contarRecursivo(p.id))
    return contagens
  }, [arquivos, arquivosCompartilhados, pastas])

  const subpastasDaAtiva = useMemo(() => {
    if (pastaAtiva === null) return []

    const dePastas = pastas.filter((p) => p.pasta_pai_id === pastaAtiva)
    const deCompartilhadas = subpastasCompartilhadas.filter(
      (p) => p.pasta_pai_id === pastaAtiva
    )

    const ids = new Set<number>()
    const unificadas = [...dePastas, ...deCompartilhadas].filter((p) => {
      if (ids.has(p.id)) return false
      ids.add(p.id)
      return true
    })

    return unificadas.sort((a, b) => a.nome.localeCompare(b.nome))
  }, [pastas, subpastasCompartilhadas, pastaAtiva])

  function contarItensDaPasta(pastaId: number): number {
    const arquivosDiretos = arquivosCompartilhados.filter(
      (a) => a.pasta_id === pastaId
    ).length
    const subpastasDiretas = pastas.filter((p) => p.pasta_pai_id === pastaId).length
    return arquivosDiretos + subpastasDiretas
  }

  const caminhoPastas = useMemo(() => {
    if (pastaAtiva === null) return []

    if (pastaCompartilhadaAtiva) {
      return [
        {
          id: pastaCompartilhadaAtiva.id,
          usuario_id: pastaCompartilhadaAtiva.usuario_id,
          nome: pastaCompartilhadaAtiva.nome,
          pasta_pai_id: null,
          favorito: pastaCompartilhadaAtiva.favorito,
          data_criacao: pastaCompartilhadaAtiva.data_criacao
        } as Pasta
      ]
    }

    const caminho: Pasta[] = []
    let atual: Pasta | undefined = pastas.find((p) => p.id === pastaAtiva)
    while (atual) {
      caminho.unshift(atual)
      const paiId = atual.pasta_pai_id
      atual = paiId ? pastas.find((p) => p.id === paiId) : undefined
    }
    return caminho
  }, [pastaAtiva, pastas, pastaCompartilhadaAtiva])

  function abrirRenomear(arquivo: Arquivo) {
    setArquivoRenomeando(arquivo)
    setNovoNome(arquivo.nome_original)
    setMostrarErrosRenomearPasta(false)
  }

  async function confirmarRenomear() {
    if (!arquivoRenomeando) return
    setMostrarErrosRenomearPasta(true)
    if (!validacaoRenomearArquivo.valido) return
    const nome = novoNome.trim()
    if (nome === arquivoRenomeando.nome_original) {
      setArquivoRenomeando(null)
      return
    }

    try {
      await renomearArquivo(arquivoRenomeando.id, nome)
      setArquivos((atual) =>
        atual.map((a) => (a.id === arquivoRenomeando.id ? { ...a, nome_original: nome } : a))
      )
      toast.sucesso('Arquivo renomeado')
    } catch {
      toast.erro('Não foi possível renomear o arquivo')
    } finally {
      setArquivoRenomeando(null)
      setNovoNome('')
    }
  }

  async function confirmarDeletar() {
    if (!arquivoDeletando) return

    try {
      await deletarArquivo(arquivoDeletando.id)
      setArquivos((atual) => atual.filter((a) => a.id !== arquivoDeletando.id))
      toast.sucesso('Arquivo excluído')
      await recarregarPastaAtiva()
    } catch {
      toast.erro('Não foi possível excluir o arquivo')
    } finally {
      setArquivoDeletando(null)
    }
  }

  async function handleFavoritar(arquivo: Arquivo) {
    const novoValor = arquivo.favorito === 1 || arquivo.favorito === true ? false : true

    try {
      await favoritarArquivo(arquivo.id, novoValor)
      setArquivos((atual) =>
        atual.map((a) =>
          a.id === arquivo.id ? { ...a, favorito: novoValor ? 1 : 0 } : a
        )
      )
      toast.sucesso(novoValor ? 'Adicionado aos favoritos' : 'Removido dos favoritos')
    } catch {
      toast.erro('Não foi possível atualizar o favorito')
    }
  }

  async function handleUpload(lista: FileList) {
    if (!usuario) return

    const arquivosArray = Array.from(lista)
    let sucessos = 0
    let falhas = 0

    for (const arq of arquivosArray) {
      try {
        await uploadArquivo(arq, usuario.id, pastaAtiva)
        sucessos++
      } catch {
        falhas++
      }
    }

    if (sucessos > 0) {
      toast.sucesso(
        `${sucessos} arquivo${sucessos > 1 ? 's' : ''} enviado${sucessos > 1 ? 's' : ''}`
      )
      await carregarTudo()
      await recarregarPastaAtiva()
    }

    if (falhas > 0) {
      toast.erro(`${falhas} arquivo${falhas > 1 ? 's' : ''} falhou ao enviar`)
    }
  }

  function abrirModalNovaPasta(paiSugerido: number | null = null) {
    setPaiNovaPasta(paiSugerido)
    setNomeNovaPasta('')
    setMostrarErrosNovaPasta(false)
    setModalNovaPasta(true)
  }

  async function confirmarNovaPasta() {
    if (!usuario) return
    setMostrarErrosNovaPasta(true)
    if (!validacaoNovaPasta.valido) return
    const nome = nomeNovaPasta.trim()

    setCriandoPasta(true)
    try {
      const novaPasta = await criarPasta(usuario.id, nome, paiNovaPasta)
      setPastas((atual) => [...atual, novaPasta])
      toast.sucesso(`Pasta "${nome}" criada`)
      setModalNovaPasta(false)
      setNomeNovaPasta('')
      setPaiNovaPasta(null)
    } catch {
      toast.erro('Não foi possível criar a pasta')
    } finally {
      setCriandoPasta(false)
    }
  }

  function abrirRenomearPasta(pasta: Pasta) {
    setPastaRenomeando(pasta)
    setNomePastaRenomeando(pasta.nome)
    setMostrarErrosRenomearPasta(false)
  }

  async function confirmarRenomearPasta() {
    if (!pastaRenomeando) return
    setMostrarErrosRenomearPasta(true)
    if (!validacaoRenomearPasta.valido) return
    const nome = nomePastaRenomeando.trim()
    if (nome === pastaRenomeando.nome) {
      setPastaRenomeando(null)
      return
    }

    setRenomeandoPasta(true)
    try {
      await renomearPasta(pastaRenomeando.id, nome)
      setPastas((atual) =>
        atual.map((p) => (p.id === pastaRenomeando.id ? { ...p, nome } : p))
      )
      toast.sucesso('Pasta renomeada')
      setPastaRenomeando(null)
    } catch {
      toast.erro('Não foi possível renomear a pasta')
    } finally {
      setRenomeandoPasta(false)
    }
  }

  function abrirDeletarPasta(pasta: Pasta) {
    setPastaDeletando(pasta)
  }

  async function confirmarDeletarPasta() {
    if (!pastaDeletando) return

    setDeletandoPasta(true)
    try {
      await deletarPasta(pastaDeletando.id)

      const idsRemovidos = new Set<number>()
      const fila = [pastaDeletando.id]
      while (fila.length > 0) {
        const atual = fila.shift()!
        idsRemovidos.add(atual)
        pastas
          .filter((p) => p.pasta_pai_id === atual)
          .forEach((p) => fila.push(p.id))
      }

      setPastas((atual) => atual.filter((p) => !idsRemovidos.has(p.id)))
      setArquivos((atual) => atual.filter((a) => !a.pasta_id || !idsRemovidos.has(a.pasta_id)))

      if (pastaAtiva !== null && idsRemovidos.has(pastaAtiva)) {
        setPastaAtiva(null)
      }

      toast.sucesso('Pasta excluída')
      setPastaDeletando(null)
    } catch {
      toast.erro('Não foi possível excluir a pasta')
    } finally {
      setDeletandoPasta(false)
    }
  }

  function calcularConteudoPasta(pastaId: number) {
    const ids = new Set<number>()
    const fila = [pastaId]
    while (fila.length > 0) {
      const atual = fila.shift()!
      ids.add(atual)
      pastas
        .filter((p) => p.pasta_pai_id === atual)
        .forEach((p) => fila.push(p.id))
    }

    const subpastas = ids.size - 1
    const arquivosCount = arquivos.filter((a) => a.pasta_id && ids.has(a.pasta_id)).length

    return { subpastas, arquivos: arquivosCount }
  }

  async function recarregarCompartilhamentos() {
    if (!usuario) return
    const [listaComigo, listaPorMim] = await Promise.all([
      listarCompartilhadosComigo(usuario.id),
      listarCompartilhadosPorMim(usuario.id)
    ])
    setCompartilhadosComigo(listaComigo)
    setCompartilhadosPorMim(listaPorMim)
  }

  function abrirEditarPermissao(item: CompartilhamentoFeito) {
    setEditandoPermissao(item)
    setNovaPermissao(item.permissao)
  }

  async function confirmarEditarPermissao() {
    if (!editandoPermissao) return
    if (novaPermissao === editandoPermissao.permissao) {
      setEditandoPermissao(null)
      return
    }

    setSalvandoPermissao(true)
    try {
      await editarPermissao(
        editandoPermissao.pasta_id,
        editandoPermissao.usuario_id,
        novaPermissao
      )
      toast.sucesso('Permissão atualizada')
      setEditandoPermissao(null)
      await recarregarCompartilhamentos()
    } catch {
      toast.erro('Não foi possível atualizar a permissão')
    } finally {
      setSalvandoPermissao(false)
    }
  }

  function abrirRemoverCompartilhamentoFeito(item: CompartilhamentoFeito) {
    setRemovendoCompartilhamento({ tipo: 'feito', item })
  }

  function abrirRemoverCompartilhamentoRecebido(item: CompartilhamentoRecebido) {
    setRemovendoCompartilhamento({ tipo: 'recebido', item })
  }

  async function confirmarRemocaoCompartilhamento() {
    if (!removendoCompartilhamento) return

    setExecutandoRemocao(true)
    try {
      if (removendoCompartilhamento.tipo === 'feito') {
        const item = removendoCompartilhamento.item as CompartilhamentoFeito
        await removerCompartilhamento(item.pasta_id, item.usuario_id)
      } else {
        const item = removendoCompartilhamento.item as CompartilhamentoRecebido
        await removerCompartilhamento(item.id, usuario!.id)
        if (pastaAtiva === item.id) setPastaAtiva(null)
      }
      toast.sucesso('Compartilhamento removido')
      setRemovendoCompartilhamento(null)
      await recarregarCompartilhamentos()
    } catch {
      toast.erro('Não foi possível remover o compartilhamento')
    } finally {
      setExecutandoRemocao(false)
    }
  }

  function abrirCompartilhar(pasta: Pasta) {
    setPastaCompartilhando(pasta)
    setEmailCompartilhar('')
    setPermissaoCompartilhar('visualizar')
    setMostrarErrosCompartilhar(false)
  }

  async function confirmarCompartilhar() {
    if (!pastaCompartilhando) return
    setMostrarErrosCompartilhar(true)
    if (!validacaoCompartilhar.valido) return
    const email = emailCompartilhar.trim()

    setCompartilhando(true)
    try {
      await compartilharPasta(pastaCompartilhando.id, email, permissaoCompartilhar)
      toast.sucesso(`Pasta compartilhada com ${email}`)
      setPastaCompartilhando(null)
      await recarregarCompartilhamentos()
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 404) {
        toast.erro('Usuário não encontrado com esse email')
      } else {
        toast.erro('Não foi possível compartilhar a pasta')
      }
    } finally {
      setCompartilhando(false)
    }
  }

  function abrirSeletor() {
    setModalSeletor(true)
  }

  function arquivosAdicionados(ids: number[]) {
    if (pastaAtiva === null) return
    const setIds = new Set(ids)
    setArquivos((atual) =>
      atual.map((a) => (setIds.has(a.id) ? { ...a, pasta_id: pastaAtiva } : a))
    )
  }

  function abrirComentar(arquivo: Arquivo) {
    setArquivoComentando(arquivo)
  }

  function salvarComentarioLocal(arquivoId: number, comentario: string) {
    const atualizar = (lista: Arquivo[]) =>
      lista.map((a) => (a.id === arquivoId ? { ...a, comentario: comentario || null } : a))

    setArquivos(atualizar)
    setArquivosCompartilhados(atualizar)
  }

  function abrirMover(arquivo: Arquivo) {
    setArquivoMovendo(arquivo)
    setPastaDestino(arquivo.pasta_id)
  }

  async function confirmarMover() {
    if (!arquivoMovendo) return

    if (pastaDestino === arquivoMovendo.pasta_id) {
      setArquivoMovendo(null)
      return
    }

    setMovendo(true)
    try {
      await moverArquivo(arquivoMovendo.id, pastaDestino)
      setArquivos((atual) =>
        atual.map((a) => (a.id === arquivoMovendo.id ? { ...a, pasta_id: pastaDestino } : a))
      )
      toast.sucesso('Arquivo movido')
      await recarregarPastaAtiva()
      setArquivoMovendo(null)
    } catch {
      toast.erro('Não foi possível mover o arquivo')
    } finally {
      setMovendo(false)
    }
  }

  function handleAbrirArquivo(arquivo: Arquivo) {
    if (
      arquivo.tipo_arquivo === 'imagem' ||
      arquivo.tipo_arquivo === 'texto' ||
      arquivo.tipo_arquivo === 'pdf' ||
      arquivo.tipo_arquivo === 'word' ||
      arquivo.tipo_arquivo === 'excel' ||
      arquivo.tipo_arquivo === 'powerpoint'
    ) {
      setArquivoAberto(arquivo)
      return
    }
    window.open(`/uploads/${arquivo.nome_arquivo}`, '_blank')
  }

  function handleBaixarArquivo(arquivo: Arquivo) {
    const url = `/uploads/${arquivo.nome_arquivo}`
    const link = document.createElement('a')
    link.href = url
    link.download = arquivo.nome_original
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  function handleAbrirPasta(pastaId: number) {
    setPastaAtiva(pastaId)
  }

  useEffect(() => {
    const idsUnicos = new Set<number>()
    const todos = [...arquivos, ...arquivosCompartilhados].filter((a) => {
      if (idsUnicos.has(a.id)) return false
      idsUnicos.add(a.id)
      return true
    })
    favoritos.sincronizar(todos)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arquivos])

  useEffect(() => {
    favoritos.registrarHandlers({
      onAbrir: handleAbrirArquivo,
      onBaixar: handleBaixarArquivo,
      onAlternarFavorito: handleFavoritar
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const validacaoNovaPasta = useMemo(
    () => validarCampos({ nome: validarObrigatorio(nomeNovaPasta) }),
    [nomeNovaPasta]
  )

  const validacaoRenomearPasta = useMemo(
    () => validarCampos({ nome: validarObrigatorio(nomePastaRenomeando) }),
    [nomePastaRenomeando]
  )

  const validacaoRenomearArquivo = useMemo(
    () => validarCampos({ nome: validarObrigatorio(novoNome) }),
    [novoNome]
  )

  const validacaoCompartilhar = useMemo(
    () => validarCampos({ email: validarEmail(emailCompartilhar) }),
    [emailCompartilhar]
  )

  const podeEditar = !pastaCompartilhadaAtiva || pastaCompartilhadaAtiva.permissao === 'editar'

  const propsComuns = {
    onFavoritar: handleFavoritar,
    onDeletar: setArquivoDeletando,
    onAbrir: handleAbrirArquivo,
    onBaixar: handleBaixarArquivo,
    onRenomear: abrirRenomear,
    onAbrirPasta: handleAbrirPasta,
    onMover: abrirMover,
    onComentar: abrirComentar,
    podeEditar
  }

  return (
    <AppLayout>
      <div className="dashboard-shell">
        <Sidebar
          pastas={pastas}
          subpastasCompartilhadas={subpastasCompartilhadas}
          pastaAtiva={pastaAtiva}
          contagensArquivos={contagensArquivosPorPasta}
          compartilhadosComigo={compartilhadosComigo}
          compartilhadosPorMim={compartilhadosPorMim}
          onSelecionarPasta={(id) => {
            setPastaAtiva(id)
            setPastaCompartilhadaAtiva(null)
          }}
          onAbrirCompartilhada={(id) => {
            const comp = compartilhadosComigo.find((c) => c.id === id)
            setPastaAtiva(id)
            setPastaCompartilhadaAtiva(comp ?? null)
          }}
          onNovaPasta={() => abrirModalNovaPasta(pastaAtiva)}
          onRenomearPasta={abrirRenomearPasta}
          onDeletarPasta={abrirDeletarPasta}
          onCompartilharPasta={abrirCompartilhar}
          onAdicionarExistentes={(pasta) => {
            setPastaCompartilhadaAtiva(null)
            setPastaAtiva(pasta.id)
            setModalSeletor(true)
          }}
          onAdicionarSubpasta={(pasta) => {
            setPastaCompartilhadaAtiva(null)
            setPastaAtiva(pasta.id)
            abrirModalNovaPasta(pasta.id)
          }}
          onEditarPermissao={abrirEditarPermissao}
          onRemoverCompartilhamentoFeito={abrirRemoverCompartilhamentoFeito}
          onRemoverCompartilhamentoRecebido={abrirRemoverCompartilhamentoRecebido}
        />
        <section className="dashboard-conteudo">
          <BarraAcoes
            busca={busca}
            onBuscaChange={setBusca}
            visualizacao={visualizacao}
            onVisualizacaoChange={setVisualizacao}
            onUpload={handleUpload}
            mostrarAcoes={podeEditar}
          />

          {caminhoPastas.length > 0 && (
            <nav className="dashboard-caminho" aria-label="Caminho da pasta">
              <FiFolder className="dashboard-caminho-icon" />
              <button
                type="button"
                className="dashboard-caminho-item"
                onClick={() => {
                  setPastaAtiva(null)
                  setPastaCompartilhadaAtiva(null)
                }}
              >
                Raiz
              </button>
              {caminhoPastas.map((pasta, i) => {
                const ultima = i === caminhoPastas.length - 1
                return (
                  <span key={pasta.id} className="dashboard-caminho-grupo">
                    <span className="dashboard-caminho-separador">›</span>
                    {ultima ? (
                      <span className="dashboard-caminho-atual">{pasta.nome}</span>
                    ) : (
                      <button
                        type="button"
                        className="dashboard-caminho-item"
                        onClick={() => setPastaAtiva(pasta.id)}
                      >
                        {pasta.nome}
                      </button>
                    )}
                  </span>
                )
              })}
              <div className="dashboard-caminho-acoes">
                {pastaAtiva !== null && podeEditar && (
                  <>
                    <button
                      type="button"
                      className="dashboard-caminho-compartilhar dashboard-caminho-compartilhar-secundario"
                      onClick={() => abrirModalNovaPasta(pastaAtiva)}
                    >
                      <FiFolderPlus />
                      <span>Nova pasta</span>
                    </button>
                    <button
                      type="button"
                      className="dashboard-caminho-compartilhar dashboard-caminho-compartilhar-secundario"
                      onClick={abrirSeletor}
                    >
                      <FiCopy />
                      <span>Adicionar existentes</span>
                    </button>
                  </>
                )}

                {pastaAtiva !== null && !pastaCompartilhadaAtiva && (
                  <button
                    type="button"
                    className="dashboard-caminho-compartilhar"
                    onClick={() => {
                      const pasta = pastas.find((p) => p.id === pastaAtiva)
                      if (pasta) abrirCompartilhar(pasta)
                    }}
                  >
                    <FiShare2 />
                    <span>Compartilhar</span>
                  </button>
                )}
              </div>
            </nav>
          )}

          <FiltrosTipo
            ativo={filtro}
            onChange={setFiltro}
            contagens={contagensPorTipo}
          />

          {podeEditar && (
            <UploadZone onUpload={handleUpload} onVerFormatos={() => setModalFormatos(true)} />
          )}

          {carregando ? (
            <Spinner centralizado mensagem="Carregando arquivos..." />
          ) : erro ? (
            <EstadoVazio
              icone={<FiRefreshCw />}
              titulo="Algo deu errado"
              descricao={erro}
              acao={
                <Button onClick={() => void carregarTudo()} icon={<FiRefreshCw />}>
                  Tentar novamente
                </Button>
              }
            />
          ) : arquivosFiltrados.length === 0 && subpastasDaAtiva.length === 0 ? (
            <EstadoVazio
              icone={pastaAtiva !== null ? <FiFolder /> : <FiUploadCloud />}
              titulo={
                pastaAtiva !== null
                  ? 'Pasta vazia'
                  : arquivos.length === 0
                    ? 'Nenhum arquivo ainda'
                    : 'Nada encontrado'
              }
              descricao={
                pastaAtiva !== null
                  ? 'Envie ou mova arquivos para esta pasta'
                  : arquivos.length === 0
                    ? 'Envie seu primeiro arquivo para começar'
                    : 'Tente ajustar a busca ou o filtro'
              }
              acao={
                arquivos.length === 0 ? (
                  <Button
                    variant="success"
                    icon={<FiUploadCloud />}
                    onClick={() =>
                      document.querySelector<HTMLInputElement>('input[type=file]')?.click()
                    }
                  >
                    Enviar arquivo
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <>
              {visualizacao === 'grid' ? (
                <div className="grid-arquivos">
                  {pastaAtiva !== null &&
                    subpastasDaAtiva.map((subpasta) => (
                      <CardSubpasta
                        key={`pasta-${subpasta.id}`}
                        pasta={subpasta}
                        contagemArquivos={contarItensDaPasta(subpasta.id)}
                        onAbrir={(p) => setPastaAtiva(p.id)}
                      />
                    ))}

                  {paginacao.itensPaginados.map((a) => (
                    <CardArquivo
                      key={a.id}
                      arquivo={a}
                      pasta={pastas.find((p) => p.id === a.pasta_id) ?? null}
                      {...propsComuns}
                    />
                  ))}
                </div>
              ) : (
                <div className="lista-arquivos">
                  {pastaAtiva !== null &&
                    subpastasDaAtiva.map((subpasta) => (
                      <LinhaSubpasta
                        key={`pasta-${subpasta.id}`}
                        pasta={subpasta}
                        contagemArquivos={contarItensDaPasta(subpasta.id)}
                        onAbrir={(p) => setPastaAtiva(p.id)}
                      />
                    ))}

                  {paginacao.itensPaginados.map((a) => (
                    <LinhaArquivo
                      key={a.id}
                      arquivo={a}
                      pasta={pastas.find((p) => p.id === a.pasta_id) ?? null}
                      {...propsComuns}
                    />
                  ))}
                </div>
              )}

              <Paginacao
                paginaAtual={paginacao.paginaAtual}
                totalPaginas={paginacao.totalPaginas}
                totalItens={paginacao.totalItens}
                itensPorPagina={paginacao.itensPorPagina}
                onMudarPagina={paginacao.mudarPagina}
                onMudarItensPorPagina={paginacao.mudarItensPorPagina}
              />
            </>
          )}
        </section>
      </div>

      <Modal
        open={modalNovaPasta}
        onClose={() => setModalNovaPasta(false)}
        title="Nova pasta"
        icon={<FiFolderPlus />}
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setModalNovaPasta(false)}
              disabled={criandoPasta}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmarNovaPasta}
              loading={criandoPasta}
              loadingText="Criando..."
              disabled={!validacaoNovaPasta.valido}
            >
              Criar
            </Button>
          </>
        }
      >
        <div className="modal-form">
          <Input
            label="Nome da pasta"
            placeholder="Ex: Documentos"
            value={nomeNovaPasta}
            onChange={(e) => setNomeNovaPasta(e.target.value)}
            error={mostrarErrosNovaPasta ? validacaoNovaPasta.erros.nome : undefined}
            autoFocus
          />

          <div className="modal-form-grupo">
            <label className="modal-form-label">Criar dentro de</label>
            <select
              className="modal-form-select"
              value={paiNovaPasta ?? ''}
              onChange={(e) =>
                setPaiNovaPasta(e.target.value ? Number(e.target.value) : null)
              }
            >
              <option value="">Raiz (sem pasta pai)</option>
              {pastas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!arquivoRenomeando}
        onClose={() => setArquivoRenomeando(null)}
        title="Renomear arquivo"
        icon={<FiEdit2 />}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setArquivoRenomeando(null)}>
              Cancelar
            </Button>
            <Button onClick={confirmarRenomear} disabled={!validacaoRenomearArquivo.valido}>
              Salvar
            </Button>
          </>
        }
      >
        <Input
          label="Novo nome"
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
          error={mostrarErrosRenomearPasta ? validacaoRenomearArquivo.erros.nome : undefined}
          autoFocus
        />
      </Modal>

      <Modal
        open={!!arquivoDeletando}
        onClose={() => setArquivoDeletando(null)}
        title="Excluir arquivo"
        icon={<FiTrash2 />}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setArquivoDeletando(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmarDeletar}>
              Excluir
            </Button>
          </>
        }
      >
        <p>
          Tem certeza que deseja excluir <strong>{arquivoDeletando?.nome_original}</strong>?
          Essa ação não pode ser desfeita.
        </p>
      </Modal>


      <Modal
        open={!!pastaRenomeando}
        onClose={() => setPastaRenomeando(null)}
        title="Renomear pasta"
        icon={<FiEdit2 />}
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setPastaRenomeando(null)}
              disabled={renomeandoPasta}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmarRenomearPasta}
              loading={renomeandoPasta}
              loadingText="Salvando..."
              disabled={!validacaoRenomearPasta.valido}
            >
              Salvar
            </Button>
          </>
        }
      >
        <Input
          label="Novo nome"
          value={nomePastaRenomeando}
          onChange={(e) => setNomePastaRenomeando(e.target.value)}
          error={mostrarErrosRenomearPasta ? validacaoRenomearPasta.erros.nome : undefined}
          autoFocus
        />
      </Modal>

      <Modal
        open={!!pastaDeletando}
        onClose={() => setPastaDeletando(null)}
        title="Excluir pasta"
        icon={<FiAlertTriangle />}
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setPastaDeletando(null)}
              disabled={deletandoPasta}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={confirmarDeletarPasta}
              loading={deletandoPasta}
              loadingText="Excluindo..."
            >
              Excluir tudo
            </Button>
          </>
        }
      >
        {pastaDeletando && (
          <div className="pasta-deletar-aviso">
            <p>
              Você está prestes a excluir <strong>{pastaDeletando.nome}</strong>.
            </p>
            {(() => {
              const info = calcularConteudoPasta(pastaDeletando.id)
              if (info.subpastas === 0 && info.arquivos === 0) {
                return <p className="pasta-deletar-detalhe">Esta pasta está vazia.</p>
              }
              return (
                <div className="pasta-deletar-detalhe pasta-deletar-perigo">
                  <strong>Esta ação é irreversível.</strong>
                  <ul>
                    {info.arquivos > 0 && (
                      <li>
                        <strong>{info.arquivos}</strong>{' '}
                        {info.arquivos === 1 ? 'arquivo será excluído' : 'arquivos serão excluídos'}
                      </li>
                    )}
                    {info.subpastas > 0 && (
                      <li>
                        <strong>{info.subpastas}</strong>{' '}
                        {info.subpastas === 1 ? 'subpasta será excluída' : 'subpastas serão excluídas'}
                      </li>
                    )}
                  </ul>
                </div>
              )
            })()}
          </div>
        )}
      </Modal>


      <Modal
        open={!!arquivoMovendo}
        onClose={() => setArquivoMovendo(null)}
        title="Mover arquivo"
        icon={<FiMove />}
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setArquivoMovendo(null)}
              disabled={movendo}
            >
              Cancelar
            </Button>
            <Button onClick={confirmarMover} loading={movendo} loadingText="Movendo...">
              Mover
            </Button>
          </>
        }
      >
        <div className="modal-form">
          <p className="modal-form-descricao">
            Escolha o destino para <strong>{arquivoMovendo?.nome_original}</strong>:
          </p>

          <div className="modal-form-grupo">
            <label className="modal-form-label">Pasta destino</label>
            <select
              className="modal-form-select"
              value={pastaDestino ?? ''}
              onChange={(e) =>
                setPastaDestino(e.target.value ? Number(e.target.value) : null)
              }
            >
              <option value="">Raiz (sem pasta)</option>
              {pastas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Modal>


      <Modal
        open={!!pastaCompartilhando}
        onClose={() => setPastaCompartilhando(null)}
        title="Compartilhar pasta"
        icon={<FiShare2 />}
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setPastaCompartilhando(null)}
              disabled={compartilhando}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmarCompartilhar}
              loading={compartilhando}
              loadingText="Compartilhando..."
              disabled={!validacaoCompartilhar.valido}
            >
              Compartilhar
            </Button>
          </>
        }
      >
        <div className="modal-form">
          <p className="modal-form-descricao">
            Compartilhe <strong>{pastaCompartilhando?.nome}</strong> com outro usuário
          </p>

          <Input
            label="Email do usuário"
            type="email"
            placeholder="usuario@email.com"
            value={emailCompartilhar}
            onChange={(e) => setEmailCompartilhar(e.target.value)}
            error={mostrarErrosCompartilhar ? validacaoCompartilhar.erros.email : undefined}
            autoFocus
          />

          <div className="modal-form-grupo">
            <label className="modal-form-label">Permissão</label>
            <select
              className="modal-form-select"
              value={permissaoCompartilhar}
              onChange={(e) => setPermissaoCompartilhar(e.target.value as Permissao)}
            >
              <option value="visualizar">Visualizar (apenas ver)</option>
              <option value="editar">Editar (ver, mover, renomear)</option>
            </select>
          </div>
        </div>
      </Modal>


      <Modal
        open={!!editandoPermissao}
        onClose={() => setEditandoPermissao(null)}
        title="Editar permissão"
        icon={<FiEdit2 />}
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setEditandoPermissao(null)}
              disabled={salvandoPermissao}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmarEditarPermissao}
              loading={salvandoPermissao}
              loadingText="Salvando..."
            >
              Salvar
            </Button>
          </>
        }
      >
        {editandoPermissao && (
          <div className="modal-form">
            <p className="modal-form-descricao">
              Pasta <strong>{editandoPermissao.pasta_nome}</strong> compartilhada com{' '}
              <strong>{editandoPermissao.usuario_email}</strong>
            </p>
            <div className="modal-form-grupo">
              <label className="modal-form-label">Permissão</label>
              <select
                className="modal-form-select"
                value={novaPermissao}
                onChange={(e) => setNovaPermissao(e.target.value as Permissao)}
              >
                <option value="visualizar">Visualizar (apenas ver)</option>
                <option value="editar">Editar (ver, mover, renomear)</option>
              </select>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!removendoCompartilhamento}
        onClose={() => setRemovendoCompartilhamento(null)}
        title={
          removendoCompartilhamento?.tipo === 'feito'
            ? 'Remover compartilhamento'
            : 'Remover da minha lista'
        }
        icon={<FiAlertTriangle />}
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setRemovendoCompartilhamento(null)}
              disabled={executandoRemocao}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={confirmarRemocaoCompartilhamento}
              loading={executandoRemocao}
              loadingText="Removendo..."
            >
              Remover
            </Button>
          </>
        }
      >
        {removendoCompartilhamento?.tipo === 'feito' && (
          <p>
            Remover o acesso de{' '}
            <strong>
              {(removendoCompartilhamento.item as CompartilhamentoFeito).usuario_email}
            </strong>{' '}
            à pasta{' '}
            <strong>
              {(removendoCompartilhamento.item as CompartilhamentoFeito).pasta_nome}
            </strong>
            ? A pasta continua existindo pra você.
          </p>
        )}
        {removendoCompartilhamento?.tipo === 'recebido' && (
          <p>
            Remover{' '}
            <strong>
              {(removendoCompartilhamento.item as CompartilhamentoRecebido).nome}
            </strong>{' '}
            da sua lista? Você perderá acesso até ser compartilhada novamente.
          </p>
        )}
      </Modal>

      <ModalFormatos aberto={modalFormatos} onFechar={() => setModalFormatos(false)} />

      <ModalSeletorArquivos
        aberto={modalSeletor}
        onFechar={() => setModalSeletor(false)}
        pastaDestinoId={pastaAtiva}
        arquivosDisponiveis={arquivos}
        pastas={pastas}
        onAdicionados={arquivosAdicionados}
      />

      <ModalComentario
        arquivo={arquivoComentando}
        onFechar={() => setArquivoComentando(null)}
        onSalvo={salvarComentarioLocal}
      />

      <VisualizadorArquivo
        arquivo={arquivoAberto}
        onClose={() => setArquivoAberto(null)}
        onBaixar={handleBaixarArquivo}
      />
    </AppLayout>
  )
}
