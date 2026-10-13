import { useEffect, useMemo, useState } from 'react'
import { FiMessageSquare } from 'react-icons/fi'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/hooks/useToast'
import { comentarArquivo } from '@/services/arquivos'
import type { Arquivo } from '@/types/arquivo'
import { validarCampos, validarObrigatorio } from '@/utils/validacao'
import './ModalComentario.css'

interface ModalComentarioProps {
  arquivo: Arquivo | null
  onFechar: () => void
  onSalvo: (arquivoId: number, comentario: string) => void
}

export function ModalComentario({ arquivo, onFechar, onSalvo }: ModalComentarioProps) {
  const toast = useToast()
  const [texto, setTexto] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [mostrarErro, setMostrarErro] = useState(false)

  useEffect(() => {
    if (arquivo) {
      setTexto(arquivo.comentario ?? '')
      setMostrarErro(false)
    }
  }, [arquivo])

  const validacao = useMemo(
    () => validarCampos({ comentario: validarObrigatorio(texto) }),
    [texto]
  )

  async function salvar() {
    if (!arquivo) return
    setMostrarErro(true)
    if (!validacao.valido) return

    setSalvando(true)
    try {
      await comentarArquivo(arquivo.id, texto.trim())
      onSalvo(arquivo.id, texto.trim())
      toast.sucesso('Comentário salvo')
      onFechar()
    } catch {
      toast.erro('Não foi possível salvar o comentário')
    } finally {
      setSalvando(false)
    }
  }

  async function remover() {
    if (!arquivo) return
    setSalvando(true)
    try {
      await comentarArquivo(arquivo.id, '')
      onSalvo(arquivo.id, '')
      toast.sucesso('Comentário removido')
      onFechar()
    } catch {
      toast.erro('Não foi possível remover o comentário')
    } finally {
      setSalvando(false)
    }
  }

  if (!arquivo) return null

  const temComentarioSalvo = !!arquivo.comentario

  return (
    <Modal
      open={!!arquivo}
      onClose={onFechar}
      title="Comentário"
      icon={<FiMessageSquare />}
      size="sm"
      footer={
        <>
          {temComentarioSalvo && (
            <Button variant="danger" onClick={remover} disabled={salvando}>
              Remover
            </Button>
          )}
          <Button variant="secondary" onClick={onFechar} disabled={salvando}>
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
      }
    >
      <div className="modal-form">
        <p className="modal-form-descricao">
          Comentário em <strong>{arquivo.nome_original}</strong>
        </p>

        <div className="modal-form-grupo">
          <textarea
            className={`modal-form-textarea ${
              mostrarErro && validacao.erros.comentario ? 'modal-form-textarea-erro' : ''
            }`}
            placeholder="Escreva seu comentário sobre este arquivo..."
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={5}
            autoFocus
          />
          {mostrarErro && validacao.erros.comentario && (
            <span className="modal-form-erro-texto">{validacao.erros.comentario}</span>
          )}
        </div>
      </div>
    </Modal>
  )
}
