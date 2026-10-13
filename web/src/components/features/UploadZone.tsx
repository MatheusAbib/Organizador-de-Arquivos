import { useRef, useState, type ChangeEvent, type DragEvent, type MouseEvent } from 'react'
import { FiInfo, FiUploadCloud } from 'react-icons/fi'
import './UploadZone.css'

interface UploadZoneProps {
  onUpload: (arquivos: FileList) => void
  onVerFormatos?: () => void
}

export function UploadZone({ onUpload, onVerFormatos }: UploadZoneProps) {
  const [arrastando, setArrastando] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleArquivos(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files)
      e.target.value = ''
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setArrastando(false)
    if (e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files)
    }
  }

  return (
    <div
      className={`upload-zone ${arrastando ? 'upload-zone-ativo' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setArrastando(true)
      }}
      onDragLeave={() => setArrastando(false)}
      onDrop={handleDrop}
    >
      <FiUploadCloud className="upload-zone-icon" />
      <p className="upload-zone-titulo">
        Arraste arquivos ou clique para enviar
      </p>
      <small className="upload-zone-info">
        PDF, Word, Excel, PowerPoint, imagens, texto, vídeo e mais · até 1GB
      </small>

      {onVerFormatos && (
        <button
          type="button"
          className="upload-zone-formatos"
          onClick={(e: MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation()
            onVerFormatos()
          }}
        >
          <FiInfo /> Ver formatos suportados
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={handleArquivos}
      />
    </div>
  )
}
