import { FiMoon, FiSun } from 'react-icons/fi'
import { useTema } from '@/hooks/useTema'
import './BotaoTema.css'

export function BotaoTema() {
  const { tema, alternarTema } = useTema()
  const escuro = tema === 'escuro'

  return (
    <button
      type="button"
      className="botao-tema"
      onClick={alternarTema}
      title={escuro ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
    >
      {escuro ? <FiSun /> : <FiMoon />}
      <span>{escuro ? 'Claro' : 'Escuro'}</span>
    </button>
  )
}
