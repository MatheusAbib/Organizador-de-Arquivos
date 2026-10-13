import {
  FiAward,
  FiCloud,
  FiDatabase,
  FiFolder,
  FiCode,
  FiLock,
  FiMail,
  FiPhone,
  FiShield
} from 'react-icons/fi'
import { FaLinkedin } from 'react-icons/fa'
import './Footer.css'

interface FooterProps {
  compacto?: boolean
}

export function Footer({ compacto = false }: FooterProps) {
  if (compacto) {
    return (
      <footer className="footer footer-compacto">
        <div className="footer-compacto-conteudo">
          <div className="footer-compacto-marca">
            <FiFolder />
            <span>Organizador de Arquivos</span>
          </div>
          <div className="footer-compacto-autor">
            © 2026{' '}
            <a
              href="https://matheus-abib-portfolio.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Matheus Abib
            </a>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="footer">
      <div className="footer-conteudo">
        <div className="footer-main">
          <div className="footer-marca">
            <h2>
              <FiFolder /> Organizador de Arquivos
            </h2>
            <p className="footer-descricao">
              Plataforma profissional para gerenciamento de arquivos.
              <br />
              Solução completa para pessoas que buscam organização e segurança.
            </p>
          </div>

          <div className="footer-links-grid">
            <div className="footer-coluna">
              <h3>Funcionalidades</h3>
              <ul>
                <li>Gerenciamento de Arquivos</li>
                <li>Pastas Compartilhadas</li>
                <li>Sistema de Favoritos</li>
                <li>Comentários e Anotações</li>
                <li>Busca Avançada</li>
              </ul>
            </div>

            <div className="footer-coluna">
              <h3>Soluções</h3>
              <ul>
                <li>Para Empresas</li>
                <li>Para Equipes</li>
                <li>Para Profissionais</li>
                <li>Para Uso Pessoal</li>
              </ul>
            </div>

            <div className="footer-coluna">
              <h3>Suporta</h3>
              <ul>
                <li>PDF</li>
                <li>TXT</li>
                <li>Word</li>
                <li>Excel</li>
                <li>PowerPoint</li>
                <li>Outros</li>
              </ul>
            </div>

            <div className="footer-coluna">
              <h3>Legal</h3>
              <ul>
                <li>Senha Criptografada</li>
                <li>Conexão Segura</li>
                <li>Proteção de Dados</li>
                <li>Autenticação Segura</li>
                <li>Conformidade com LGPD</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-corporativo">
          <div className="footer-info">
            <div className="footer-info-item">
              <FiCode />
              <div>
                <strong>Desenvolvedor</strong>
                <span>Matheus Bilitardo Abib</span>
              </div>
            </div>

            <div className="footer-info-item">
              <FiPhone />
              <div>
                <strong>Telefone</strong>
                <span>11 97507-2008</span>
              </div>
            </div>

            <div className="footer-info-item">
              <FiMail />
              <div>
                <strong>Email Pessoal</strong>
                <span>matheus.abib.ma@gmail.com</span>
              </div>
            </div>

            <div className="footer-info-item">
              <FaLinkedin />
              <div>
                <strong>LinkedIn</strong>
                <a
                  href="https://www.linkedin.com/in/matheusabib/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  linkedin.com/in/matheusabib
                </a>
              </div>
            </div>
          </div>

          <div className="footer-certificacoes">
            <div className="footer-cert">
              <FiShield />
              <span>Certificado SSL 256 bits</span>
            </div>
            <div className="footer-cert">
              <FiLock />
              <span>Criptografia End-to-End</span>
            </div>
            <div className="footer-cert">
              <FiDatabase />
              <span>Backup Diário</span>
            </div>
            <div className="footer-cert">
              <FiCloud />
              <span>99.9% Uptime</span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-conteudo">
          <div className="footer-copyright">
            <FiAward /> 2026 Organizador de Arquivos. Todos os direitos reservados.
          </div>
          <div className="footer-desenvolvido">
            Desenvolvido por{' '}
            <a
              href="https://matheus-abib-portfolio.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Matheus Abib
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
