    let todosArquivos = [];
    let todasPastas = [];
    let compartilhados = [];
    let pastaAtual = null;
    let pastaModalAtual = null;
    let filtroAtual = 'todos';
    let termoBusca = '';
    let visualizacaoAtual = 'grid';
    let arquivoEditando = null;
    let arquivoParaMover = null;
    let pastasExpandidas = new Set(); 

    let arquivosSelecionados = new Set();
    let todosArquivosParaSeletor = [];

    let paginaAtual = 1;
    let itensPorPagina = 9;
    let totalArquivosFiltrados = 0;

    let favoritosPaginaAtual = 1;
    let favoritosItensPorPagina = 8;
    let totalFavoritos = 0;

    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario) {
        window.location.href = 'index.html';
    } else {
        document.getElementById('userName').textContent = usuario.nome;
    }

    function carregarEstadoPastas() {
        const saved = localStorage.getItem(`pastasExpandidas_${usuario.id}`);
        if (saved) {
            pastasExpandidas = new Set(JSON.parse(saved));
        }
    }

    function salvarEstadoPastas() {
        localStorage.setItem(`pastasExpandidas_${usuario.id}`, JSON.stringify([...pastasExpandidas]));
    }

async function carregarDados() {
    await carregarPastas();
    await carregarArquivos();
    await carregarCompartilhados();
    await carregarEstadoPastas();
}


function abrirSeletorArquivos() {
    todosArquivosParaSeletor = todosArquivos.filter(a => a.pasta_id !== pastaModalAtual);
    
    arquivosSelecionados.clear();
    document.getElementById('seletorArquivosModal').classList.add('active');
    toggleBodyScroll(true);
    renderizarSeletorArquivos(todosArquivosParaSeletor);
}

    function fecharSeletorArquivos() {
        document.getElementById('seletorArquivosModal').classList.remove('active');
        arquivosSelecionados.clear();
        toggleBodyScroll(false);
    }


    let modalDropdownAberto = false;

    function toggleModalDropdown() {
        const dropdown = document.getElementById('modalDropdown');
        modalDropdownAberto = !modalDropdownAberto;
        dropdown.style.display = modalDropdownAberto ? 'block' : 'none';
    }

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.pasta-actions-dropdown')) {
            const dropdown = document.getElementById('modalDropdown');
            if (dropdown) {
                dropdown.style.display = 'none';
                modalDropdownAberto = false;
            }
        }
    });

    function renderizarSeletorArquivos(arquivos) {
        const lista = document.getElementById('seletorArquivosLista');
        const termoBusca = document.getElementById('seletorBusca').value.toLowerCase();
        
        let arquivosFiltrados = arquivos;
        if (termoBusca) {
            arquivosFiltrados = arquivos.filter(a => 
                a.nome_original.toLowerCase().includes(termoBusca)
            );
        }
        
        if (arquivosFiltrados.length === 0) {
            lista.innerHTML = '<div class="empty-state">Nenhum arquivo disponível</div>';
            return;
        }
        
        lista.innerHTML = arquivosFiltrados.map(arquivo => {
            let icone = 'fa-file';
            let classeCor = 'outros';

            if (arquivo.tipo_arquivo === 'imagem') {
                icone = 'fa-file-image';
                classeCor = 'imagem';
            } else if (arquivo.tipo_arquivo === 'pdf') {
                icone = 'fa-file-pdf';
                classeCor = 'pdf';
            } else if (arquivo.tipo_arquivo === 'word') {
                icone = 'fa-file-word';
                classeCor = 'word';
            } else if (arquivo.tipo_arquivo === 'excel') {
                icone = 'fa-file-excel';
                classeCor = 'excel';
            } else if (arquivo.tipo_arquivo === 'powerpoint') {
                icone = 'fa-file-powerpoint';
                classeCor = 'powerpoint';
            }
            
            let localizacao = 'Raiz';
            if (arquivo.pasta_id) {
                const pasta = todasPastas.find(p => p.id === arquivo.pasta_id);
                if (pasta) localizacao = pasta.nome;
            }
            
            const tamanho = (arquivo.tamanho / 1024).toFixed(2) + ' KB';
            
            return `
                <div class="seletor-arquivo-item ${arquivosSelecionados.has(arquivo.id) ? 'selected' : ''}" onclick="toggleSelecaoArquivo(${arquivo.id})">
                    <input type="checkbox" ${arquivosSelecionados.has(arquivo.id) ? 'checked' : ''} onclick="event.stopPropagation()">
                    <span class="icone ${classeCor}"><i class="fas ${icone}"></i></span>
                    <div class="info">
                        <div class="nome">${arquivo.nome_original}</div>
                        <div class="meta">
                            <span>${tamanho}</span>
                            <span>${arquivo.tipo_arquivo}</span>
                            <span class="pasta-atual"><i class="fas fa-folder"></i> ${localizacao}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        atualizarBotaoSelecionados();
    }

    function toggleSelecaoArquivo(arquivoId) {
        if (arquivosSelecionados.has(arquivoId)) {
            arquivosSelecionados.delete(arquivoId);
        } else {
            arquivosSelecionados.add(arquivoId);
        }
        renderizarSeletorArquivos(todosArquivosParaSeletor);
    }

    function filtrarArquivosSeletor() {
        renderizarSeletorArquivos(todosArquivosParaSeletor);
    }

    function atualizarBotaoSelecionados() {
        const btn = document.getElementById('btnAdicionarSelecionados');
        const count = arquivosSelecionados.size;
        btn.textContent = ` Adicionar selecionados (${count})`;
        btn.disabled = count === 0;
    }

    async function adicionarArquivosSelecionados() {
        if (arquivosSelecionados.size === 0) {
            mostrarAlerta('Aviso', 'Nenhum arquivo selecionado');
            return;
        }
        
        let sucessos = 0;
        let erros = 0;
        
        for (const arquivoId of arquivosSelecionados) {
            try {
                const response = await fetch(`http://localhost:3000/api/arquivos/${arquivoId}/mover`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pasta_id: pastaModalAtual })
                });
                
                if (response.ok) {
                    sucessos++;
                } else {
                    erros++;
                }
            } catch (error) {
                console.error('Erro ao mover arquivo:', error);
                erros++;
            }
        }
        
        await carregarArquivos();
        await abrirModalPasta(pastaModalAtual);
        
        fecharSeletorArquivos();
        
        if (erros === 0) {
            mostrarNotificacao(`${sucessos} arquivo(s) adicionado(s) à pasta!`);
        } else {
            mostrarNotificacao(`${sucessos} adicionado(s), ${erros} erro(s)`);
        }
    }

