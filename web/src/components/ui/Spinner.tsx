import './Spinner.css'

interface SpinnerProps {
  tamanho?: 'sm' | 'md' | 'lg'
  mensagem?: string
  centralizado?: boolean
}

export function Spinner({
  tamanho = 'md',
  mensagem,
  centralizado = false
}: SpinnerProps) {
  return (
    <div className={`spinner-wrap ${centralizado ? 'spinner-wrap-centralizado' : ''}`}>
      <div className={`spinner spinner-${tamanho}`} />
      {mensagem && <p className="spinner-mensagem">{mensagem}</p>}
    </div>
  )
}
