import {
  FiFile,
  FiFileText,
  FiImage,
  FiVideo
} from 'react-icons/fi'
import {
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint
} from 'react-icons/fa'
import type { TipoArquivo } from '@/types/arquivo'

interface EstiloTipo {
  icone: React.ReactNode
  label: string
  cor: string
}

export const estilosPorTipo: Record<TipoArquivo, EstiloTipo> = {
  pdf: { icone: <FaFilePdf />, label: 'PDF', cor: '#f56565' },
  word: { icone: <FaFileWord />, label: 'Word', cor: '#4299e1' },
  excel: { icone: <FaFileExcel />, label: 'Excel', cor: '#48bb78' },
  powerpoint: { icone: <FaFilePowerpoint />, label: 'PowerP', cor: '#ed8936' },
  imagem: { icone: <FiImage />, label: 'Imagem', cor: '#48bb78' },
  texto: { icone: <FiFileText />, label: 'Texto', cor: '#718096' },
  video: { icone: <FiVideo />, label: 'Vídeo', cor: '#fbbf24' },
  outros: { icone: <FiFile />, label: 'Outro', cor: '#a0aec0' }
}

export function obterEstiloTipo(tipo: TipoArquivo): EstiloTipo {
  return estilosPorTipo[tipo] ?? estilosPorTipo.outros
}
