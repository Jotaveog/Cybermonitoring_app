// Script para corrigir coluna `login` no banco: converte '' para NULL e permite NULL
require('dotenv').config();
const pool = require('../config/db.js');

(async () => {
  try {
    console.log('Conectando ao banco...');
    await pool.getConnection();

    console.log("Atualizando registros com login vazio para NULL...");
    await pool.query("UPDATE usuarios SET login = NULL WHERE login = ''");

    console.log('Modificando coluna login para DEFAULT NULL...');
    await pool.query("ALTER TABLE usuarios MODIFY login VARCHAR(50) DEFAULT NULL");

    console.log('Correção aplicada com sucesso.');
    process.exit(0);
  } catch (err) {
    console.error('Erro ao aplicar correção:', err);
    process.exit(1);
  }
})();
