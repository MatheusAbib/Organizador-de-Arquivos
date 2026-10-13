import type { Arquivo } from '@/types/arquivo'
import { VisualizadorImagem } from './VisualizadorImagem'
import { VisualizadorTexto } from './VisualizadorTexto'
import { VisualizadorPDF } from './VisualizadorPDF'
import { VisualizadorWord } from './VisualizadorWord'
import { VisualizadorExcel } from './VisualizadorExcel'
import { VisualizadorPowerPoint } from './VisualizadorPowerPoint'

interface VisualizadorArquivoProps {
  arquivo: Arquivo | null
  onClose: () => void
  onBaixar: (arquivo: Arquivo) => void
}

export function VisualizadorArquivo({ arquivo, onClose, onBaixar }: VisualizadorArquivoProps) {
  if (!arquivo) return null

  if (arquivo.tipo_arquivo === 'imagem') {
    return <VisualizadorImagem arquivo={arquivo} onClose={onClose} onBaixar={onBaixar} />
  }

  if (arquivo.tipo_arquivo === 'texto') {
    return <VisualizadorTexto arquivo={arquivo} onClose={onClose} onBaixar={onBaixar} />
  }

  if (arquivo.tipo_arquivo === 'pdf') {
    return <VisualizadorPDF arquivo={arquivo} onClose={onClose} onBaixar={onBaixar} />
  }

  if (arquivo.tipo_arquivo === 'word') {
    return <VisualizadorWord arquivo={arquivo} onClose={onClose} onBaixar={onBaixar} />
  }

  if (arquivo.tipo_arquivo === 'excel') {
    return <VisualizadorExcel arquivo={arquivo} onClose={onClose} onBaixar={onBaixar} />
  }

  if (arquivo.tipo_arquivo === 'powerpoint') {
    return <VisualizadorPowerPoint arquivo={arquivo} onClose={onClose} onBaixar={onBaixar} />
  }

  return null
}