async function carregarArquivos() {
    try {
        const response = await fetch(`http://localhost:3000/api/arquivos/${usuario.id}`);
        todosArquivos = await response.json();
        paginaAtual = 1;
        
        const favoritosCount = todosArquivos.filter(a => a.favorito === 1 || a.favorito === true).length;
        atualizarContadorFavoritos(favoritosCount);
        
        if (todasPastas.length > 0) {
            aplicarFiltroEBusca();
        }
    } catch (error) {
        console.error('Erro ao carregar arquivos:', error);
    }
}

    async function carregarPastas() {
        try {
            const response = await fetch(`http://localhost:3000/api/pastas/${usuario.id}`);
            todasPastas = await response.json();
            renderizarPastas();
            
            if (todosArquivos.length > 0) {
                aplicarFiltroEBusca();
            }
        } catch (error) {
            console.error('Erro ao carregar pastas:', error);
        }
    }
    async function carregarCompartilhados() {
        try {
            const response = await fetch(`http://localhost:3000/api/compartilhados/${usuario.id}`);
            compartilhados = await response.json();
            console.log('Pastas compartilhadas carregadas:', compartilhados);
            renderizarCompartilhados();
        } catch (error) {
            console.error('Erro ao carregar compartilhados:', error);
        }
    }

    function renderizarPastas() {
        const pastasRaiz = todasPastas.filter(p => p.pasta_pai_id === null);
        const lista = document.getElementById('pastasList');
        
        pastasRaiz.sort((a, b) => a.nome.localeCompare(b.nome));
        
        const pastasHtml = pastasRaiz.map(pasta => renderizarPastaItem(pasta, 0)).join('');
        
        lista.innerHTML = `
            <li class="pasta-item root" onclick="fecharModalPasta()" style="cursor: pointer;">
                <i class="fas fa-folder-open"></i> Todos os arquivos
            </li>
            ${pastasHtml}
        `;
    }

    function renderizarPastaItem(pasta, nivel) {
        const temFilhos = todasPastas.some(p => p.pasta_pai_id === pasta.id);
        const estaExpandida = pastasExpandidas.has(pasta.id);
        
        const pastaCompartilhada = compartilhados.find(c => c.id === pasta.id);
        const permissao = pastaCompartilhada ? pastaCompartilhada.permissao : 'proprietario';
        
        const indentacao = nivel > 0 ? '　'.repeat(nivel) + '└─ ' : '';
        
        return `
            <li class="pasta-item">
                ${temFilhos ? `
                    <span class="expand-icon" onclick="event.stopPropagation(); togglePasta(${pasta.id})">
                        ${estaExpandida ? '<i class="fas fa-chevron-down"></i>' : '<i class="fas fa-chevron-right"></i>'}
                    </span>
                ` : '<span class="expand-icon" style="opacity: 0;"><i class="fas fa-chevron-right"></i></span>'}
                
                <div class="pasta-nome" onclick="abrirModalPasta(${pasta.id})">
                    <span title="${pasta.nome}">${indentacao}${pastaCompartilhada ? '<i class="fas fa-share-alt"></i>' : '<i class="fas fa-folder"></i>'} ${pasta.nome}</span>
                    ${pastaCompartilhada ? `<small>(${permissao})</small>` : ''}
                </div>
            </li>
            ${temFilhos && estaExpandida ? renderizarSubPastas(pasta.id, nivel + 1) : ''}
        `;
    }

    let dropdownAtivo = null;

    function toggleDropdown(pastaId, event) {
        event.stopPropagation();
        
        if (dropdownAtivo === pastaId) {
            dropdownAtivo = null;
        } else {
            dropdownAtivo = pastaId;
        }
        
        renderizarPastas();
    }

    document.addEventListener('click', function() {
        if (dropdownAtivo) {
            dropdownAtivo = null;
            renderizarPastas();
        }
    });

    function renderizarSubPastas(pastaPaiId, nivel) {
        const subPastas = todasPastas.filter(p => p.pasta_pai_id === pastaPaiId);
        if (subPastas.length === 0) return '';
        
        return subPastas.map(pasta => renderizarPastaItem(pasta, nivel)).join('');
    }

    function togglePasta(pastaId) {
        if (pastasExpandidas.has(pastaId)) {
            pastasExpandidas.delete(pastaId);
        } else {
            pastasExpandidas.add(pastaId);
        }
        salvarEstadoPastas();
        renderizarPastas();
    }

    let todasPastasExpandidas = false;

    function toggleTodasPastas() {
        if (todasPastasExpandidas) {
            recolherTodasPastas();
            document.getElementById('toggleIcon').innerHTML = '<i class="fas fa-chevron-down"></i>';
            document.getElementById('toggleText').textContent = 'Expandir';
        } else {
            expandirTodasPastas();
            document.getElementById('toggleIcon').innerHTML = '<i class="fas fa-chevron-up"></i>';
            document.getElementById('toggleText').textContent = 'Recolher';
        }
        todasPastasExpandidas = !todasPastasExpandidas;
    }

    function expandirTodasPastas() {
        todasPastas.forEach(pasta => pastasExpandidas.add(pasta.id));
        salvarEstadoPastas();
        renderizarPastas();
    }

    function recolherTodasPastas() {
        pastasExpandidas.clear();
        salvarEstadoPastas();
        renderizarPastas();
    }

    async function removerCompartilhamento(pastaId) {
        mostrarConfirmacao('Remover Compartilhamento', 'Remover esta pasta compartilhada da sua lista? Isso não exclui a pasta original.', async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/compartilhamentos/${pastaId}?usuario_id=${usuario.id}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    await carregarCompartilhados();
                    mostrarNotificacao('Pasta removida da sua lista');
                } else {
                    const data = await response.json();
                    mostrarAlerta('Erro', data.error || 'Erro ao remover compartilhamento');
                }
            } catch (error) {
                console.error('Erro ao remover compartilhamento:', error);
                mostrarAlerta('Erro', 'Erro ao remover compartilhamento');
            }
        });
    }

    function renderizarCompartilhados() {
        const lista = document.getElementById('compartilhadosList');
        
        if (compartilhados.length === 0) {
            lista.innerHTML = '<li style="color: #999; padding: 0.5rem;">Nenhuma pasta compartilhada com você</li>';
            return;
        }
        
        lista.innerHTML = compartilhados.map(pasta => `
            <li class="pasta-item" style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 0.5rem; flex: 1;" onclick="abrirModalPasta(${pasta.id}, true)">
                    <span><i class="fas fa-share-alt" style="color: #b88b4a;"></i></span>
                    <span>${pasta.nome}</span>
                    <small style="color: #999; font-size: 0.7rem;">(${pasta.permissao})</small>
                    <small style="color: #999; font-size: 0.7rem;">de ${pasta.proprietario_email}</small>
                </div>
                <div class="pasta-actions" onclick="event.stopPropagation()">
                    <button class="pasta-action-btn" onclick="downloadPasta(${pasta.id}, '${pasta.nome}')" title="Baixar pasta"><i class="fas fa-download"></i></button>
                    <button class="pasta-action-btn" onclick="removerCompartilhamento(${pasta.id})" title="Remover da minha lista"><i class="fas fa-times"></i></button>
                </div>
            </li>
        `).join('');
    }

