    const usuario = JSON.parse(localStorage.getItem('usuario'));
        if (!usuario || usuario.tipo !== 'admin') {
            window.location.href = 'index.html';
        } else {
            document.getElementById('userName').textContent = usuario.nome;
        }
        
        let usuarios = [];
        let usuarioSelecionado = null;

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
                
                const tbody = document.getElementById('usuariosList');
                tbody.innerHTML = usuarios.map(u => `
                    <tr>
                        <td>${u.id}</td>
                        <td>${u.nome}</td>
                        <td>${u.email}</td>
                        <td>
                            <span class="badge ${u.tipo === 'admin' ? 'badge-admin' : 'badge-user'}">
                                ${u.tipo === 'admin' ? 'Administrador' : 'Usuário'}
                            </span>
                        </td>
                        <td>
                            <small style="color: ${u.status === 'ativo' ? '#48bb78' : '#ff4444'};">
                                ${u.status === 'ativo' ? 'Ativo' : 'Inativo'}
                            </small>
                        </td>
                        <td>${new Date(u.data_criacao).toLocaleDateString('pt-BR')}</td>
                        <td>
                            <div style="display: flex; gap: 0.3rem; align-items: center;">
                                <button class="btn-admin" onclick="abrirModalUsuario(${u.id})" title="Ver perfil">👤</button>
                                <div class="toggle-switch ${u.status === 'ativo' ? 'active' : ''}" onclick="toggleStatusFromTable(${u.id}, '${u.status}')">
                                    <div class="toggle-slider"></div>
                                    <span class="toggle-label">${u.status === 'ativo' ? 'Ativo' : 'Inativo'}</span>
                                </div>
                                ${u.tipo !== 'admin' ? `
                                    <button class="btn-admin" onclick="tornarAdmin(${u.id})" title="Tornar Admin">👑</button>
                                    <button class="btn-delete" onclick="deletarUsuario(${u.id})" title="Excluir">🗑️</button>
                                ` : ''}
                            </div>
                        </td>
                    </tr>
                `).join('');
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
            }
        }
        
        async function tornarAdmin(id) {
            if (!confirm('Tornar este usuário administrador?')) return;
            
            try {
                const response = await fetch(`http://localhost:3000/api/admin/usuarios/${id}/tornar-admin`, {
                    method: 'PUT'
                });
                
                if (response.ok) {
                    await carregarDados();
                    mostrarNotificacao('✅ Usuário agora é administrador');
                }
            } catch (error) {
                console.error('Erro:', error);
            }
        }
        
        async function deletarUsuario(id) {
            if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
            
            try {
                const response = await fetch(`http://localhost:3000/api/admin/usuarios/${id}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    await carregarDados();
                    mostrarNotificacao('✅ Usuário excluído com sucesso');
                }
            } catch (error) {
                console.error('Erro:', error);
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
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    z-index: 2000;
                    animation: slideIn 0.3s ease;
                    font-weight: 500;
                `;
                document.body.appendChild(notificacao);
            }
            
            notificacao.textContent = mensagem;
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
            
            document.getElementById('modalUsuarioTitulo').textContent = `👤 ${usuarioSelecionado.nome}`;
            document.getElementById('visualizarNome').textContent = usuarioSelecionado.nome;
            document.getElementById('visualizarEmail').textContent = usuarioSelecionado.email;
            
            const statusSpan = document.getElementById('visualizarStatus');
            const justificativaP = document.getElementById('visualizarJustificativa');
            
            if (usuarioSelecionado.status === 'inativo') {
                statusSpan.innerHTML = '<span class="badge" style="background: #ff4444; color: white;">Inativo</span>';
                justificativaP.innerHTML = `<strong>Justificativa:</strong> ${usuarioSelecionado.inativacao_justificativa || 'Não informada'}`;
            } else {
                statusSpan.innerHTML = '<span class="badge" style="background: #48bb78; color: white;">Ativo</span>';
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
        alert('Nome e email são obrigatórios');
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
            mostrarNotificacao('✅ Usuário atualizado com sucesso');
        }
    } catch (error) {
        console.error('Erro:', error);
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
                if (confirm('Reativar este usuário?')) {
                    await reativarUsuario(id);
                }
            }
        }

        async function confirmarInativacao() {
            const justificativa = document.getElementById('justificativaText').value;
            
            if (!justificativa) {
                alert('A justificativa é obrigatória');
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
                    mostrarNotificacao('✅ Usuário inativado com sucesso');
                }
            } catch (error) {
                console.error('Erro:', error);
            }
        }

        async function reativarUsuario(id) {
            try {
                const response = await fetch(`http://localhost:3000/api/admin/usuarios/${id}/reativar`, {
                    method: 'PUT'
                });
                
                if (response.ok) {
                    await carregarDados();
                    mostrarNotificacao('✅ Usuário reativado com sucesso');
                }
            } catch (error) {
                console.error('Erro:', error);
            }
        }

        carregarDados();