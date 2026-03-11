const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const archiver = require('archiver');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, 
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de arquivo não suportado'));
        }
    }
});

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar no MySQL:', err);
        return;
    }
    console.log('✅ Conectado ao MySQL com sucesso!');
});

app.post('/api/cadastro', async (req, res) => {
    const { nome, email, senha } = req.body;
    
    if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    
    try {
        const [results] = await db.promise().query('SELECT * FROM usuarios WHERE email = ?', [email]);
        
        if (results.length > 0) {
            return res.status(400).json({ error: 'Email já cadastrado' });
        }
        
        const saltRounds = 10;
        const senhaCriptografada = await bcrypt.hash(senha, saltRounds);
        
        const [result] = await db.promise().query(
            'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
            [nome, email, senhaCriptografada]
        );
        
        res.status(201).json({ 
            message: 'Usuário cadastrado com sucesso',
            usuario: { id: result.insertId, nome, email }
        });
    } catch (error) {
        console.error('Erro no cadastro:', error);
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

app.put('/api/admin/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, senha } = req.body;
        
        const [existe] = await db.promise().query('SELECT * FROM usuarios WHERE email = ? AND id != ?', [email, id]);
        
        if (existe.length > 0) {
            return res.status(400).json({ error: 'Email já está em uso' });
        }
        
        if (senha) {
            const saltRounds = 10;
            const senhaCriptografada = await bcrypt.hash(senha, saltRounds);
            await db.promise().query('UPDATE usuarios SET nome = ?, email = ?, senha = ? WHERE id = ?', [nome, email, senhaCriptografada, id]);
        } else {
            await db.promise().query('UPDATE usuarios SET nome = ?, email = ? WHERE id = ?', [nome, email, id]);
        }
        
        res.json({ message: 'Usuário atualizado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
});

app.put('/api/admin/usuarios/:id/inativar', async (req, res) => {
    try {
        const { id } = req.params;
        const { justificativa } = req.body;
        
        await db.promise().query('UPDATE usuarios SET status = "inativo", inativacao_justificativa = ? WHERE id = ? AND tipo != "admin"', [justificativa, id]);
        
        res.json({ message: 'Usuário inativado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao inativar usuário' });
    }
});

app.put('/api/admin/usuarios/:id/reativar', async (req, res) => {
    try {
        const { id } = req.params;
        
        await db.promise().query('UPDATE usuarios SET status = "ativo", inativacao_justificativa = NULL WHERE id = ?', [id]);
        
        res.json({ message: 'Usuário reativado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao reativar usuário' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, senha } = req.body;
    
    try {
        const [results] = await db.promise().query('SELECT * FROM usuarios WHERE email = ?', [email]);
        
        if (results.length === 0) {
            return res.status(401).json({ error: 'Usuário não encontrado' });
        }
        
        const usuario = results[0];
        
        if (usuario.status === 'inativo') {
            return res.status(403).json({ error: 'Conta inativada. Entre em contato com o administrador.' });
        }
        
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        
        if (!senhaCorreta) {
            return res.status(401).json({ error: 'Senha incorreta' });
        }
        
        res.json({ 
            message: 'Login realizado com sucesso',
            usuario: { 
                id: usuario.id, 
                nome: usuario.nome, 
                email: usuario.email,
                tipo: usuario.tipo
            }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

app.post('/api/upload', upload.single('arquivo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhum arquivo enviado' });
        }

        const { usuario_id, pasta_id } = req.body;
        const arquivo = req.file;

        console.log('Upload recebido:', {
            usuario_id,
            pasta_id: pasta_id || 'null (raiz)',
            arquivo: arquivo.originalname
        });

        let tipo = 'outros';
        const ext = path.extname(arquivo.originalname).toLowerCase();
        
        if (['.jpg', '.jpeg', '.png', '.gif', '.bmp'].includes(ext)) {
            tipo = 'imagem';
        } else if (ext === '.pdf') {
            tipo = 'pdf';
        } else if (['.doc', '.docx'].includes(ext)) {
            tipo = 'word';
        } else if (['.xls', '.xlsx'].includes(ext)) {
            tipo = 'excel';
        } else if (['.ppt', '.pptx'].includes(ext)) {
            tipo = 'powerpoint';
        } else if (['.txt'].includes(ext)) {
            tipo = 'texto';
        }

        const pastaIdValue = pasta_id && pasta_id !== '' ? pasta_id : null;
        
        const [result] = await db.promise().query(
            'INSERT INTO arquivos (usuario_id, nome_original, nome_arquivo, tipo_arquivo, tamanho, pasta_id) VALUES (?, ?, ?, ?, ?, ?)',
            [usuario_id, arquivo.originalname, arquivo.filename, tipo, arquivo.size, pastaIdValue]
        );

        console.log('Arquivo salvo no banco com ID:', result.insertId, 'pasta_id:', pastaIdValue);

        res.json({ 
            message: 'Arquivo enviado com sucesso',
            arquivo: {
                id: result.insertId,
                nome: arquivo.originalname,
                tipo: tipo,
                tamanho: arquivo.size,
                pasta_id: pastaIdValue
            }
        });
    } catch (error) {
        console.error('Erro no upload:', error);
        res.status(500).json({ error: 'Erro ao fazer upload' });
    }
});

app.get('/api/arquivos/:usuario_id', async (req, res) => {
    try {
        const [arquivos] = await db.promise().query(
            'SELECT * FROM arquivos WHERE usuario_id = ? ORDER BY data_upload DESC',
            [req.params.usuario_id]
        );
        res.json(arquivos);
    } catch (error) {
        console.error('Erro ao listar arquivos:', error);
        res.status(500).json({ error: 'Erro ao buscar arquivos' });
    }
});

app.delete('/api/arquivos/:id', async (req, res) => {
    try {
        const [arquivos] = await db.promise().query('SELECT * FROM arquivos WHERE id = ?', [req.params.id]);
        
        if (arquivos.length === 0) {
            return res.status(404).json({ error: 'Arquivo não encontrado' });
        }

        const arquivo = arquivos[0];
        
        await db.promise().query('DELETE FROM arquivos WHERE id = ?', [req.params.id]);
        
        const caminhoArquivo = path.join(__dirname, '../uploads', arquivo.nome_arquivo);
        if (fs.existsSync(caminhoArquivo)) {
            fs.unlinkSync(caminhoArquivo);
        }
        
        res.json({ message: 'Arquivo deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar arquivo:', error);
        res.status(500).json({ error: 'Erro ao deletar arquivo' });
    }
});

app.put('/api/arquivos/:id', async (req, res) => {
    try {
        const { nome_original } = req.body;
        const { id } = req.params;
        
        if (!nome_original) {
            return res.status(400).json({ error: 'Nome é obrigatório' });
        }
        
        await db.promise().query(
            'UPDATE arquivos SET nome_original = ? WHERE id = ?',
            [nome_original, id]
        );
        
        res.json({ message: 'Arquivo renomeado com sucesso' });
    } catch (error) {
        console.error('Erro ao renomear arquivo:', error);
        res.status(500).json({ error: 'Erro ao renomear arquivo' });
    }
});

app.post('/api/arquivos/:id/comentario', async (req, res) => {
    try {
        const { comentario } = req.body;
        const { id } = req.params;
        
        await db.promise().query(
            'UPDATE arquivos SET comentario = ? WHERE id = ?',
            [comentario, id]
        );
        
        res.json({ message: 'Comentário salvo com sucesso' });
    } catch (error) {
        console.error('Erro ao salvar comentário:', error);
        res.status(500).json({ error: 'Erro ao salvar comentário' });
    }
});

app.get('/api/arquivos/:id/comentario', async (req, res) => {
    try {
        const [arquivos] = await db.promise().query(
            'SELECT comentario FROM arquivos WHERE id = ?',
            [req.params.id]
        );
        
        if (arquivos.length === 0) {
            return res.status(404).json({ error: 'Arquivo não encontrado' });
        }
        
        res.json({ comentario: arquivos[0].comentario });
    } catch (error) {
        console.error('Erro ao buscar comentário:', error);
        res.status(500).json({ error: 'Erro ao buscar comentário' });
    }
});

app.get('/api/pastas/:id/download', async (req, res) => {
    const pastaId = req.params.id;
    const usuarioId = req.query.usuario_id;
    
    try {
        const [pastas] = await db.promise().query('SELECT * FROM pastas WHERE id = ?', [pastaId]);
        
        if (pastas.length === 0) {
            return res.status(404).json({ error: 'Pasta não encontrada' });
        }
        
        const pasta = pastas[0];
        
        const [compartilhado] = await db.promise().query('SELECT * FROM compartilhamentos WHERE pasta_id = ? AND usuario_compartilhado_id = ?', [pastaId, usuarioId]);
        
        if (pasta.usuario_id != usuarioId && compartilhado.length === 0) {
            return res.status(403).json({ error: 'Acesso negado' });
        }
        
        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        
        const tempZipPath = path.join(tempDir, `${Date.now()}_${pasta.nome}.zip`);
        const output = fs.createWriteStream(tempZipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });
        
        archive.on('error', (err) => {
            console.error('Archive error:', err);
            res.status(500).json({ error: 'Erro ao criar ZIP' });
        });
        
        archive.pipe(output);
        
        const adicionarConteudo = async (pastaIdAtual, caminhoAtual) => {
            const [arquivos] = await db.promise().query('SELECT * FROM arquivos WHERE pasta_id = ?', [pastaIdAtual]);
            
            for (const arquivo of arquivos) {
                const caminhoArquivo = path.join(__dirname, '../uploads', arquivo.nome_arquivo);
                if (fs.existsSync(caminhoArquivo)) {
                    archive.file(caminhoArquivo, { name: path.join(caminhoAtual, arquivo.nome_original) });
                }
            }
            
            const [subPastas] = await db.promise().query('SELECT * FROM pastas WHERE pasta_pai_id = ?', [pastaIdAtual]);
            
            for (const subPasta of subPastas) {
                const novoCaminho = path.join(caminhoAtual, subPasta.nome);
                archive.append('', { name: novoCaminho + '/' });
                await adicionarConteudo(subPasta.id, novoCaminho);
            }
        };
        
        await adicionarConteudo(pastaId, pasta.nome);
        
        await archive.finalize();
        
        output.on('close', () => {
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Content-Disposition', `attachment; filename="${pasta.nome}.bin"`);
            res.setHeader('Content-Length', fs.statSync(tempZipPath).size);
            res.setHeader('Cache-Control', 'public, max-age=0');
            res.setHeader('Pragma', 'public');
            res.setHeader('Expires', '0');
            res.setHeader('Content-Transfer-Encoding', 'binary');
            res.setHeader('X-Content-Type-Options', 'nosniff');
            
            const fileStream = fs.createReadStream(tempZipPath);
            fileStream.pipe(res);
            
            fileStream.on('end', () => {
                fs.unlink(tempZipPath, (err) => {
                    if (err) console.error('Erro ao remover temp:', err);
                });
            });
        });
        
    } catch (error) {
        console.error('Erro ao baixar pasta:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Erro ao baixar pasta' });
        }
    }
});

app.post('/api/pastas', async (req, res) => {
    try {
        const { usuario_id, nome, pasta_pai_id } = req.body;
        
        if (!usuario_id || !nome) {
            return res.status(400).json({ error: 'Usuário e nome são obrigatórios' });
        }
        
        const [result] = await db.promise().query(
            'INSERT INTO pastas (usuario_id, nome, pasta_pai_id) VALUES (?, ?, ?)',
            [usuario_id, nome, pasta_pai_id || null]
        );
        
        res.status(201).json({ 
            message: 'Pasta criada com sucesso',
            pasta: { id: result.insertId, nome, pasta_pai_id }
        });
    } catch (error) {
        console.error('Erro ao criar pasta:', error);
        res.status(500).json({ error: 'Erro ao criar pasta' });
    }
});

app.get('/api/pastas/:usuario_id', async (req, res) => {
    try {
        const [pastas] = await db.promise().query(
            'SELECT * FROM pastas WHERE usuario_id = ? ORDER BY nome',
            [req.params.usuario_id]
        );
        res.json(pastas);
    } catch (error) {
        console.error('Erro ao listar pastas:', error);
        res.status(500).json({ error: 'Erro ao listar pastas' });
    }
});

app.get('/api/pasta/:pasta_id/conteudo', async (req, res) => {
    try {
        const pasta_id = req.params.pasta_id === 'root' ? null : req.params.pasta_id;
        const usuario_id = req.query.usuario_id;
        
        console.log('Buscando conteúdo da pasta:', { pasta_id, usuario_id });
        
        let temAcesso = false;
        
        const [pastaPropria] = await db.promise().query('SELECT * FROM pastas WHERE id = ? AND usuario_id = ?', [pasta_id, usuario_id]);
        
        if (pastaPropria.length > 0) {
            temAcesso = true;
            console.log('Acesso à pasta própria');
        } else {
            const [pastaCompartilhada] = await db.promise().query('SELECT * FROM compartilhamentos WHERE pasta_id = ? AND usuario_compartilhado_id = ?', [pasta_id, usuario_id]);
            
            if (pastaCompartilhada.length > 0) {
                temAcesso = true;
                console.log('Acesso à pasta compartilhada');
            }
        }
        
        if (!temAcesso) {
            console.log('Acesso negado à pasta');
            return res.status(403).json({ error: 'Acesso negado' });
        }
        
        const [pastas] = await db.promise().query('SELECT * FROM pastas WHERE pasta_pai_id = ? ORDER BY nome', [pasta_id]);
        const [arquivos] = await db.promise().query('SELECT * FROM arquivos WHERE pasta_id = ? ORDER BY data_upload DESC', [pasta_id]);
        
        console.log(`Encontradas ${pastas.length} subpastas e ${arquivos.length} arquivos`);
        
        res.json({ pastas, arquivos });
    } catch (error) {
        console.error('Erro ao buscar conteúdo:', error);
        res.status(500).json({ error: 'Erro ao buscar conteúdo' });
    }
});

app.put('/api/arquivos/:id/mover', async (req, res) => {
    try {
        const { pasta_id } = req.body;
        const { id } = req.params;
        
        await db.promise().query('UPDATE arquivos SET pasta_id = ? WHERE id = ?', [pasta_id || null, id]);
        
        res.json({ message: 'Arquivo movido com sucesso' });
    } catch (error) {
        console.error('Erro ao mover arquivo:', error);
        res.status(500).json({ error: 'Erro ao mover arquivo' });
    }
});

app.put('/api/pastas/:id', async (req, res) => {
    try {
        const { nome } = req.body;
        const { id } = req.params;
        
        await db.promise().query('UPDATE pastas SET nome = ? WHERE id = ?', [nome, id]);
        
        res.json({ message: 'Pasta renomeada com sucesso' });
    } catch (error) {
        console.error('Erro ao renomear pasta:', error);
        res.status(500).json({ error: 'Erro ao renomear pasta' });
    }
});

app.delete('/api/pastas/:id', async (req, res) => {
    try {
        await db.promise().query('UPDATE arquivos SET pasta_id = NULL WHERE pasta_id = ?', [req.params.id]);
        await db.promise().query('DELETE FROM pastas WHERE id = ?', [req.params.id]);
        
        res.json({ message: 'Pasta deletada com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar pasta:', error);
        res.status(500).json({ error: 'Erro ao deletar pasta' });
    }
});

app.put('/api/pastas/:id/favoritar', async (req, res) => {
    try {
        const { favorito } = req.body;
        await db.promise().query('UPDATE pastas SET favorito = ? WHERE id = ?', [favorito, req.params.id]);
        res.json({ message: 'Pasta atualizada com sucesso' });
    } catch (error) {
        console.error('Erro ao favoritar pasta:', error);
        res.status(500).json({ error: 'Erro ao favoritar pasta' });
    }
});

app.put('/api/arquivos/:id/favoritar', async (req, res) => {
    try {
        const { favorito } = req.body;
        await db.promise().query('UPDATE arquivos SET favorito = ? WHERE id = ?', [favorito, req.params.id]);
        res.json({ message: 'Arquivo atualizado com sucesso' });
    } catch (error) {
        console.error('Erro ao favoritar arquivo:', error);
        res.status(500).json({ error: 'Erro ao favoritar arquivo' });
    }
});

app.post('/api/compartilhar', async (req, res) => {
    try {
        const { pasta_id, email_compartilhado, permissao } = req.body;
        
        const [usuarios] = await db.promise().query('SELECT id FROM usuarios WHERE email = ?', [email_compartilhado]);
        
        if (usuarios.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        const usuario_compartilhado_id = usuarios[0].id;
        
        const [existente] = await db.promise().query('SELECT * FROM compartilhamentos WHERE pasta_id = ? AND usuario_compartilhado_id = ?', [pasta_id, usuario_compartilhado_id]);
        
        if (existente.length > 0) {
            await db.promise().query('UPDATE compartilhamentos SET permissao = ? WHERE pasta_id = ? AND usuario_compartilhado_id = ?', [permissao, pasta_id, usuario_compartilhado_id]);
            res.json({ message: 'Permissão atualizada com sucesso' });
        } else {
            await db.promise().query('INSERT INTO compartilhamentos (pasta_id, usuario_compartilhado_id, permissao) VALUES (?, ?, ?)', [pasta_id, usuario_compartilhado_id, permissao]);
            res.json({ message: 'Pasta compartilhada com sucesso' });
        }
    } catch (error) {
        console.error('Erro ao compartilhar:', error);
        res.status(500).json({ error: 'Erro ao compartilhar pasta' });
    }
});

app.get('/api/compartilhados/:usuario_id', async (req, res) => {
    try {
        const [pastas] = await db.promise().query(`
            SELECT p.*, c.permissao, u.email as proprietario_email 
            FROM compartilhamentos c
            JOIN pastas p ON c.pasta_id = p.id
            JOIN usuarios u ON p.usuario_id = u.id
            WHERE c.usuario_compartilhado_id = ?
        `, [req.params.usuario_id]);
        
        res.json(pastas);
    } catch (error) {
        console.error('Erro ao listar compartilhados:', error);
        res.status(500).json({ error: 'Erro ao listar compartilhados' });
    }
});

app.delete('/api/compartilhamentos/:pasta_id', async (req, res) => {
    try {
        const { pasta_id } = req.params;
        const { usuario_id } = req.query;
        
        const [compartilhamento] = await db.promise().query('SELECT * FROM compartilhamentos WHERE pasta_id = ? AND usuario_compartilhado_id = ?', [pasta_id, usuario_id]);
        
        if (compartilhamento.length === 0) {
            return res.status(404).json({ error: 'Compartilhamento não encontrado' });
        }
        
        await db.promise().query('DELETE FROM compartilhamentos WHERE pasta_id = ? AND usuario_compartilhado_id = ?', [pasta_id, usuario_id]);
        
        res.json({ message: 'Pasta removida da sua lista com sucesso' });
    } catch (error) {
        console.error('Erro ao remover compartilhamento:', error);
        res.status(500).json({ error: 'Erro ao remover compartilhamento' });
    }
});


app.put('/api/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, senha } = req.body;
        
        const [existe] = await db.promise().query('SELECT * FROM usuarios WHERE email = ? AND id != ?', [email, id]);
        
        if (existe.length > 0) {
            return res.status(400).json({ error: 'Email já está em uso' });
        }
        
        if (senha) {
            const saltRounds = 10;
            const senhaCriptografada = await bcrypt.hash(senha, saltRounds);
            await db.promise().query('UPDATE usuarios SET nome = ?, email = ?, senha = ? WHERE id = ?', [nome, email, senhaCriptografada, id]);
        } else {
            await db.promise().query('UPDATE usuarios SET nome = ?, email = ? WHERE id = ?', [nome, email, id]);
        }
        
        res.json({ message: 'Perfil atualizado com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }
});

app.get('/api/admin/usuarios', async (req, res) => {
    try {
        const [usuarios] = await db.promise().query('SELECT id, nome, email, tipo, status, inativacao_justificativa, data_criacao FROM usuarios');
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
});
app.get('/api/admin/arquivos', async (req, res) => {
    try {
        const [arquivos] = await db.promise().query('SELECT * FROM arquivos');
        res.json(arquivos);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar arquivos' });
    }
});

app.get('/api/admin/pastas', async (req, res) => {
    try {
        const [pastas] = await db.promise().query('SELECT * FROM pastas');
        res.json(pastas);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar pastas' });
    }
});

app.put('/api/admin/usuarios/:id/tornar-admin', async (req, res) => {
    try {
        await db.promise().query('UPDATE usuarios SET tipo = "admin" WHERE id = ?', [req.params.id]);
        res.json({ message: 'Usuário promovido a admin' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao promover usuário' });
    }
});

app.delete('/api/admin/usuarios/:id', async (req, res) => {
    try {
        await db.promise().query('DELETE FROM usuarios WHERE id = ? AND tipo != "admin"', [req.params.id]);
        res.json({ message: 'Usuário deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar usuário' });
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor rodando na porta ${PORT}`);
});