async function abrirModalPasta(pastaId, isCompartilhado = false) {
    pastaModalAtual = pastaId;
    
    let pasta = todasPastas.find(p => p.id === pastaId);
    if (!pasta) {
        pasta = compartilhados.find(c => c.id === pastaId);
    }
    
    document.getElementById('pastaModalTitle').innerHTML = `<i class="fas fa-folder"></i> ${pasta ? pasta.nome : 'Pasta'}`;
    document.getElementById('pastaModal').classList.add('active');
    toggleBodyScroll(true);
    
    try {
        const response = await fetch(`http://localhost:3000/api/pasta/${pastaId}/conteudo?usuario_id=${usuario.id}`);
        
        if (!response.ok) {
            throw new Error('Erro ao carregar conteúdo');
        }
        
        const dados = await response.json();
        console.log('Conteúdo da pasta:', dados);
        
        const subPastas = dados.pastas || [];
        const arquivos = dados.arquivos || [];
        
        renderizarConteudoPasta(subPastas, arquivos);
    } catch (error) {
        console.error('Erro ao carregar conteúdo da pasta:', error);
        document.getElementById('pastaModalBody').innerHTML = '<div class="empty-state">Erro ao carregar conteúdo</div>';
    }
}

    function renderizarConteudoPasta(subPastas, arquivos) {
        const body = document.getElementById('pastaModalBody');
        
        const pastaCompartilhada = compartilhados.find(c => c.id === pastaModalAtual);
        const permissao = pastaCompartilhada ? pastaCompartilhada.permissao : 'proprietario';
        const podeEditar = permissao === 'proprietario' || permissao === 'editar';
        
        if (subPastas.length === 0 && arquivos.length === 0) {
            body.innerHTML = '<div class="empty-state">Pasta vazia</div>';
            return;
        }
        
        let html = '<div class="pasta-content-grid">';
        
        subPastas.forEach(pasta => {
            html += `
                <div class="pasta-content-item" onclick="abrirModalPasta(${pasta.id})">
                    <div class="icone"><i class="fas fa-folder-open fa-2x"></i></div>
                    <div class="nome">${pasta.nome}</div>
                    <div class="tipo">Pasta</div>
                    <div class="pasta-content-actions" onclick="event.stopPropagation()">
                        ${podeEditar ? `
                            <button class="content-action-btn" onclick="renomearPasta(${pasta.id})" title="Renomear"><i class="fas fa-edit"></i></button>
                        ` : ''}
                        ${permissao === 'proprietario' ? `
                            <button class="content-action-btn delete" onclick="deletarPasta(${pasta.id})" title="Excluir"><i class="fas fa-trash"></i></button>
                        ` : ''}
                    </div>
                </div>
            `;
        });
        
        arquivos.forEach(arquivo => {
            let icone = 'fa-file';
            let classeCor = 'outros';

            if (arquivo.tipo_arquivo === 'imagem') {
                icone = 'fa-file-image';
                classeCor = 'imagem';
            } else if (arquivo.tipo_arquivo === 'pdf') {
                icone = 'fa-file-pdf';
                classeCor = 'pdf';
            } else if (arquivo.tipo_arquivo === 'word') {
                icone = 'fa-file-word';
                classeCor = 'word';
            } else if (arquivo.tipo_arquivo === 'excel') {
                icone = 'fa-file-excel';
                classeCor = 'excel';
            } else if (arquivo.tipo_arquivo === 'powerpoint') {
                icone = 'fa-file-powerpoint';
                classeCor = 'powerpoint';
            } else if (arquivo.tipo_arquivo === 'texto') {
                icone = 'fa-file-alt';
                classeCor = 'texto';
            }
            
            const tamanho = (arquivo.tamanho / 1024).toFixed(2) + ' KB';
            
            html += `
                <div class="pasta-content-item">
                    <div class="icone ${classeCor}"><i class="fas ${icone} fa-2x"></i></div>
                    <div class="nome">${arquivo.nome_original}</div>
                    <div class="tipo">${arquivo.tipo_arquivo} • ${tamanho}</div>
                    <div class="pasta-content-actions" onclick="event.stopPropagation()">
                        <button class="content-action-btn ${arquivo.favorito ? 'active' : ''}" onclick="favoritarArquivo(${arquivo.id}, ${!arquivo.favorito})" title="${arquivo.favorito ? 'Desfavoritar' : 'Favoritar'}">
                            <i class="fas fa-star"></i>
                        </button>
                        <button class="content-action-btn" onclick="abrirArquivo('${arquivo.nome_arquivo}', '${arquivo.tipo_arquivo}')" title="Abrir"><i class="fas fa-eye"></i></button>
                        <button class="content-action-btn" onclick="baixarArquivo('${arquivo.nome_arquivo}')" title="Baixar"><i class="fas fa-download"></i></button>
                        <button class="content-action-btn ${arquivo.comentario ? 'active' : ''}" onclick="event.stopPropagation(); abrirComentarioModal(${arquivo.id})" title="${arquivo.comentario ? 'Editar comentário' : 'Adicionar comentário'}"><i class="fas fa-comment"></i></button>
                        ${podeEditar ? `
                            <button class="content-action-btn" onclick="iniciarEdicaoArquivo(${arquivo.id}, '${arquivo.nome_original}')" title="Renomear"><i class="fas fa-edit"></i></button>
                            <button class="content-action-btn" onclick="abrirMoverModal(${arquivo.id})" title="Mover para outra pasta"><i class="fas fa-folder-open"></i></button>
                            <button class="content-action-btn" onclick="removerDaPasta(${arquivo.id})" title="Remover da pasta"><i class="fas fa-arrow-left"></i></button>
                        ` : ''}
                        ${permissao === 'proprietario' ? `
                            <button class="content-action-btn delete" onclick="deletarArquivo(${arquivo.id})" title="Excluir"><i class="fas fa-trash"></i></button>
                        ` : ''}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        body.innerHTML = html;
    }

    async function removerDaPasta(arquivoId) {
        mostrarConfirmacao('Remover da Pasta', 'Remover este arquivo da pasta? Ele voltará para a raiz.', async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/arquivos/${arquivoId}/mover`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pasta_id: null })
                });
                
                if (response.ok) {
                    await carregarArquivos();
                    if (pastaModalAtual) {
                        await abrirModalPasta(pastaModalAtual);
                    }
                    mostrarNotificacao('Arquivo removido da pasta');
                } else {
                    mostrarAlerta('Erro', 'Erro ao remover arquivo da pasta');
                }
            } catch (error) {
                console.error('Erro ao remover da pasta:', error);
                mostrarAlerta('Erro', 'Erro ao remover arquivo da pasta');
            }
        });
    }

    function iniciarEdicaoArquivo(arquivoId, nomeAtual) {
        mostrarPrompt('Renomear Arquivo', 'Novo nome do arquivo:', nomeAtual, (novoNome) => {
            if (!novoNome || novoNome === nomeAtual) return;
            salvarEdicao(arquivoId, novoNome);
        });
    }

function fecharModalPasta() {
    document.getElementById('pastaModal').classList.remove('active');
    pastaModalAtual = null;
    toggleBodyScroll(false);
}

async function criarPasta(pastaPaiId = null) {
    mostrarPrompt('Nova Pasta', 'Nome da nova pasta:', '', async (nome) => {
        if (!nome) return;
        
        try {
            const response = await fetch('http://localhost:3000/api/pastas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuario_id: usuario.id,
                    nome: nome,
                    pasta_pai_id: pastaPaiId
                })
            });
            
            if (response.ok) {
                if (pastaPaiId) {
                    pastasExpandidas.add(pastaPaiId);
                    salvarEstadoPastas();
                }
                
                await carregarPastas();
                
                if (pastaModalAtual) {
                    await abrirModalPasta(pastaModalAtual);
                }
                
                mostrarNotificacao('Pasta criada com sucesso!');
            } else {
                mostrarAlerta('Erro', 'Erro ao criar pasta');
            }
        } catch (error) {
            console.error('Erro ao criar pasta:', error);
            mostrarAlerta('Erro', 'Erro ao criar pasta');
        }
    });
}

    function criarSubPasta(pastaId = null) {
        criarPasta(pastaId || pastaModalAtual);
    }

    function uploadParaPasta() {
        document.getElementById('fileInput').click();
    }

    async function uploadArquivos(files) {
        for (let file of files) {
            const formData = new FormData();
            formData.append('arquivo', file);
            formData.append('usuario_id', usuario.id);
            
            if (pastaModalAtual) {
                formData.append('pasta_id', pastaModalAtual);
            } else {
                formData.append('pasta_id', '');
            }

            try {
                const response = await fetch('http://localhost:3000/api/upload', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    await carregarArquivos();
                    if (pastaModalAtual) {
                        await abrirModalPasta(pastaModalAtual);
                    }
                } else {
                    const errorData = await response.json();
                    mostrarAlerta(`Erro no upload`, `Erro ao enviar ${file.name}: ${errorData.error || 'Erro desconhecido'}`);
                }
            } catch (error) {
                console.error('Erro no upload:', error);
                alert(`Erro ao enviar ${file.name}: Problema de conexão com o servidor`);
            }
        }
    }

    function mostrarNotificacao(mensagem) {
        let notificacao = document.getElementById('notificacao');
        if (!notificacao) {
            notificacao = document.createElement('div');
            notificacao.id = 'notificacao';
            notificacao.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #48bb78;
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                z-index: 2000;
                animation: slideIn 0.3s ease;
                font-weight: 500;
            `;
            document.body.appendChild(notificacao);
        }
        
        notificacao.innerHTML = `<i class="fas fa-check-circle"></i> ${mensagem}`;
        notificacao.style.display = 'block';
        
        setTimeout(() => {
            notificacao.style.display = 'none';
        }, 3000);
    }

async function renomearPasta(pastaId) {
    const pasta = todasPastas.find(p => p.id === pastaId);
    mostrarPrompt('Renomear Pasta', 'Novo nome da pasta:', pasta.nome, async (novoNome) => {
        if (!novoNome || novoNome === pasta.nome) return;
        
        try {
            const response = await fetch(`http://localhost:3000/api/pastas/${pastaId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome: novoNome })
            });
            
            if (response.ok) {
                await carregarPastas();
                
                if (pastaModalAtual === pastaId) {
                    document.getElementById('pastaModalTitle').innerHTML = `<i class="fas fa-folder"></i> ${novoNome}`;
                }
                
                if (pastaModalAtual) {
                    await abrirModalPasta(pastaModalAtual);
                }
                
                mostrarNotificacao('Pasta renomeada com sucesso!');
            } else {
                mostrarAlerta('Erro', 'Erro ao renomear pasta');
            }
        } catch (error) {
            console.error('Erro ao renomear pasta:', error);
            mostrarAlerta('Erro', 'Erro ao renomear pasta');
        }
    });
}

