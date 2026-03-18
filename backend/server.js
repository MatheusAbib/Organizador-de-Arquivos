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
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';



app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads'); 
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
},
    filename: (req, file, cb) => {
        const nomeLimpo = file.originalname.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const uniqueName = Date.now() + '-' + nomeLimpo;
        cb(null, uniqueName);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = {
            'application/pdf': 'pdf',
            'application/msword': 'word',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'word',
            'application/vnd.ms-excel': 'excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'excel',
            'application/vnd.ms-powerpoint': 'powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'powerpoint',
            'text/plain': 'texto',
            'text/html': 'texto',
            'text/css': 'texto',
            'application/javascript': 'texto',
            'application/json': 'texto',
            'application/xml': 'texto',
            'text/x-sql': 'sql',
            'application/sql': 'sql',
            'image/jpeg': 'imagem',
            'image/png': 'imagem',
            'image/gif': 'imagem',
            'image/bmp': 'imagem',
            'image/svg+xml': 'imagem',
            'image/webp': 'imagem',
            'image/tiff': 'imagem',
            'image/vnd.adobe.photoshop': 'imagem_design',
            'application/postscript': 'imagem_design',
            'application/x-dwg': 'cad',
            'application/x-dxf': 'cad',
            'application/zip': 'compactado',
            'application/x-rar-compressed': 'compactado',
            'application/x-7z-compressed': 'compactado',
            'application/x-tar': 'compactado',
            'application/gzip': 'compactado',
            'application/x-iso9660-image': 'disco',
            'audio/mpeg': 'audio',
            'audio/wav': 'audio',
            'audio/flac': 'audio',
            'audio/ogg': 'audio',
            'audio/mp4': 'audio',
            'video/mp4': 'video',
            'video/x-msvideo': 'video',
            'video/quicktime': 'video',
            'video/x-ms-wmv': 'video',
            'video/x-matroska': 'video',
            'application/x-msdownload': 'executavel',
            'application/x-msi': 'executavel',
            'application/x-bat': 'executavel',
            'application/x-sh': 'executavel',
            'application/x-font-ttf': 'fonte',
            'font/otf': 'fonte',
            'application/vnd.ms-opentype': 'fonte',
            'application/x-bittorrent': 'torrent',
            'application/x-msconfig': 'config',
            'application/octet-stream': 'outros'
        };
        
        if (allowedTypes[file.mimetype]) {
            cb(null, true);
        } else {
            const ext = path.extname(file.originalname).toLowerCase();
            const extensoesPermitidas = [
                '.pdf', '.doc', '.docx', '.dot', '.dotx', '.docm', '.dotm',
                '.xls', '.xlsx', '.xlsm', '.xlsb', '.xlt', '.xltx', '.xltm', '.csv', '.ods',
                '.ppt', '.pptx', '.pptm', '.pot', '.potx', '.potm', '.pps', '.ppsx', '.ppsm', '.odp',
                '.txt', '.rtf', '.md', '.log', '.json', '.xml', '.html', '.htm', '.css', '.scss', '.sass', '.less',
                '.js', '.jsx', '.ts', '.tsx', '.php', '.py', '.java', '.class', '.c', '.cpp', '.h', '.hpp', '.cs',
                '.vb', '.rb', '.go', '.rs', '.swift', '.kt', '.kts', '.dart', '.lua', '.pl', '.pm', '.t',
                '.sql', '.mysql', '.pgsql', '.sqlite', '.db', '.sqlite3', '.db3', '.mdb', '.accdb', '.frm', '.myd', '.myi', '.ibd',
                '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp', '.ico', '.tif', '.tiff', '.raw', '.cr2', '.nef', '.arw', '.dng',
                '.psd', '.ai', '.eps', '.cdr', '.xd', '.sketch', '.fig',
                '.dwg', '.dxf', '.dgn', '.dwf', '.3dm', '.3ds', '.max', '.blend', '.obj', '.fbx', '.stl', '.step', '.stp', '.iges', '.igs',
                '.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.xz', '.zst',
                '.iso', '.img', '.vhd', '.vmdk',
                '.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a', '.wma', '.opus', '.aiff',
                '.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm', '.m4v', '.mpg', '.mpeg', '.rm', '.rmvb', '.vob', '.m2ts',
                '.exe', '.msi', '.bat', '.cmd', '.sh', '.app', '.deb', '.rpm', '.dmg', '.pkg',
                '.ttf', '.otf', '.woff', '.woff2', '.eot', '.fon',
                '.torrent', '.part', '.crdownload',
                '.dll', '.sys', '.drv',
                '.ini', '.cfg', '.conf', '.config', '.reg',
                '.bak', '.backup', '.old',
                '.tmp', '.temp'
            ];
            
            if (extensoesPermitidas.includes(ext)) {
                cb(null, true);
            } else {
                cb(new Error('Tipo de arquivo não suportado'));
            }
        }
    }
});

