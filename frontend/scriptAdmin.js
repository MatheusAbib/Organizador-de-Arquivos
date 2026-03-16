        const usuario = JSON.parse(localStorage.getItem('usuario'));
        if (!usuario || usuario.tipo !== 'admin') {
            window.location.href = 'index.html';
        } else {
            document.getElementById('userName').textContent = usuario.nome;
        }
        
        let usuarios = [];
        let usuarioSelecionado = null;
        let paginaAtual = 1;
        let itensPorPagina = 9;
        let totalUsuariosFiltrados = 0;

        async function carregarDados() {
            try {
                const [usuariosData, arquivos, pastas] = await Promise.all([
                    fetch('http://localhost:3000/api/admin/usuarios').then(r => r.json()),
                    fetch('http://localhost:3000/api/admin/arquivos').then(r => r.json()),
                    fetch('http://localhost:3000/api/admin/pastas').then(r => r.json())
                ]);
                
                usuarios = usuariosData;
                
                document.getElementById('totalUsuarios').textContent = usuarios.length;
                document.getElementById('totalArquivos').textContent = arquivos.length;
                document.getElementById('totalPastas').textContent = pastas.length;
                
                const espacoTotal = arquivos.reduce((acc, a) => acc + a.tamanho, 0) / (1024 * 1024);
                document.getElementById('totalEspaco').textContent = espacoTotal.toFixed(2) + ' MB';
                
                totalUsuariosFiltrados = usuarios.length;
                renderizarTabela();
                
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                mostrarAlerta('Erro', 'Erro ao carregar dados do servidor');
            }
        }
        
        function renderizarTabela() {
            const tbody = document.getElementById('usuariosList');
            
            if (usuarios.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Nenhum usuário encontrado</td></tr>';
                document.getElementById('paginacaoContainer').innerHTML = renderizarPaginacao();
                return;
            }
            
            const inicio = (paginaAtual - 1) * itensPorPagina;
            const fim = inicio + itensPorPagina;
            const usuariosPaginados = usuarios.slice(inicio, fim);
            
            tbody.innerHTML = usuariosPaginados.map(u => `
                <tr>
                    <td>${u.id}</td>
                    <td>${u.nome}</td>
                    <td>${u.email}</td>
                    <td>
                        <span class="badge ${u.tipo === 'admin' ? 'badge-admin' : 'badge-user'}">
                            ${u.tipo === 'admin' ? '<i class="fas fa-crown"></i> Administrador' : '<i class="fas fa-user"></i> Usuário'}
                        </span>
                    </td>
                    <td>
                        <small style="color: ${u.status === 'ativo' ? '#48bb78' : '#ff4444'};">
                            <i class="fas ${u.status === 'ativo' ? 'fa-check-circle' : 'fa-times-circle'}"></i> ${u.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </small>
                    </td>
                    <td>${new Date(u.data_criacao).toLocaleDateString('pt-BR')}</td>
                    <td>
                        <div style="display: flex; gap: 0.3rem; align-items: center;">
                            <button class="btn-admin" id="Ver" onclick="abrirModalUsuario(${u.id})" title="Ver perfil"><i class="fas fa-user"></i></button>
                            <div class="toggle-switch ${u.status === 'ativo' ? 'active' : ''}" onclick="toggleStatusFromTable(${u.id}, '${u.status}')">
                                <div class="toggle-slider"></div>
                                <span class="toggle-label">${u.status === 'ativo' ? 'Ativo' : 'Inativo'}</span>
                            </div>
                            ${u.tipo !== 'admin' ? `
                                <button class="btn-admin" onclick="tornarAdmin(${u.id})" title="Tornar Admin"><i class="fas fa-crown"></i></button>
                                <button class="btn-delete" onclick="deletarUsuario(${u.id})" title="Excluir"><i class="fas fa-trash"></i></button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `).join('');
            
            document.getElementById('paginacaoContainer').innerHTML = renderizarPaginacao();
        }
        
        function renderizarPaginacao() {
            const totalPaginas = Math.max(1, Math.ceil(usuarios.length / itensPorPagina));
            
            const inicio = usuarios.length > 0 ? (paginaAtual - 1) * itensPorPagina + 1 : 0;
            const fim = Math.min(paginaAtual * itensPorPagina, usuarios.length);
            
            let paginacaoHtml = `
                <div class="paginacao-container">
                    <div class="paginacao-controles">
                        <span class="paginacao-info">
                            <i class="fas fa-users"></i> 
                            ${usuarios.length > 0 ? `${inicio}-${fim}` : '0-0'} de ${usuarios.length}
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
                        <label for="itensPorPagina">Itens por página:</label>
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
            const totalPaginas = Math.max(1, Math.ceil(usuarios.length / itensPorPagina));
            
            if (novaPagina < 1) novaPagina = 1;
            if (novaPagina > totalPaginas) novaPagina = totalPaginas;
            
            paginaAtual = novaPagina;
            renderizarTabela();
            
            document.querySelector('.usuarios-table').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        function mudarItensPorPagina(novoValor) {
            itensPorPagina = parseInt(novoValor);
            const totalPaginas = Math.max(1, Math.ceil(usuarios.length / itensPorPagina));
            
            if (paginaAtual > totalPaginas) {
                paginaAtual = totalPaginas;
            }
            
            renderizarTabela();
        }
        
        async function tornarAdmin(id) {
            mostrarConfirmacao('Tornar Administrador', 'Tornar este usuário administrador?', async () => {
                try {
                    const response = await fetch(`http://localhost:3000/api/admin/usuarios/${id}/tornar-admin`, {
                        method: 'PUT'
                    });
                    
                    if (response.ok) {
                        await carregarDados();
                        mostrarNotificacao('Usuário agora é administrador');
                    } else {
                        const data = await response.json();
                        mostrarAlerta('Erro', data.error || 'Erro ao tornar administrador');
                    }
                } catch (error) {
                    console.error('Erro:', error);
                    mostrarAlerta('Erro', 'Erro ao tornar administrador');
                }
            });
        }
        
        async function deletarUsuario(id) {
            mostrarConfirmacao('Excluir Usuário', 'Tem certeza que deseja excluir este usuário?', async () => {
                try {
                    const response = await fetch(`http://localhost:3000/api/admin/usuarios/${id}`, {
                        method: 'DELETE'
                    });
                    
                    if (response.ok) {
                        await carregarDados();
                        mostrarNotificacao('Usuário excluído com sucesso');
                    } else {
                        const data = await response.json();
                        mostrarAlerta('Erro', data.error || 'Erro ao excluir usuário');
                    }
                } catch (error) {
                    console.error('Erro:', error);
                    mostrarAlerta('Erro', 'Erro ao excluir usuário');
                }
            });
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
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
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
        
        function logout() {
            localStorage.removeItem('usuario');
            window.location.href = 'index.html';
        }

        function abrirModalUsuario(id) {
            usuarioSelecionado = usuarios.find(u => u.id === id);
            if (!usuarioSelecionado) return;
            
            document.getElementById('modalUsuarioTitulo').innerHTML = `<i class="fas fa-user-circle"></i> ${usuarioSelecionado.nome}`;
            document.getElementById('visualizarNome').textContent = usuarioSelecionado.nome;
            document.getElementById('visualizarEmail').textContent = usuarioSelecionado.email;
            
            const statusSpan = document.getElementById('visualizarStatus');
            const justificativaP = document.getElementById('visualizarJustificativa');
            
            if (usuarioSelecionado.status === 'inativo') {
                statusSpan.innerHTML = '<span class="badge" style="background: #ff4444; color: white;"><i class="fas fa-times-circle"></i> Inativo</span>';
                justificativaP.innerHTML = `<strong>Justificativa:</strong> ${usuarioSelecionado.inativacao_justificativa || 'Não informada'}`;
            } else {
                statusSpan.innerHTML = '<span class="badge" style="background: #48bb78; color: white;"><i class="fas fa-check-circle"></i> Ativo</span>';
                justificativaP.innerHTML = '';
            }
            
            const editNome = document.getElementById('editNome');
            const editEmail = document.getElementById('editEmail');
            const editSenha = document.getElementById('editSenha');
            
            if (editNome) editNome.value = usuarioSelecionado.nome;
            if (editEmail) editEmail.value = usuarioSelecionado.email;
            if (editSenha) editSenha.value = '';
            
            document.getElementById('usuarioModal').classList.add('active');
        }

        function fecharModalUsuario() {
            document.getElementById('usuarioModal').classList.remove('active');
            document.getElementById('usuarioVisualizacao').style.display = 'block';
            document.getElementById('usuarioEdicao').style.display = 'none';
            usuarioSelecionado = null;
        }

        function editarUsuarioModal() {
            document.getElementById('usuarioVisualizacao').style.display = 'none';
            document.getElementById('usuarioEdicao').style.display = 'block';
        }

        function cancelarEdicaoUsuario() {
            document.getElementById('usuarioVisualizacao').style.display = 'block';
            document.getElementById('usuarioEdicao').style.display = 'none';
        }

        async function salvarEdicaoUsuario() {
            const novoNome = document.getElementById('editNome').value;
            const novoEmail = document.getElementById('editEmail').value;
            const novaSenha = document.getElementById('editSenha').value;
            
            if (!novoNome || !novoEmail) {
                mostrarAlerta('Erro', 'Nome e email são obrigatórios');
                return;
            }
            
            try {
                const response = await fetch(`http://localhost:3000/api/admin/usuarios/${usuarioSelecionado.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nome: novoNome,
                        email: novoEmail,
                        senha: novaSenha || undefined
                    })
                });
                
                if (response.ok) {
                    await carregarDados();
                    usuarioSelecionado = usuarios.find(u => u.id === usuarioSelecionado.id);
                    abrirModalUsuario(usuarioSelecionado.id);
                    mostrarNotificacao('Usuário atualizado com sucesso');
                } else {
                    const data = await response.json();
                    mostrarAlerta('Erro', data.error || 'Erro ao atualizar usuário');
                }
            } catch (error) {
                console.error('Erro:', error);
                mostrarAlerta('Erro', 'Erro ao atualizar usuário');
            }
        }
        
        function fecharInativarModal() {
            document.getElementById('inativarModal').classList.remove('active');
            document.getElementById('justificativaText').value = '';
        }

        async function toggleStatusFromTable(id, statusAtual) {
            const usuario = usuarios.find(u => u.id === id);
            if (!usuario) return;
            
            if (statusAtual === 'ativo') {
                usuarioSelecionado = usuario;
                document.getElementById('inativarModal').classList.add('active');
            } else {
                mostrarConfirmacao('Reativar Usuário', 'Reativar este usuário?', async () => {
                    await reativarUsuario(id);
                });
            }
        }

        async function confirmarInativacao() {
            const justificativa = document.getElementById('justificativaText').value;
            
            if (!justificativa) {
                mostrarAlerta('Erro', 'A justificativa é obrigatória');
                return;
            }
            
            try {
                const response = await fetch(`http://localhost:3000/api/admin/usuarios/${usuarioSelecionado.id}/inativar`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ justificativa })
                });
                
                if (response.ok) {
                    await carregarDados();
                    fecharInativarModal();
                    mostrarNotificacao('Usuário inativado com sucesso');
                } else {
                    const data = await response.json();
                    mostrarAlerta('Erro', data.error || 'Erro ao inativar usuário');
                }
            } catch (error) {
                console.error('Erro:', error);
                mostrarAlerta('Erro', 'Erro ao inativar usuário');
            }
        }

        async function reativarUsuario(id) {
            try {
                const response = await fetch(`http://localhost:3000/api/admin/usuarios/${id}/reativar`, {
                    method: 'PUT'
                });
                
                if (response.ok) {
                    await carregarDados();
                    mostrarNotificacao('Usuário reativado com sucesso');
                } else {
                    const data = await response.json();
                    mostrarAlerta('Erro', data.error || 'Erro ao reativar usuário');
                }
            } catch (error) {
                console.error('Erro:', error);
                mostrarAlerta('Erro', 'Erro ao reativar usuário');
            }
        }

        carregarDados();

        let confirmCallback = null;

        function mostrarAlerta(titulo, mensagem) {
            document.getElementById('alertTitle').innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${titulo}`;
            document.getElementById('alertMessage').textContent = mensagem;
            document.getElementById('alertModal').classList.add('active');
        }

        function fecharAlertModal() {
            document.getElementById('alertModal').classList.remove('active');
        }

        function mostrarConfirmacao(titulo, mensagem, callback) {
            document.getElementById('confirmTitle').innerHTML = `<i class="fas fa-question-circle"></i> ${titulo}`;
            document.getElementById('confirmMessage').textContent = mensagem;
            confirmCallback = callback;
            document.getElementById('confirmModal').classList.add('active');
        }

        function fecharConfirmModal() {
            document.getElementById('confirmModal').classList.remove('active');
            confirmCallback = null;
        }

        function executarConfirmAction() {
            if (confirmCallback) {
                confirmCallback();
            }
            fecharConfirmModal();
        }