async function deletarPasta(pastaId) {
    mostrarConfirmacao('Excluir Pasta', 'Tem certeza que deseja deletar esta pasta? Os arquivos serão movidos para a raiz.', async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/pastas/${pastaId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                await carregarPastas();
                
                if (pastaModalAtual === pastaId) {
                    fecharModalPasta();
                } else if (pastaModalAtual) {
                    await abrirModalPasta(pastaModalAtual);
                }
                
                mostrarNotificacao('Pasta excluída com sucesso!');
            } else {
                mostrarAlerta('Erro', 'Erro ao deletar pasta');
            }
        } catch (error) {
            console.error('Erro ao deletar pasta:', error);
            mostrarAlerta('Erro', 'Erro ao deletar pasta');
        }
    });
}

    async function abrirCompartilharModal(pastaId) {
        mostrarPrompt('Compartilhar Pasta', 'Email do usuário para compartilhar:', '', async (email) => {
            if (!email) return;
            
            mostrarPrompt('Permissão', 'Permissão (visualizar/editar):', 'visualizar', async (permissao) => {
                if (!permissao || !['visualizar', 'editar'].includes(permissao)) {
                    mostrarAlerta('Erro', 'Permissão inválida');
                    return;
                }
                
                try {
                    const response = await fetch('http://localhost:3000/api/compartilhar', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            pasta_id: pastaId,
                            email_compartilhado: email,
                            permissao: permissao
                        })
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        mostrarNotificacao(`${data.message}`);
                        await carregarCompartilhados();
                    } else {
                        const data = await response.json();
                        mostrarAlerta('Erro', data.error || 'Erro ao compartilhar pasta');
                    }
                } catch (error) {
                    console.error('Erro ao compartilhar:', error);
                    mostrarAlerta('Erro', 'Erro ao compartilhar pasta');
                }
            });
        });
    }

    function buscarArquivos() {
        termoBusca = document.getElementById('buscaInput').value.toLowerCase();
        paginaAtual = 1;
        aplicarFiltroEBusca();
    }

    function filtrarArquivos(tipo) {
        filtroAtual = tipo;
        document.querySelectorAll('.filtro-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.toLowerCase().includes(tipo) || (tipo === 'todos' && btn.textContent.includes('Todos'))) {
                btn.classList.add('active');
            }
        });
        paginaAtual = 1;
        aplicarFiltroEBusca();
    }

    function mudarVisualizacao(tipo) {
        visualizacaoAtual = tipo;
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.toLowerCase().includes(tipo)) {
                btn.classList.add('active');
            }
        });
        aplicarFiltroEBusca();
    }

    function aplicarFiltroEBusca() {
        const container = document.getElementById('arquivosContainer');
        
        let arquivosFiltrados = [...todosArquivos];
        
        if (filtroAtual !== 'todos') {
            arquivosFiltrados = arquivosFiltrados.filter(item => item.tipo_arquivo === filtroAtual);
        }
        
        if (termoBusca) {
            arquivosFiltrados = arquivosFiltrados.filter(item => 
                item.nome_original.toLowerCase().includes(termoBusca)
            );
        }

        totalArquivosFiltrados = arquivosFiltrados.length;
        
        let conteudoHtml = '';
        
        if (totalArquivosFiltrados === 0) {
            conteudoHtml = '<div class="empty-state">Nenhum arquivo encontrado</div>';
        } else {
            const inicio = (paginaAtual - 1) * itensPorPagina;
            const fim = inicio + itensPorPagina;
            const arquivosPaginados = arquivosFiltrados.slice(inicio, fim);
            
            if (visualizacaoAtual === 'grid') {
                conteudoHtml = `<div class="arquivos-grid">${renderizarArquivosGrid(arquivosPaginados)}</div>`;
            } else {
                conteudoHtml = `<div class="arquivos-lista">${renderizarArquivosLista(arquivosPaginados)}</div>`;
            }
        }
        
        conteudoHtml += renderizarPaginacao();
        container.innerHTML = conteudoHtml;
    }

    function renderizarPaginacao() {
        const totalPaginas = Math.max(1, Math.ceil(totalArquivosFiltrados / itensPorPagina));
        
        const inicio = totalArquivosFiltrados > 0 ? (paginaAtual - 1) * itensPorPagina + 1 : 0;
        const fim = Math.min(paginaAtual * itensPorPagina, totalArquivosFiltrados);
        
        let paginacaoHtml = `
            <div class="paginacao-container">
                <div class="paginacao-controles">
                    <span class="paginacao-info">
                        <i class="fas fa-file"></i> 
                        ${totalArquivosFiltrados > 0 ? `${inicio}-${fim}` : '0-0'} de ${totalArquivosFiltrados}
                    </span>
                    
                    <button class="paginacao-btn" onclick="mudarPagina(1)" ${paginaAtual === 1 ? 'disabled' : ''} title="Primeira página">
                        <i class="fas fa-angle-double-left"></i>
                    </button>
                    
                    <button class="paginacao-btn" onclick="mudarPagina(${paginaAtual - 1})" ${paginaAtual === 1 ? 'disabled' : ''} title="Página anterior">
                        <i class="fas fa-angle-left"></i>
                    </button>
        `;
        
        let inicioRange = Math.max(1, paginaAtual - 2);
        let fimRange = Math.min(totalPaginas, paginaAtual + 2);
        
        if (inicioRange > 1) {
            paginacaoHtml += `
                <button class="paginacao-btn" onclick="mudarPagina(1)">1</button>
                ${inicioRange > 2 ? '<span class="paginacao-btn" style="border: none; background: none; cursor: default;">...</span>' : ''}
            `;
        }
        
        for (let i = inicioRange; i <= fimRange; i++) {
            paginacaoHtml += `
                <button class="paginacao-btn ${i === paginaAtual ? 'active' : ''}" onclick="mudarPagina(${i})">${i}</button>
            `;
        }
        
        if (fimRange < totalPaginas) {
            paginacaoHtml += `
                ${fimRange < totalPaginas - 1 ? '<span class="paginacao-btn" style="border: none; background: none; cursor: default;">...</span>' : ''}
                <button class="paginacao-btn" onclick="mudarPagina(${totalPaginas})">${totalPaginas}</button>
            `;
        }
        
        paginacaoHtml += `
                    <button class="paginacao-btn" onclick="mudarPagina(${paginaAtual + 1})" ${paginaAtual === totalPaginas ? 'disabled' : ''} title="Próxima página">
                        <i class="fas fa-angle-right"></i>
                    </button>
                    
                    <button class="paginacao-btn" onclick="mudarPagina(${totalPaginas})" ${paginaAtual === totalPaginas ? 'disabled' : ''} title="Última página">
                        <i class="fas fa-angle-double-right"></i>
                    </button>
                </div>
                
                <div class="paginacao-rows-selector">
                    <label for="itensPorPagina">Mostrar:</label>
                    <select id="itensPorPagina" onchange="mudarItensPorPagina(this.value)">
                        <option value="9" ${itensPorPagina === 9 ? 'selected' : ''}>9</option>
                        <option value="13" ${itensPorPagina === 13 ? 'selected' : ''}>13</option>
                        <option value="17" ${itensPorPagina === 17 ? 'selected' : ''}>17</option>
                        <option value="25" ${itensPorPagina === 25 ? 'selected' : ''}>25</option>
                        <option value="33" ${itensPorPagina === 33 ? 'selected' : ''}>33</option>
                    </select>
                </div>
                
                <div class="paginacao-resumo">
                    Mostrando página ${paginaAtual} de ${totalPaginas}
                </div>
            </div>
        `;
        
        return paginacaoHtml;
    }

    function mudarPagina(novaPagina) {
        const totalPaginas = Math.max(1, Math.ceil(totalArquivosFiltrados / itensPorPagina));
        
        if (novaPagina < 1) novaPagina = 1;
        if (novaPagina > totalPaginas) novaPagina = totalPaginas;
        
        paginaAtual = novaPagina;
        aplicarFiltroEBusca();
        
        const container = document.getElementById('arquivosContainer');
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function mudarItensPorPagina(novoValor) {
        itensPorPagina = parseInt(novoValor);
        const totalPaginas = Math.max(1, Math.ceil(totalArquivosFiltrados / itensPorPagina));
        
        if (paginaAtual > totalPaginas) {
            paginaAtual = totalPaginas;
        }
        
        aplicarFiltroEBusca();
    }

    function renderizarArquivosGrid(arquivos) {
        return arquivos.map(arquivo => {
            const tipo = arquivo.tipo_arquivo;
            const tamanho = (arquivo.tamanho / 1024).toFixed(2) + ' KB';
            const data = new Date(arquivo.data_upload).toLocaleDateString('pt-BR');
            const url = `http://localhost:3000/uploads/${arquivo.nome_arquivo}`;
            
            let icone = 'fa-file';
            let classeCor = 'outros';

            if (tipo === 'imagem') {
                icone = 'fa-file-image';
                classeCor = 'imagem';
            } else if (tipo === 'pdf') {
                icone = 'fa-file-pdf';
                classeCor = 'pdf';
            } else if (tipo === 'word') {
                icone = 'fa-file-word';
                classeCor = 'word';
            } else if (tipo === 'excel') {
                icone = 'fa-file-excel';
                classeCor = 'excel';
            } else if (tipo === 'powerpoint') {
                icone = 'fa-file-powerpoint';
                classeCor = 'powerpoint';
            } else if (tipo === 'texto') {
                icone = 'fa-file-alt';
                classeCor = 'texto';
            } else {
                classeCor = 'outros';
            }
            
            let nomeDestacado = arquivo.nome_original;
            if (termoBusca && arquivoEditando !== arquivo.id) {
                const regex = new RegExp(`(${termoBusca})`, 'gi');
                nomeDestacado = arquivo.nome_original.replace(regex, '<mark>$1</mark>');
            }

            let previewHtml = '';
            if (tipo === 'imagem') {
                previewHtml = `<div class="imagem-preview" onclick="abrirArquivo('${arquivo.nome_arquivo}', '${tipo}')"><img src="${url}" alt="${arquivo.nome_original}"></div>`;
            }

            let nomeHtml = '';
            if (arquivoEditando === arquivo.id) {
                nomeHtml = `
                    <div>
                        <input type="text" id="edit-nome-${arquivo.id}" class="edit-input" value="${arquivo.nome_original}">
                        <div class="edit-actions">
                            <button class="edit-save" onclick="salvarEdicao(${arquivo.id}, document.getElementById('edit-nome-${arquivo.id}').value)"><i class="fas fa-check"></i> Salvar</button>
                            <button class="edit-cancel" onclick="cancelarEdicao()"><i class="fas fa-times"></i> Cancelar</button>
                        </div>
                    </div>
                `;
            } else {
                nomeHtml = `
                    <h3>
                        ${nomeDestacado}
                        <button class="edit-btn" onclick="iniciarEdicao(${JSON.stringify(arquivo).replace(/"/g, '&quot;')})"><i class="fas fa-edit"></i></button>
                    </h3>
                `;
            }

            let localizacaoHtml = '';
            if (arquivo.pasta_id) {
                const pasta = todasPastas.find(p => p.id === arquivo.pasta_id);
                if (pasta) {
                    localizacaoHtml = `
                        <div class="pasta-localizacao" title="Pasta: ${pasta.nome}">
                            <i class="fas fa-folder"></i>
                            <span class="pasta-nome-link" onclick="event.stopPropagation(); abrirModalPasta(${pasta.id})">${pasta.nome}</span>
                        </div>
                    `;
                } else {
                    localizacaoHtml = `<div class="pasta-localizacao"><i class="fas fa-folder"></i> <span class="raiz-texto">Pasta não encontrada</span></div>`;
                }
            } else {
                localizacaoHtml = `<div class="pasta-localizacao"><i class="fas fa-folder"></i> <span class="raiz-texto">Raiz</span></div>`;
            }

            return `
                <div class="arquivo-card ${tipo === 'imagem' ? 'com-imagem' : ''}">
                    <div class="card-header">
                            <span class="arquivo-tipo tipo-${tipo}">${tipo}</span>
                        <div class="header-actions">
                            <button class="favorito-btn ${arquivo.favorito ? 'active' : ''}" onclick="favoritarArquivo(${arquivo.id}, ${!arquivo.favorito})" title="${arquivo.favorito ? 'Desfavoritar' : 'Favoritar'}">
                                <i class="fas fa-star"></i>
                            </button>
                            <button class="comentario-btn ${arquivo.comentario ? 'active' : ''}" onclick="event.stopPropagation(); abrirComentarioModal(${arquivo.id})" title="${arquivo.comentario ? 'Editar comentário' : 'Adicionar comentário'}">
                                <i class="fas fa-comment"></i>
                            </button>
                            <button class="delete-btn" onclick="deletarArquivo(${arquivo.id})" title="Excluir">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    ${previewHtml || `<div class="arquivo-icone ${classeCor}"><i class="fas ${icone} fa-2x"></i></div>`}
                    <div class="arquivo-info">
                        ${nomeHtml}
                        <div class="arquivo-meta">
                            <span>${tamanho}</span>
                            <span>${data}</span>
                        </div>
                    </div>
                    ${localizacaoHtml}
                    <div class="arquivo-acoes">
                        <button class="btn-abrir" onclick="abrirArquivo('${arquivo.nome_arquivo}', '${tipo}')"><i class="fas fa-eye"></i> Abrir</button>
                        <button class="btn-baixar" onclick="baixarArquivo('${arquivo.nome_arquivo}')"><i class="fas fa-download"></i> Baixar</button>
                        <button class="btn-mover" onclick="abrirMoverModal(${arquivo.id})"><i class="fas fa-folder-open"></i> Mover</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderizarArquivosLista(arquivos) {
    return arquivos.map(arquivo => {
        const tipo = arquivo.tipo_arquivo;
        const tamanho = (arquivo.tamanho / 1024).toFixed(2) + ' KB';
        const data = new Date(arquivo.data_upload).toLocaleDateString('pt-BR');
        const url = `http://localhost:3000/uploads/${arquivo.nome_arquivo}`;
        
        let icone = 'fa-file';
        let classeCor = 'outros';
        
        if (tipo === 'imagem') {
            icone = 'fa-file-image';
            classeCor = 'imagem';
        } else if (tipo === 'pdf') {
            icone = 'fa-file-pdf';
            classeCor = 'pdf';
        } else if (tipo === 'word') {
            icone = 'fa-file-word';
            classeCor = 'word';
        } else if (tipo === 'excel') {
            icone = 'fa-file-excel';
            classeCor = 'excel';
        } else if (tipo === 'powerpoint') {
            icone = 'fa-file-powerpoint';
            classeCor = 'powerpoint';
        } else if (tipo === 'texto') {
            icone = 'fa-file-alt';
            classeCor = 'texto';
        }
        
        let nomeDestacado = arquivo.nome_original;
        if (termoBusca && arquivoEditando !== arquivo.id) {
            const regex = new RegExp(`(${termoBusca})`, 'gi');
            nomeDestacado = arquivo.nome_original.replace(regex, '<mark>$1</mark>');
        }

        let previewHtml = '';
        if (tipo === 'imagem') {
            previewHtml = `<div class="imagem-preview" onclick="abrirArquivo('${arquivo.nome_arquivo}', '${tipo}')"><img src="${url}" alt="${arquivo.nome_original}"></div>`;
        }

        let nomeHtml = '';
        if (arquivoEditando === arquivo.id) {
            nomeHtml = `
                <div style="width: 100%;">
                    <input type="text" id="edit-nome-${arquivo.id}" class="edit-input" value="${arquivo.nome_original}">
                    <div class="edit-actions">
                        <button class="edit-save" onclick="salvarEdicao(${arquivo.id}, document.getElementById('edit-nome-${arquivo.id}').value)"><i class="fas fa-check"></i> Salvar</button>
                        <button class="edit-cancel" onclick="cancelarEdicao()"><i class="fas fa-times"></i> Cancelar</button>
                    </div>
                </div>
            `;
        } else {
            nomeHtml = `
                <h3>
                    ${nomeDestacado}
                    <button class="edit-btn" onclick="iniciarEdicao(${JSON.stringify(arquivo).replace(/"/g, '&quot;')})"><i class="fas fa-edit"></i></button>
                </h3>
            `;
        }

        let localizacaoHtml = '';
        if (arquivo.pasta_id) {
            const pasta = todasPastas.find(p => p.id === arquivo.pasta_id);
            if (pasta) {
                localizacaoHtml = `
                    <div class="pasta-localizacao" title="Pasta: ${pasta.nome}">
                        <i class="fas fa-folder"></i>
                        <span class="pasta-nome-link" onclick="event.stopPropagation(); abrirModalPasta(${pasta.id})">${pasta.nome}</span>
                    </div>
                `;
            } else {
                localizacaoHtml = `<div class="pasta-localizacao"><i class="fas fa-folder"></i> <span class="raiz-texto">Pasta não encontrada</span></div>`;
            }
        } else {
            localizacaoHtml = `<div class="pasta-localizacao"><i class="fas fa-folder"></i> <span class="raiz-texto">Raiz</span></div>`;
        }

        return `
            <div class="lista-item">
                <div class="card-header" style="border-bottom: none; margin-bottom: 0; padding: 0; width: auto;">
                    <div class="header-actions">
                        <button class="favorito-btn ${arquivo.favorito ? 'active' : ''}" onclick="favoritarArquivo(${arquivo.id}, ${!arquivo.favorito})" title="${arquivo.favorito ? 'Desfavoritar' : 'Favoritar'}">
                            <i class="fas fa-star"></i>
                        </button>
                        <button class="comentario-btn ${arquivo.comentario ? 'active' : ''}" onclick="event.stopPropagation(); abrirComentarioModal(${arquivo.id})" title="${arquivo.comentario ? 'Editar comentário' : 'Adicionar comentário'}">
                            <i class="fas fa-comment"></i>
                        </button>
                        <button class="delete-btn" onclick="deletarArquivo(${arquivo.id})" title="Excluir">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                ${previewHtml || `<div class="arquivo-icone ${classeCor}"><i class="fas ${icone} fa-2x"></i></div>`}
                <div class="arquivo-info">
                    ${nomeHtml}
                    <span class="arquivo-tipo tipo-${tipo}">${tipo}</span>
                    <div class="arquivo-meta">
                        <span>${tamanho}</span>
                        <span>${data}</span>
                    </div>
                    ${localizacaoHtml}
                    <div class="arquivo-acoes">
                        <button class="btn-abrir" onclick="abrirArquivo('${arquivo.nome_arquivo}', '${tipo}')"><i class="fas fa-eye"></i> Abrir</button>
                        <button class="btn-baixar" onclick="baixarArquivo('${arquivo.nome_arquivo}')"><i class="fas fa-download"></i> Baixar</button>
                        <button class="btn-mover" onclick="abrirMoverModal(${arquivo.id})"><i class="fas fa-folder-open"></i> Mover</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}
    async function deletarArquivo(id) {
        mostrarConfirmacao('Excluir Arquivo', 'Tem certeza que deseja deletar este arquivo?', async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/arquivos/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    carregarArquivos();
                    if (pastaModalAtual) {
                        abrirModalPasta(pastaModalAtual);
                    }
                    mostrarNotificacao('Arquivo excluído com sucesso!');
                } else {
                    mostrarAlerta('Erro', 'Erro ao deletar arquivo');
                }
            } catch (error) {
                console.error('Erro ao deletar:', error);
                mostrarAlerta('Erro', 'Erro ao deletar arquivo');
            }
        });
    }

async function favoritarArquivo(id, favorito) {
    try {
        const response = await fetch(`http://localhost:3000/api/arquivos/${id}/favoritar`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ favorito })
        });
        
        if (response.ok) {
            const arquivoIndex = todosArquivos.findIndex(a => a.id === id);
            if (arquivoIndex !== -1) {
                todosArquivos[arquivoIndex].favorito = favorito;
            }
            
            const favoritosCount = todosArquivos.filter(a => a.favorito === 1 || a.favorito === true).length;
            atualizarContadorFavoritos(favoritosCount);
            
            if (favoritosModalAberto) {
                await carregarFavoritos();
            } else {
                aplicarFiltroEBusca();
            }
        }
    } catch (error) {
        console.error('Erro ao favoritar:', error);
    }
}

   function abrirMoverModal(arquivoId) {
    arquivoParaMover = arquivoId;
    const select = document.getElementById('pastaDestinoSelect');
    
    select.innerHTML = '';
    
    select.innerHTML += '<option value=""><i class="fas fa-folder"></i> Raiz (sem pasta)</option>';
    
    function adicionarPastasRecursivo(pastas, pastaPaiId = null, nivel = 0) {
        const pastasNesteNivel = pastas.filter(p => p.pasta_pai_id === pastaPaiId);
        
        pastasNesteNivel.sort((a, b) => a.nome.localeCompare(b.nome));
        
        pastasNesteNivel.forEach(pasta => {
            const indentacao = nivel > 0 ? '　'.repeat(nivel) + '└─ ' : '';
            
            select.innerHTML += `<option value="${pasta.id}">${indentacao}<i class="fas fa-folder"></i> ${pasta.nome}</option>`;
            
            adicionarPastasRecursivo(pastas, pasta.id, nivel + 1);
        });
    }
    
    adicionarPastasRecursivo(todasPastas);
    
    const arquivo = todosArquivos.find(a => a.id === arquivoId);
    if (arquivo && arquivo.pasta_id) {
        select.value = arquivo.pasta_id;
    }
    
    document.getElementById('moverModal').classList.add('active');
    toggleBodyScroll(true);
}