const db = mysql.createConnection({
    host: process.env.MYSQL_ADDON_HOST,
    user: process.env.MYSQL_ADDON_USER,
    password: process.env.MYSQL_ADDON_PASSWORD,
    database: process.env.MYSQL_ADDON_DB,
    port: process.env.MYSQL_ADDON_PORT || 3306
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
        } else if (['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm', '.m4v', '.mpg', '.mpeg', '.rm', '.3gp', '.rmvb', '.vob', '.ts', '.m2ts'].includes(ext)) {
            tipo = 'video';
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
        
        const caminhoArquivo = path.join(__dirname, 'uploads', arquivo.nome_arquivo);
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
        
        const [compartilhado] = await db.promise().query(
            'SELECT * FROM compartilhamentos WHERE pasta_id = ? AND usuario_compartilhado_id = ?', 
            [pastaId, usuarioId]
        );
        
        if (pasta.usuario_id != usuarioId && compartilhado.length === 0) {
            return res.status(403).json({ error: 'Acesso negado' });
        }
        
        const tempDir = path.join(__dirname, 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        
        const tempZipPath = path.join(tempDir, `${Date.now()}_${pasta.nome.replace(/[^a-z0-9]/gi, '_')}.zip`);
        const output = fs.createWriteStream(tempZipPath);
        const archive = archiver('zip', { 
            zlib: { level: 9 },
            store: true 
        });
        
        archive.on('error', (err) => {
            console.error('Archive error:', err);
            if (fs.existsSync(tempZipPath)) {
                fs.unlinkSync(tempZipPath);
            }
            if (!res.headersSent) {
                res.status(500).json({ error: 'Erro ao criar ZIP' });
            }
        });
        
        archive.pipe(output);
        
        const adicionarConteudo = async (pastaIdAtual, caminhoAtual) => {
            const [arquivos] = await db.promise().query(
                'SELECT * FROM arquivos WHERE pasta_id = ?', 
                [pastaIdAtual]
            );
            
            for (const arquivo of arquivos) {
                const caminhoArquivo = path.join(__dirname, 'uploads', arquivo.nome_arquivo);
                
                if (fs.existsSync(caminhoArquivo)) {
                    try {
                        archive.file(caminhoArquivo, { 
                            name: path.join(caminhoAtual, arquivo.nome_original)
                        });
                        console.log(`Adicionado: ${arquivo.nome_original}`);
                    } catch (err) {
                        console.error(`Erro ao adicionar arquivo ${arquivo.nome_original}:`, err);
                    }
                } else {
                    console.log(`Arquivo não encontrado: ${caminhoArquivo}`);
                }
            }
            
            const [subPastas] = await db.promise().query(
                'SELECT * FROM pastas WHERE pasta_pai_id = ?', 
                [pastaIdAtual]
            );
            
            for (const subPasta of subPastas) {
                const novoCaminho = path.join(caminhoAtual, subPasta.nome);
                archive.append('', { name: novoCaminho + '/' });
                await adicionarConteudo(subPasta.id, novoCaminho);
            }
        };
        
        await adicionarConteudo(pastaId, pasta.nome);
        
        await archive.finalize();
        
        output.on('close', () => {
            console.log(`ZIP criado: ${tempZipPath} (${archive.pointer()} bytes)`);
            
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(pasta.nome)}.zip"`);
            res.setHeader('Content-Length', fs.statSync(tempZipPath).size);
            res.setHeader('Cache-Control', 'no-cache');
            
            const fileStream = fs.createReadStream(tempZipPath);
            fileStream.pipe(res);
            
            fileStream.on('end', () => {
                fs.unlink(tempZipPath, (err) => {
                    if (err) console.error('Erro ao remover temp:', err);
                    else console.log('Arquivo temporário removido');
                });
            });
            
            fileStream.on('error', (err) => {
                console.error('Erro ao enviar arquivo:', err);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Erro ao enviar arquivo' });
                }
            });
        });
        
    } catch (error) {
        console.error('Erro ao baixar pasta:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Erro ao baixar pasta: ' + error.message });
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


