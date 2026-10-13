export function validarObrigatorio(valor: string): string | null {
  if (!valor || !valor.trim()) return 'Campo obrigatório'
  return null
}

export function validarEmail(valor: string): string | null {
  if (!valor || !valor.trim()) return 'Campo obrigatório'
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!regex.test(valor.trim())) return 'Email inválido'
  return null
}

export function validarSenha(valor: string, minimo = 6): string | null {
  if (!valor) return 'Campo obrigatório'
  if (valor.length < minimo) return `Mínimo ${minimo} caracteres`
  return null
}

export function validarSenhaOpcional(valor: string, minimo = 6): string | null {
  if (!valor) return null
  if (valor.length < minimo) return `Mínimo ${minimo} caracteres`
  return null
}

export interface ResultadoValidacao {
  valido: boolean
  erros: Record<string, string>
}

export function validarCampos(regras: Record<string, string | null>): ResultadoValidacao {
  const erros: Record<string, string> = {}
  for (const [campo, erro] of Object.entries(regras)) {
    if (erro) erros[campo] = erro
  }
  return { valido: Object.keys(erros).length === 0, erros }
}