function fecharMoverModal() {
    document.getElementById('moverModal').classList.remove('active');
    arquivoParaMover = null;
    toggleBodyScroll(false);
}

    async function confirmarMover() {
        if (!arquivoParaMover) return;
        
        const pastaDestino = document.getElementById('pastaDestinoSelect').value;
        
        try {
            const response = await fetch(`http://localhost:3000/api/arquivos/${arquivoParaMover}/mover`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pasta_id: pastaDestino || null })
            });
            
            if (response.ok) {
                fecharMoverModal();
                
                await carregarArquivos();
                
                if (pastaModalAtual) {
                    await abrirModalPasta(pastaModalAtual);
                }
                
                mostrarNotificacao('Arquivo movido com sucesso');
            } else {
                alert('Erro ao mover arquivo');
            }
        } catch (error) {
            console.error('Erro ao mover:', error);
            alert('Erro ao mover arquivo');
        }
    }

    function getNomeOriginalParaDownload(nomeArquivo) {
        const arquivo = todosArquivos.find(a => a.nome_arquivo === nomeArquivo);
        return arquivo ? arquivo.nome_original : nomeArquivo.split('-').slice(1).join('-') || nomeArquivo;
    }

    function abrirArquivo(nomeArquivo, tipo) {
        const url = `http://localhost:3000/uploads/${nomeArquivo}`;
        
        if (tipo === 'imagem') {
            const modal = document.getElementById('imagemModal');
            const modalImg = document.getElementById('modalImagem');
            modalImg.src = url;
            modal.classList.add('active');
        } else if (tipo === 'pdf') {
            window.open(url, '_blank');
        } else if (tipo === 'word' || tipo === 'excel' || tipo === 'powerpoint') {
            window.open(`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`, '_blank');
        } else if (tipo === 'texto') {
            window.open(url, '_blank');
        } else {
            window.open(url, '_blank');
        }
    }

    function baixarArquivo(nomeArquivo) {
        const url = `http://localhost:3000/uploads/${nomeArquivo}`;
        const nomeOriginal = getNomeOriginalParaDownload(nomeArquivo);
        
        fetch(url)
            .then(response => response.blob())
            .then(blob => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = nomeOriginal;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
            })
            .catch(error => {
                console.error('Erro ao baixar:', error);
                alert('Erro ao baixar arquivo');
            });
    }

