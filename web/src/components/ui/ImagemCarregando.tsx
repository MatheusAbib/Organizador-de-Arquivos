import { useState, type ImgHTMLAttributes } from 'react'
import './ImagemCarregando.css'

interface ImagemCarregandoProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
}

export function ImagemCarregando({ src, alt, className = '', ...rest }: ImagemCarregandoProps) {
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)

  if (erro) {
    return (
      <div className={`imagem-carregando-fallback ${className}`}>
        <span>Imagem indisponível</span>
      </div>
    )
  }

  return (
    <div className={`imagem-carregando-wrapper ${className}`}>
      {carregando && <div className="imagem-carregando-shimmer" />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setCarregando(false)}
        onError={() => {
          setCarregando(false)
          setErro(true)
        }}
        className={`imagem-carregando-img ${carregando ? 'imagem-carregando-oculta' : ''}`}
        {...rest}
      />
    </div>
  )
}
