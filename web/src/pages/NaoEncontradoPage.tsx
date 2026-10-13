import { Link } from 'react-router-dom'

export function NaoEncontradoPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '2rem',
        background: 'var(--bg-body)'
      }}
    >
      <h1 style={{ fontSize: '4rem', color: 'var(--accent-base)' }}>404</h1>
      <p style={{ color: 'var(--text-muted)' }}>Página não encontrada</p>
      <Link
        to="/"
        style={{
          color: 'var(--accent-base)',
          textDecoration: 'underline',
          fontWeight: 600
        }}
      >
        Voltar ao início
      </Link>
    </div>
  )
}
