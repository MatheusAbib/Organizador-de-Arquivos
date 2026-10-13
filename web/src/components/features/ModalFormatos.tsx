import { FiFile } from 'react-icons/fi'
import { Modal } from '@/components/ui/Modal'
import './ModalFormatos.css'

interface ModalFormatosProps {
  aberto: boolean
  onFechar: () => void
}

const categorias = [
  {
    nome: 'Documentos',
    cor: '#4299e1',
    formatos: [
      'PDF',
      'DOC / DOCX',
      'XLS / XLSX',
      'PPT / PPTX',
      'TXT',
      'RTF',
      'ODT / ODS / ODP',
      'MD'
    ]
  },
  {
    nome: 'Imagens',
    cor: '#48bb78',
    formatos: ['JPG / JPEG', 'PNG', 'GIF', 'BMP', 'SVG', 'WEBP', 'ICO']
  },
  {
    nome: 'Compactados',
    cor: '#ed8936',
    formatos: ['ZIP', 'RAR', '7Z', 'TAR', 'GZ']
  },
  {
    nome: 'Mídia',
    cor: '#9f7aea',
    formatos: ['MP3', 'WAV', 'MP4', 'AVI', 'MOV', 'WMV', 'MKV', 'WEBM']
  },
  {
    nome: 'Código / Texto',
    cor: '#f56565',
    formatos: ['CSV', 'JSON', 'XML', 'HTML', 'CSS', 'JS', 'PHP', 'PY', 'JAVA', 'C / C++']
  },
  {
    nome: 'Design / CAD',
    cor: '#e53e3e',
    formatos: ['PSD', 'AI', 'EPS', 'DWG', 'DXF', 'CDR']
  }
]

export function ModalFormatos({ aberto, onFechar }: ModalFormatosProps) {
  return (
    <Modal
      open={aberto}
      onClose={onFechar}
      title="Formatos suportados"
      icon={<FiFile />}
      size="lg"
    >
      <div className="formatos-intro">
        <span className="formatos-badge formatos-badge-azul">50+ formatos</span>
        <span className="formatos-badge formatos-badge-verde">Máx 1GB por arquivo</span>
        <span className="formatos-badge formatos-badge-roxo">Upload ilimitado</span>
      </div>

      <div className="formatos-grid">
        {categorias.map((cat) => (
          <div key={cat.nome} className="formatos-categoria">
            <div
              className="formatos-categoria-cabecalho"
              style={{ borderBottomColor: `${cat.cor}40` }}
            >
              <span className="formatos-bolinha" style={{ background: cat.cor }} />
              <h3>{cat.nome}</h3>
              <span
                className="formatos-categoria-contagem"
                style={{ background: `${cat.cor}20`, color: cat.cor }}
              >
                {cat.formatos.length}
              </span>
            </div>
            <div className="formatos-chips">
              {cat.formatos.map((f) => (
                <span key={f} className="formatos-chip" style={{ color: cat.cor }}>
                  {f}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  )
}
