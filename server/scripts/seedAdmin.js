// Script simples para criar um usuário administrador no banco
// Uso: node server/scripts/seedAdmin.js <email> <senha>

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const db = require('../config/db');
const bcrypt = require('bcrypt');

async function seed() {
  try {
    const email = process.argv[2] || process.env.SEED_ADMIN_EMAIL || 'admin@cyber.local';
    const senha = process.argv[3] || process.env.SEED_ADMIN_PASS || '123';

    // Verifica se já existe
    const [rows] = await db.execute('SELECT id_usuario FROM usuarios WHERE email = ?', [email]);
    if (rows && rows.length > 0) {
      console.log('Já existe um usuário com esse email:', email);
      process.exit(0);
    }

    const hash = await bcrypt.hash(senha, 10);

    // Garante os perfis padrão necessários para o administrador
    const perfisDefaults = [
      { id_perfil: 1, nome_perfil: 'Administrador' },
      { id_perfil: 2, nome_perfil: 'Tecnico' }
    ];

    for (const perfil of perfisDefaults) {
      await db.execute(
        'INSERT INTO perfis (id_perfil, nome_perfil) VALUES (?, ?) ON DUPLICATE KEY UPDATE nome_perfil = VALUES(nome_perfil)',
        [perfil.id_perfil, perfil.nome_perfil]
      );
    }

    const nome = 'Administrador';
    const id_perfil = 1; // assumindo 1 = Administrador

    const [res] = await db.execute(
      'INSERT INTO usuarios (nome, email, senha_hash, id_perfil, status) VALUES (?, ?, ?, ?, "ATIVO")',
      [nome, email, hash, id_perfil]
    );

    console.log('Administrador criado com sucesso. ID:', res.insertId);
    console.log('Email:', email);
    console.log('Senha:', senha);
    process.exit(0);
  } catch (err) {
    console.error('Erro ao criar administrador:', err);
    process.exit(1);
  }
}

seed();


// node scripts/seedAdmin.js adm@gmail.com 123