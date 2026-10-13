import { useEffect, useState } from 'react'
import { FiStar } from 'react-icons/fi'
import { Modal } from '@/components/ui/Modal'
import { EstadoVazio } from '@/components/ui/EstadoVazio'
import { CardArquivo } from '@/components/features/CardArquivo'
import { Spinner } from '@/components/ui/Spinner'
import { useFavoritos } from '@/hooks/useFavoritos'
import { useAuth } from '@/hooks/useAuth'
import { listarArquivos, listarArquivosEmPastas } from '@/services/arquivos'
import type { Arquivo } from '@/types/arquivo'
import './ModalFavoritos.css'

export function ModalFavoritos() {
  const { modalAberto, fecharModal, abrirArquivo, baixarArquivo, alternarFavorito } =
    useFavoritos()
  const { usuario } = useAuth()

  const [favoritos, setFavoritos] = useState<Arquivo[]>([])
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    if (!modalAberto || !usuario) return

    let cancelado = false
    setCarregando(true)

    Promise.all([listarArquivos(usuario.id), listarArquivosEmPastas(usuario.id)])
      .then(([raiz, pastas]) => {
        if (cancelado) return
        const todos = [...raiz, ...pastas]
        const idsUnicos = new Set<number>()
        const unicos = todos.filter((a) => {
          if (idsUnicos.has(a.id)) return false
          idsUnicos.add(a.id)
          return true
        })
        setFavoritos(unicos.filter((a) => a.favorito === 1 || a.favorito === true))
      })
      .catch(() => {
        if (!cancelado) setFavoritos([])
      })
      .finally(() => {
        if (!cancelado) setCarregando(false)
      })

    return () => {
      cancelado = true
    }
  }, [modalAberto, usuario])

  function removerLocalmente(arquivo: Arquivo) {
    setFavoritos((atual) => atual.filter((a) => a.id !== arquivo.id))
    alternarFavorito(arquivo)
  }

  return (
    <Modal
      open={modalAberto}
      onClose={fecharModal}
      title="Meus Favoritos"
      icon={<FiStar />}
      size="lg"
    >
      {carregando ? (
        <Spinner centralizado mensagem="Carregando favoritos..." />
      ) : favoritos.length === 0 ? (
        <EstadoVazio
          icone={<FiStar />}
          titulo="Nenhum favorito ainda"
          descricao="Marque arquivos com a estrela para acessá-los rapidamente aqui"
        />
      ) : (
        <div className="modal-favoritos-grid">
          {favoritos.map((arquivo) => (
            <CardArquivo
              key={arquivo.id}
              arquivo={arquivo}
              onFavoritar={removerLocalmente}
              onAbrir={abrirArquivo}
              onBaixar={baixarArquivo}
              podeEditar={false}
            />
          ))}
        </div>
      )}
    </Modal>
  )
}
