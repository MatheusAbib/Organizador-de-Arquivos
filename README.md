
# 📁 Organizador de Arquivos

O **Organizador de Arquivos** é uma plataforma web completa para gerenciamento de arquivos, desenvolvida para oferecer uma solução robusta e intuitiva para organização, compartilhamento e colaboração. Com suporte a mais de 50 formatos de arquivo, o sistema permite que usuários organizem seus documentos em pastas, compartilhem com outros usuários e mantenham tudo sincronizado em um ambiente seguro.

> 🔗 **Acesse online:** [jornal-de-receitas-b6ti.onrender.com](https://jornal-de-receitas-b6ti.onrender.com)

---

### 🎯 Propósito

Criado para resolver problemas comuns de organização digital, o sistema oferece:

- ✅ Organização hierárquica de arquivos em pastas e subpastas
- ✅ Compartilhamento seguro com níveis de permissão
- ✅ Sistema de favoritos para acesso rápido
- ✅ Comentários e anotações em arquivos
- ✅ Busca avançada com filtros por tipo
- ✅ Visualização em grade ou lista
- ✅ Visualizadores embutidos (PDF, Word, Excel, PowerPoint, imagem, texto)
- ✅ Painel administrativo completo
- ✅ Autenticação JWT com rotas protegidas
- ✅ Tema claro/escuro persistente

---

## 🚀 Tecnologias Utilizadas

### Frontend

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React_Router-7-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)
![CSS](https://img.shields.io/badge/CSS_Puro-000000?style=for-the-badge&logo=css3&logoColor=white)

### Backend

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-5-404D59?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)
![Multer](https://img.shields.io/badge/Multer-upload-FF6B6B?style=for-the-badge)
![bcrypt](https://img.shields.io/badge/bcrypt-senha-8B4513?style=for-the-badge)

### Bibliotecas de Visualização

![mammoth](https://img.shields.io/badge/mammoth-Word-2B579A?style=for-the-badge&logo=microsoftword&logoColor=white)
![xlsx](https://img.shields.io/badge/xlsx-Excel-217346?style=for-the-badge&logo=microsoftexcel&logoColor=white)
![pptx-preview](https://img.shields.io/badge/pptx--preview-PowerPoint-D24726?style=for-the-badge&logo=microsoftpowerpoint&logoColor=white)

---

## 🏗️ Arquitetura

O projeto é dividido em duas aplicações independentes:

```
Organizador-Arquivos/
├── backend/     → API REST (Node.js + Express + MySQL)
├── web/         → Interface (React + TypeScript + Vite)
├── uploads/     → Arquivos dos usuários
└── temp/        → ZIPs temporários (download de pastas)
```

O frontend consome a API do backend via `/api/*`, com autenticação JWT.

---

## ✨ Funcionalidades

### 🔐 Autenticação

- Login com JWT (expiração de 7 dias)
- Cadastro de usuários
- Rotas protegidas no frontend e no backend
- Middleware de admin para rotas restritas
- Logout com confirmação

### 📂 Gerenciamento de Arquivos

- Upload de múltiplos arquivos (até 1GB)
- Criação de pastas e subpastas (hierarquia ilimitada)
- Renomear, mover e excluir arquivos
- Adicionar arquivos existentes a uma pasta
- Visualização em grade ou lista
- Filtros por tipo de arquivo com contagem
- Paginação configurável

### 📁 Gerenciamento de Pastas

- Árvore de pastas com expandir/recolher
- Contador de arquivos por pasta (recursivo)
- Navegação com breadcrumb clicável
- Deletar pasta recursivamente (com aviso de conteúdo)
- Subpastas visíveis dentro da pasta pai

### 🔗 Compartilhamento

- Compartilhar pastas com outros usuários por email
- Permissões: `visualizar` ou `editar`
- Gerenciar compartilhamentos feitos e recebidos
- Editar permissões
- Respeitar permissões (bloqueia ações quando apenas visualizar)

### ⭐ Favoritos

- Marcar arquivos como favoritos
- Modal dedicado com todos os favoritos
- Contador na barra de navegação
- Estrela preenchida em amarelo quando ativo

### 💬 Comentários

- Adicionar comentários aos arquivos
- Editar ou remover comentários
- Ícone destacado quando o arquivo tem comentário

### 🔍 Busca Avançada

- Busca em tempo real por nome
- Filtros por tipo (PDF, Word, Excel, PowerPoint, Imagem, Texto, Vídeo)
- Contagem de itens por filtro
- Botão para limpar busca

### 🖼️ Visualizadores Embutidos

- **Imagem** — visualizador fullscreen com zoom
- **PDF** — iframe nativo com opções de download/abrir em nova aba
- **Word** (.docx) — renderização HTML via mammoth
- **Excel** (.xlsx) — tabela interativa com múltiplas abas
- **PowerPoint** (.pptx) — renderização de slides via pptx-preview (com fallback Office Online)
- **Texto** (.txt) — exibição monoespaçada com copiar/imprimir

### 👤 Perfil de Usuário

- Editar nome, email e senha
- Tema claro/escuro persistente
- Modal de perfil acessível pelo menu do usuário

### 👑 Painel Administrativo

- Estatísticas do sistema (usuários, arquivos, pastas, espaço)
- Tabela de usuários com paginação
- Ver/editar qualquer usuário
- Inativar/reativar usuário (com justificativa)
- Promover usuário a administrador
- Excluir usuário (com cascade de arquivos e pastas)

### 🎨 Interface

- Design responsivo (mobile, tablet, desktop)
- Tema claro/escuro com persistência
- Sistema de notificações (toast)
- Loaders e spinners em todas as operações
- Modal de confirmação para ações destrutivas
- Validação de formulários com feedback visual

---

## 📊 Formatos Suportados

| Categoria | Formatos |
|-----------|----------|
| 📄 Documentos | PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX, TXT, RTF, ODT, ODS, ODP, MD |
| 🖼️ Imagens | JPG/JPEG, PNG, GIF, BMP, SVG, WEBP, ICO |
| 🎵 Áudio | MP3, WAV, FLAC, AAC, OGG, M4A, WMA, OPUS |
| 🎬 Vídeo | MP4, AVI, MOV, WMV, MKV, WEBM, FLV, M4V |
| 📦 Compactados | ZIP, RAR, 7Z, TAR, GZ, BZ2, XZ |
| 💻 Código | HTML, CSS, JS, TS, PHP, PY, JAVA, C/C++, JSON, XML, SQL |
| 🎨 Design | PSD, AI, EPS, CDR, DWG, DXF |

---

## 🔒 Segurança

- Senhas criptografadas com **bcrypt** (10 rounds)
- Autenticação via **JWT** (expiração de 7 dias)
- Middleware de autenticação em todas as rotas de dados
- Middleware de admin em rotas `/api/admin/*`
- Validação de propriedade de recursos
- Variáveis sensíveis em `.env` (nunca versionadas)
- CORS configurado com origem controlada
