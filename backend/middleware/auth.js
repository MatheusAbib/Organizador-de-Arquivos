const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = '7d'

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET não definido no .env')
}

function gerarToken(usuario) {
  return jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      tipo: usuario.tipo
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

function extrairToken(req) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) return null
  return header.slice(7).trim()
}

function authMiddleware(req, res, next) {
  const token = extrairToken(req)

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' })
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.usuario = payload
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado', expirado: true })
    }
    return res.status(401).json({ error: 'Token inválido' })
  }
}

function adminMiddleware(req, res, next) {
  if (!req.usuario) {
    return res.status(401).json({ error: 'Não autenticado' })
  }
  if (req.usuario.tipo !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito a administradores' })
  }
  next()
}

module.exports = {
  gerarToken,
  authMiddleware,
  adminMiddleware
}
