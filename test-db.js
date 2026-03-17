const mysql = require('mysql2');

const DB_CONFIG = {
    host: 'localhost',
    user: 'root',
    password: 'usbw',
    database: 'organizador_arquivos'
};

    console.log('📁 Testando conexão com:');
    console.log('Host:', DB_CONFIG.host);
    console.log('User:', DB_CONFIG.user);
    console.log('Database:', DB_CONFIG.database);
    console.log('Password:', DB_CONFIG.password ? '******' : '(vazia)');

const db = mysql.createConnection(DB_CONFIG);

db.connect((err) => {
    if (err) {
        console.error('❌ Erro na conexão:', err);
        return;
    }
    console.log('✅ Conectado ao MySQL!');
    
    db.query('SELECT COUNT(*) as total FROM usuarios', (err, results) => {
        if (err) {
            console.error('❌ Erro na query:', err);
        } else {
            console.log('✅ Total de usuários:', results[0].total);
        }
        db.end();
    });
});