export type Tema = 'claro' | 'escuro'

export interface TemaContextValue {
  tema: Tema
  alternarTema: () => void
  definirTema: (tema: Tema) => void
}
