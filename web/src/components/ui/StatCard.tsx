import type { ReactNode } from 'react'
import './StatCard.css'

interface StatCardProps {
  icone: ReactNode
  label: string
  valor: string | number
  cor?: string
}

export function StatCard({ icone, label, valor, cor }: StatCardProps) {
  return (
    <div className="stat-card">
      <div
        className="stat-card-icone"
        style={cor ? { background: `${cor}20`, color: cor } : undefined}
      >
        {icone}
      </div>
      <div className="stat-card-info">
        <span className="stat-card-label">{label}</span>
        <span className="stat-card-valor">{valor}</span>
      </div>
    </div>
  )
}