function fecharModal() {
    document.getElementById('imagemModal').classList.remove('active');
    toggleBodyScroll(false);
}

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            fecharModal();
            fecharMoverModal();
            fecharModalPasta();
        }
    });

    function logout() {
        localStorage.removeItem('usuario');
        window.location.href = 'index.html';
    }

    const uploadArea = document.querySelector('.upload-area');
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#b88b4a';
        uploadArea.style.background = '#fcf9f4';
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#eae5dd';
        uploadArea.style.background = 'white';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#eae5dd';
        uploadArea.style.background = 'white';
        const files = e.dataTransfer.files;
        uploadArquivos(files);
    });

    function iniciarEdicao(arquivo) {
        arquivoEditando = arquivo.id;
        aplicarFiltroEBusca();
    }

    function cancelarEdicao() {
        arquivoEditando = null;
        aplicarFiltroEBusca();
    }

    let arquivoComentarioAtual = null;

async function abrirComentarioModal(arquivoId, comentarioAtual = '') {
    arquivoComentarioAtual = arquivoId;
    
    const arquivo = todosArquivos.find(a => a.id === arquivoId);
    
    if (arquivo && arquivo.comentario) {
        document.getElementById('comentarioTextarea').value = arquivo.comentario;
    } else {
        document.getElementById('comentarioTextarea').value = '';
    }
    
    document.getElementById('comentarioModal').classList.add('active');
    toggleBodyScroll(true);
}