app.get('/api/pasta/:pasta_id/info', async (req, res) => {
    try {
        const pasta_id = req.params.pasta_id;
        const usuario_id = req.query.usuario_id;
        
        const [pastas] = await db.promise().query(
            'SELECT * FROM pastas WHERE id = ?',
            [pasta_id]
        );
        
        if (pastas.length === 0) {
            return res.status(404).json({ error: 'Pasta não encontrada' });
        }
        
        const pasta = pastas[0];
        let permissao = 'proprietario';
        
        if (pasta.usuario_id != usuario_id) {
            const [compartilhamentos] = await db.promise().query(`
                SELECT c.permissao 
                FROM compartilhamentos c
                JOIN pastas p ON c.pasta_id = p.id
                WHERE p.id = ? AND c.usuario_compartilhado_id = ?
                UNION
                SELECT c.permissao 
                FROM compartilhamentos c
                JOIN pastas p ON c.pasta_id = p.pasta_pai_id
                WHERE p.id = ? AND c.usuario_compartilhado_id = ?
            `, [pasta_id, usuario_id, pasta_id, usuario_id]);
            
            if (compartilhamentos.length > 0) {
                permissao = compartilhamentos[0].permissao;
            } else {
                return res.status(403).json({ error: 'Acesso negado' });
            }
        }
        
        res.json({ pasta, permissao });
        
    } catch (error) {
        console.error('Erro ao buscar info da pasta:', error);
        res.status(500).json({ error: 'Erro ao buscar informações' });
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
        const pasta_id = req.params.pasta_id;
        const usuario_id = req.query.usuario_id;
        
        console.log('Buscando conteúdo da pasta:', { pasta_id, usuario_id });

        const [pastaPropria] = await db.promise().query(
            'SELECT * FROM pastas WHERE id = ? AND usuario_id = ?', 
            [pasta_id, usuario_id]
        );
        
        if (pastaPropria.length > 0) {
            console.log('Acesso à pasta própria');
            const [pastas] = await db.promise().query(
                'SELECT * FROM pastas WHERE pasta_pai_id = ? ORDER BY nome', 
                [pasta_id]
            );
            const [arquivos] = await db.promise().query(
                'SELECT * FROM arquivos WHERE pasta_id = ? ORDER BY data_upload DESC', 
                [pasta_id]
            );
            return res.json({ pastas, arquivos });
        }

        const [compartilhado] = await db.promise().query(
            'SELECT * FROM compartilhamentos WHERE pasta_id = ? AND usuario_compartilhado_id = ?',
            [pasta_id, usuario_id]
        );
        
        if (compartilhado.length > 0) {
            console.log('Acesso à pasta via compartilhamento direto');
            const [pastas] = await db.promise().query(
                'SELECT * FROM pastas WHERE pasta_pai_id = ? ORDER BY nome', 
                [pasta_id]
            );
            const [arquivos] = await db.promise().query(
                'SELECT * FROM arquivos WHERE pasta_id = ? ORDER BY data_upload DESC', 
                [pasta_id]
            );
            return res.json({ pastas, arquivos });
        }

        const [pasta] = await db.promise().query(
            'SELECT pasta_pai_id FROM pastas WHERE id = ?',
            [pasta_id]
        );
        
        if (pasta.length > 0 && pasta[0].pasta_pai_id) {
            const pastaPaiId = pasta[0].pasta_pai_id;
            
            const [compartilhadoPai] = await db.promise().query(
                'SELECT * FROM compartilhamentos WHERE pasta_id = ? AND usuario_compartilhado_id = ?',
                [pastaPaiId, usuario_id]
            );
            
            if (compartilhadoPai.length > 0) {
                console.log('Acesso à subpasta via compartilhamento da pasta pai');
                const [pastas] = await db.promise().query(
                    'SELECT * FROM pastas WHERE pasta_pai_id = ? ORDER BY nome', 
                    [pasta_id]
                );
                const [arquivos] = await db.promise().query(
                    'SELECT * FROM arquivos WHERE pasta_id = ? ORDER BY data_upload DESC', 
                    [pasta_id]
                );
                return res.json({ pastas, arquivos });
            }
        }

        console.log('Acesso negado à pasta');
        return res.status(403).json({ error: 'Acesso negado' });
        
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
        console.log('Body recebido:', req.body);
        
        const { pasta_id, email_compartilhado, permissao } = req.body;
        
        if (!pasta_id || !email_compartilhado || !permissao) {
            return res.status(400).json({ error: 'Dados incompletos', recebido: req.body });
        }
        
        const pastaId = parseInt(pasta_id);
        
        if (isNaN(pastaId)) {
            return res.status(400).json({ error: 'ID da pasta inválido' });
        }
        
        const [usuarios] = await db.promise().query('SELECT id FROM usuarios WHERE email = ?', [email_compartilhado]);
        
        if (usuarios.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        const usuario_compartilhado_id = usuarios[0].id;
        
        const [existente] = await db.promise().query(
            'SELECT * FROM compartilhamentos WHERE pasta_id = ? AND usuario_compartilhado_id = ?', 
            [pastaId, usuario_compartilhado_id]
        );
        
        if (existente.length > 0) {
            await db.promise().query(
                'UPDATE compartilhamentos SET permissao = ? WHERE pasta_id = ? AND usuario_compartilhado_id = ?', 
                [permissao, pastaId, usuario_compartilhado_id]
            );
            res.json({ message: 'Permissão atualizada com sucesso' });
        } else {
            await db.promise().query(
                'INSERT INTO compartilhamentos (pasta_id, usuario_compartilhado_id, permissao) VALUES (?, ?, ?)', 
                [pastaId, usuario_compartilhado_id, permissao]
            );
            res.json({ message: 'Pasta compartilhada com sucesso' });
        }
    } catch (error) {
        console.error('Erro detalhado:', error);
        res.status(500).json({ error: 'Erro interno: ' + error.message });
    }
});


app.get('/api/compartilhados-por-mim/:usuario_id', async (req, res) => {
    try {
        const [compartilhamentos] = await db.promise().query(`
            SELECT 
                c.id,
                c.pasta_id,
                c.permissao,
                p.nome as pasta_nome,
                u.email as usuario_email,
                u.id as usuario_id
            FROM compartilhamentos c
            JOIN pastas p ON c.pasta_id = p.id
            JOIN usuarios u ON c.usuario_compartilhado_id = u.id
            WHERE p.usuario_id = ?
            ORDER BY p.nome, u.email
        `, [req.params.usuario_id]);
        
        res.json(compartilhamentos);
    } catch (error) {
        console.error('Erro ao listar compartilhamentos feitos:', error);
        res.status(500).json({ error: 'Erro ao listar compartilhamentos' });
    }
});

app.put('/api/compartilhamentos/:pasta_id/:usuario_id', async (req, res) => {
    try {
        const { pasta_id, usuario_id } = req.params;
        const { permissao } = req.body;
        
        console.log('Atualizando permissão:', { pasta_id, usuario_id, permissao });
        
        const [result] = await db.promise().query(
            'UPDATE compartilhamentos SET permissao = ? WHERE pasta_id = ? AND usuario_compartilhado_id = ?',
            [permissao, pasta_id, usuario_id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Compartilhamento não encontrado' });
        }
        
        res.json({ message: 'Permissão atualizada com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar compartilhamento:', error);
        res.status(500).json({ error: 'Erro ao atualizar compartilhamento' });
    }
});

app.delete('/api/compartilhamentos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await db.promise().query(
            'DELETE FROM compartilhamentos WHERE id = ?', 
            [id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Compartilhamento não encontrado' });
        }
        
        res.json({ message: 'Compartilhamento removido com sucesso' });
    } catch (error) {
        console.error('Erro ao remover compartilhamento:', error);
        res.status(500).json({ error: 'Erro ao remover compartilhamento' });
    }
});

app.get('/api/compartilhados/:us_id', async (req, res) => {
    try {
        const [pastas] = await db.promise().query(`
            SELECT 
                p.*,
                c.id as compartilhamento_id,
                c.permissao,
                u.email as proprietario_email
            FROM compartilhamentos c
            JOIN pastas p ON c.pasta_id = p.id
            JOIN usuarios u ON p.usuario_id = u.id
            WHERE c.usuario_compartilhado_id = ?
        `, [req.params.us_id]);
        
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
        
        console.log('Removendo compartilhamento:', { pasta_id, usuario_id });
        
        const [result] = await db.promise().query(
            'DELETE FROM compartilhamentos WHERE pasta_id = ? AND usuario_compartilhado_id = ?', 
            [pasta_id, usuario_id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Compartilhamento não encontrado' });
        }
        
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


app.listen(PORT, HOST, () => {
    console.log(`✅ Servidor rodando na porta ${PORT}`);
});