function fecharComentarioModal() {
    document.getElementById('comentarioModal').classList.remove('active');
    document.getElementById('comentarioTextarea').value = '';
    arquivoComentarioAtual = null;
    toggleBodyScroll(false);
}

        async function salvarComentario() {
        if (!arquivoComentarioAtual) return;
        
        const comentario = document.getElementById('comentarioTextarea').value;
        
        try {
            const response = await fetch(`http://localhost:3000/api/arquivos/${arquivoComentarioAtual}/comentario`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comentario })
            });
            
            if (response.ok) {
                const arquivoIndex = todosArquivos.findIndex(a => a.id === arquivoComentarioAtual);
                if (arquivoIndex !== -1) {
                    todosArquivos[arquivoIndex].comentario = comentario;
                }
                
                fecharComentarioModal();
                
                if (pastaModalAtual) {
                    await abrirModalPasta(pastaModalAtual);
                } else {
                    aplicarFiltroEBusca();
                }
                
                mostrarNotificacao('Comentário salvo com sucesso');
            } else {
                alert('Erro ao salvar comentário');
            }
        } catch (error) {
            console.error('Erro ao salvar comentário:', error);
            alert('Erro ao salvar comentário');
        }
    }

    async function downloadPasta(pastaId, pastaNome) {
        try {
            const response = await fetch(`http://localhost:3000/api/pastas/${pastaId}/download?usuario_id=${usuario.id}`);
            
            if (!response.ok) {
                const error = await response.json();
                alert(error.error || 'Erro ao baixar pasta');
                return;
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${pastaNome}.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            mostrarNotificacao('Download da pasta iniciado');
        } catch (error) {
            console.error('Erro ao baixar pasta:', error);
            alert('Erro ao baixar pasta');
        }
    }

    async function salvarEdicao(arquivoId, novoNome) {
        if (!novoNome.trim()) {
            mostrarAlerta('Erro', 'O nome do arquivo não pode estar vazio');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/arquivos/${arquivoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nome_original: novoNome })
            });

            if (response.ok) {
                arquivoEditando = null;
                await carregarArquivos();
                
                if (pastaModalAtual) {
                    await abrirModalPasta(pastaModalAtual);
                }
                
                mostrarNotificacao('Arquivo renomeado com sucesso');
            } else {
                alert('Erro ao renomear arquivo');
            }
        } catch (error) {
            console.error('Erro ao renomear:', error);
            alert('Erro ao renomear arquivo');
        }
    }

    let favoritosModalAberto = false;

    function mostrarFavoritos() {
        favoritosModalAberto = true;
        document.getElementById('favoritosModal').classList.add('active');
        toggleBodyScroll(true);
        carregarFavoritos();
    }

    function fecharFavoritosModal() {
        document.getElementById('favoritosModal').classList.remove('active');
        favoritosModalAberto = false;
        toggleBodyScroll(false);
    }

    async function carregarFavoritos() {
        try {
            const response = await fetch(`http://localhost:3000/api/arquivos/${usuario.id}`);
            if (!response.ok) {
                throw new Error('Erro ao carregar arquivos');
            }
            const arquivos = await response.json();
            const favoritos = arquivos.filter(a => a.favorito === 1 || a.favorito === true);
            renderizarFavoritos(favoritos);
            atualizarContadorFavoritos(favoritos.length);
        } catch (error) {
            console.error('Erro ao carregar favoritos:', error);
            document.getElementById('favoritosModalBody').innerHTML = '<div class="empty-state">Erro ao carregar favoritos</div>';
        }
    }

    function renderizarFavoritos(favoritos) {
        const container = document.getElementById('favoritosModalBody');
        
        if (favoritos.length === 0) {
            container.innerHTML = '<div class="empty-state">Nenhum arquivo favoritado</div>';
            return;
        }
        
        totalFavoritos = favoritos.length;
        
        const inicio = (favoritosPaginaAtual - 1) * favoritosItensPorPagina;
        const fim = inicio + favoritosItensPorPagina;
        const favoritosPaginados = favoritos.slice(inicio, fim);
        
        let html = '<div class="arquivos-grid">';
        
        favoritosPaginados.forEach(arquivo => {
            let icone = 'fa-file';
            let classeCor = 'outros';

            if (arquivo.tipo_arquivo === 'imagem') {
                icone = 'fa-file-image';
                classeCor = 'imagem';
            } else if (arquivo.tipo_arquivo === 'pdf') {
                icone = 'fa-file-pdf';
                classeCor = 'pdf';
            } else if (arquivo.tipo_arquivo === 'word') {
                icone = 'fa-file-word';
                classeCor = 'word';
            } else if (arquivo.tipo_arquivo === 'excel') {
                icone = 'fa-file-excel';
                classeCor = 'excel';
            } else if (arquivo.tipo_arquivo === 'powerpoint') {
                icone = 'fa-file-powerpoint';
                classeCor = 'powerpoint';
            }
            
            const tamanho = (arquivo.tamanho / 1024).toFixed(2) + ' KB';
            const data = new Date(arquivo.data_upload).toLocaleDateString('pt-BR');
            const url = `http://localhost:3000/uploads/${arquivo.nome_arquivo}`;
            
            let previewHtml = '';
            if (arquivo.tipo_arquivo === 'imagem') {
                previewHtml = `<div class="imagem-preview" onclick="abrirArquivo('${arquivo.nome_arquivo}', '${arquivo.tipo_arquivo}')"><img src="${url}" alt="${arquivo.nome_original}"></div>`;
            }
            
            html += `
                <div class="arquivo-card ${arquivo.tipo_arquivo === 'imagem' ? 'com-imagem' : ''}">
                    <div class="card-header">
                        <div class="header-actions">
                            <button class="favorito-btn active" onclick="favoritarArquivo(${arquivo.id}, false)">
                                <i class="fas fa-star" style="color: #FFD700"></i>
                            </button>
                            <button class="comentario-btn ${arquivo.comentario ? 'active' : ''}" onclick="event.stopPropagation(); abrirComentarioModal(${arquivo.id})" title="${arquivo.comentario ? 'Editar comentário' : 'Adicionar comentário'}"><i class="fas fa-comment"></i></button>
                            <button class="delete-btn" onclick="deletarArquivo(${arquivo.id})" title="Excluir"><i class="fas fa-times"></i></button>
                        </div>
                    </div>
                    ${previewHtml || `<div class="arquivo-icone ${classeCor}"><i class="fas ${icone} fa-2x"></i></div>`}
                    <div class="arquivo-info">
                        <h3>${arquivo.nome_original}</h3>
                        <span class="arquivo-tipo tipo-${arquivo.tipo_arquivo}">${arquivo.tipo_arquivo}</span>
                        <div class="arquivo-meta">
                            <span>${tamanho}</span>
                            <span>${data}</span>
                        </div>
                    </div>
                    <div class="arquivo-acoes">
                        <button class="btn-abrir" onclick="abrirArquivo('${arquivo.nome_arquivo}', '${arquivo.tipo_arquivo}')"><i class="fas fa-eye"></i> Abrir</button>
                        <button class="btn-baixar" onclick="baixarArquivo('${arquivo.nome_arquivo}')"><i class="fas fa-download"></i> Baixar</button>
                        <button class="btn-mover" onclick="abrirMoverModal(${arquivo.id})"><i class="fas fa-folder-open"></i> Mover</button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        
        if (favoritos.length > favoritosItensPorPagina) {
            html += renderizarFavoritosPaginacao();
        }
        
        container.innerHTML = html;
    }

    function renderizarFavoritosPaginacao() {
        const totalPaginas = Math.ceil(totalFavoritos / favoritosItensPorPagina);
        
        const inicio = (favoritosPaginaAtual - 1) * favoritosItensPorPagina + 1;
        const fim = Math.min(favoritosPaginaAtual * favoritosItensPorPagina, totalFavoritos);
        
        let paginacaoHtml = `
            <div class="paginacao-container" style="margin-top: 1rem;">
                <div class="paginacao-controles">
                    <span class="paginacao-info">
                        <i class="fas fa-star"></i> ${inicio}-${fim} de ${totalFavoritos}
                    </span>
                    
                    <button class="paginacao-btn" onclick="mudarPaginaFavoritos(1)" ${favoritosPaginaAtual === 1 ? 'disabled' : ''}>
                        <i class="fas fa-angle-double-left"></i>
                    </button>
                    
                    <button class="paginacao-btn" onclick="mudarPaginaFavoritos(${favoritosPaginaAtual - 1})" ${favoritosPaginaAtual === 1 ? 'disabled' : ''}>
                        <i class="fas fa-angle-left"></i>
                    </button>
        `;
        
        let inicioRange = Math.max(1, favoritosPaginaAtual - 2);
        let fimRange = Math.min(totalPaginas, favoritosPaginaAtual + 2);
        
        if (inicioRange > 1) {
            paginacaoHtml += `
                <button class="paginacao-btn" onclick="mudarPaginaFavoritos(1)">1</button>
                ${inicioRange > 2 ? '<span class="paginacao-btn" style="border: none; background: none;">...</span>' : ''}
            `;
        }
        
        for (let i = inicioRange; i <= fimRange; i++) {
            paginacaoHtml += `
                <button class="paginacao-btn ${i === favoritosPaginaAtual ? 'active' : ''}" onclick="mudarPaginaFavoritos(${i})">${i}</button>
            `;
        }
        
        if (fimRange < totalPaginas) {
            paginacaoHtml += `
                ${fimRange < totalPaginas - 1 ? '<span class="paginacao-btn" style="border: none; background: none;">...</span>' : ''}
                <button class="paginacao-btn" onclick="mudarPaginaFavoritos(${totalPaginas})">${totalPaginas}</button>
            `;
        }
        
        paginacaoHtml += `
                    <button class="paginacao-btn" onclick="mudarPaginaFavoritos(${favoritosPaginaAtual + 1})" ${favoritosPaginaAtual === totalPaginas ? 'disabled' : ''}>
                        <i class="fas fa-angle-right"></i>
                    </button>
                    
                    <button class="paginacao-btn" onclick="mudarPaginaFavoritos(${totalPaginas})" ${favoritosPaginaAtual === totalPaginas ? 'disabled' : ''}>
                        <i class="fas fa-angle-double-right"></i>
                    </button>
                </div>
            </div>
        `;
        
        return paginacaoHtml;
    }

    function mudarPaginaFavoritos(novaPagina) {
        favoritosPaginaAtual = novaPagina;
        carregarFavoritos();
    }

    function atualizarContadorFavoritos(count) {
        const contador = document.getElementById('favoritosCount');
        if (contador) {
            contador.textContent = count;
        }
    }

    let userMenuAberto = false;
    let perfilEditando = false;

    function toggleUserMenu() {
        const menu = document.getElementById('userMenu');
        userMenuAberto = !userMenuAberto;
        menu.style.display = userMenuAberto ? 'block' : 'none';
    }

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.user-info')) {
            const menu = document.getElementById('userMenu');
            if (menu) {
                menu.style.display = 'none';
                userMenuAberto = false;
            }
        }
    });

function abrirModalUsuario() {
    document.getElementById('usuarioModal').classList.add('active');
    document.getElementById('perfilVisualizacao').style.display = 'block';
    document.getElementById('perfilEdicao').style.display = 'none';
    document.getElementById('perfilNome').textContent = usuario.nome;
    document.getElementById('perfilEmail').textContent = usuario.email;
    document.getElementById('editNome').value = usuario.nome;
    document.getElementById('editEmail').value = usuario.email;
    document.getElementById('editSenha').value = '';
    userMenuAberto = false;
    document.getElementById('userMenu').style.display = 'none';
    toggleBodyScroll(true);
}

    function fecharModalUsuario() {
        document.getElementById('usuarioModal').classList.remove('active');
        perfilEditando = false;
        toggleBodyScroll(false);
    }

    function editarPerfil() {
        document.getElementById('perfilVisualizacao').style.display = 'none';
        document.getElementById('perfilEdicao').style.display = 'block';
        perfilEditando = true;
    }

    function cancelarEdicaoPerfil() {
        document.getElementById('perfilVisualizacao').style.display = 'block';
        document.getElementById('perfilEdicao').style.display = 'none';
        perfilEditando = false;
    }

    async function salvarPerfil() {
        const novoNome = document.getElementById('editNome').value;
        const novoEmail = document.getElementById('editEmail').value;
        const novaSenha = document.getElementById('editSenha').value;
        
        if (!novoNome || !novoEmail) {
            mostrarAlerta('Erro', 'Nome e email são obrigatórios');
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:3000/api/usuarios/${usuario.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome: novoNome,
                    email: novoEmail,
                    senha: novaSenha || undefined
                })
            });
            
            if (response.ok) {
                usuario.nome = novoNome;
                usuario.email = novoEmail;
                localStorage.setItem('usuario', JSON.stringify(usuario));
                document.getElementById('userName').textContent = novoNome;
                document.getElementById('perfilNome').textContent = novoNome;
                document.getElementById('perfilEmail').textContent = novoEmail;
                cancelarEdicaoPerfil();
                mostrarNotificacao('Perfil atualizado com sucesso');
            } else {
                const data = await response.json();
                alert(data.error || 'Erro ao atualizar perfil');
            }
        } catch (error) {
            console.error('Erro ao salvar perfil:', error);
            alert('Erro ao salvar perfil');
        }
    }

    carregarDados();

    let confirmCallback = null;
    let promptCallback = null;
    let currentPromptValue = '';

function mostrarAlerta(titulo, mensagem) {
    document.getElementById('alertTitle').innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${titulo}`;
    document.getElementById('alertMessage').textContent = mensagem;
    document.getElementById('alertModal').classList.add('active');
    toggleBodyScroll(true);
}

function fecharAlertModal() {
    document.getElementById('alertModal').classList.remove('active');
    toggleBodyScroll(false);
}

function mostrarConfirmacao(titulo, mensagem, callback) {
    document.getElementById('confirmTitle').innerHTML = `<i class="fas fa-question-circle"></i> ${titulo}`;
    document.getElementById('confirmMessage').textContent = mensagem;
    confirmCallback = callback;
    document.getElementById('confirmModal').classList.add('active');
    toggleBodyScroll(true);
}

function fecharConfirmModal() {
    document.getElementById('confirmModal').classList.remove('active');
    confirmCallback = null;
    toggleBodyScroll(false);
}

    function executarConfirmAction() {
        if (confirmCallback) {
            confirmCallback();
        }
        fecharConfirmModal();
    }

function mostrarPrompt(titulo, mensagem, valorPadrao = '', callback) {
    document.getElementById('promptTitle').innerHTML = `<i class="fas fa-pencil-alt"></i> ${titulo}`;
    document.getElementById('promptMessage').textContent = mensagem;
    document.getElementById('promptInput').value = valorPadrao;
    promptCallback = callback;
    document.getElementById('promptModal').classList.add('active');
    toggleBodyScroll(true);
    document.getElementById('promptInput').focus();
}

function fecharPromptModal() {
    document.getElementById('promptModal').classList.remove('active');
    promptCallback = null;
    toggleBodyScroll(false);
}

    function executarPromptAction() {
        if (promptCallback) {
            promptCallback(document.getElementById('promptInput').value);
        }
        fecharPromptModal();
    }

    function abrirConfiguracoes() {
        mostrarAlerta('Configurações', 'Página em desenvolvimento');
        toggleUserMenu();
    }

    function toggleBodyScroll(bloquear) {
    const body = document.body;
    if (bloquear) {
        const scrollY = window.scrollY;
        body.style.position = 'fixed';
        body.style.top = `-${scrollY}px`;
        body.style.width = '100%';
        body.classList.add('modal-open');
    } else {
        const scrollY = parseInt(body.style.top || '0') * -1;
        body.style.position = '';
        body.style.top = '';
        body.style.width = '';
        body.classList.remove('modal-open');
        window.scrollTo(0, scrollY);
    }
}


 function alternarTema() {
        const body = document.body;
        const temaBtn = document.getElementById('temaBtn');
        const temaIcone = document.getElementById('temaIcone');
        const temaTexto = document.getElementById('temaTexto');
        
        body.classList.toggle('dark-mode');
        
        if (body.classList.contains('dark-mode')) {
            temaIcone.className = 'fas fa-sun';
            temaTexto.innerText = 'Claro';
            localStorage.setItem('tema', 'escuro');
        } else {
            temaIcone.className = 'fas fa-moon';
            temaTexto.innerText = 'Escuro';
            localStorage.setItem('tema', 'claro');
        }
    }
    
    document.addEventListener('DOMContentLoaded', function() {
        const temaSalvo = localStorage.getItem('tema');
        const body = document.body;
        const temaIcone = document.getElementById('temaIcone');
        const temaTexto = document.getElementById('temaTexto');
        
        if (temaSalvo === 'escuro') {
            body.classList.add('dark-mode');
            temaIcone.className = 'fas fa-sun';
            temaTexto.innerText = 'Claro';
        } else {
            temaIcone.className = 'fas fa-moon';
            temaTexto.innerText = 'Escuro';
        }
    });