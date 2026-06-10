// importa a configuração do banco
const db = require("../config/db.js");

module.exports = {
  // Busca o usuário por email (com informações de perfil)
  buscarPorEmail: async (email) => {
    const query = `SELECT u.*, p.nome_perfil
                   FROM usuarios u
                   JOIN perfis p ON u.id_perfil = p.id_perfil
                   WHERE u.email = ?`;
    const [linhas] = await db.execute(query, [email]);
    return linhas[0];
  },

  // Busca o usuário por login
  buscarPorLogin: async (login) => {
    const query = `SELECT u.*, p.nome_perfil
                   FROM usuarios u
                   JOIN perfis p ON u.id_perfil = p.id_perfil
                   WHERE u.login = ?`;
    const [linhas] = await db.execute(query, [login]);
    return linhas[0];
  },

  // Busca usuário por ID
  buscarPorId: async (id) => {
    const query = `SELECT u.*, p.nome_perfil
                   FROM usuarios u
                   JOIN perfis p ON u.id_perfil = p.id_perfil
                   WHERE u.id_usuario = ?`;
    const [linhas] = await db.execute(query, [id]);
    return linhas[0];
  },

  // CREATE - Criar novo usuário
  criarUsuario: async (nome, email, login, senha_hash, id_perfil) => {
    const query = `INSERT INTO usuarios (nome, email, login, senha_hash, id_perfil, status)
                   VALUES (?, ?, ?, ?, ?, 'ATIVO')`;
    const [resultado] = await db.execute(query, [
      nome,
      email,
      login,
      senha_hash,
      id_perfil,
    ]);
    return resultado.insertId;
  },

  // READ - Listar todos os usuários com suas informações de perfil
  listarUsuarios: async () => {
    const query = `SELECT u.*, p.nome_perfil
                   FROM usuarios u
                   JOIN perfis p ON u.id_perfil = p.id_perfil
                   ORDER BY u.nome ASC`;
    const [linhas] = await db.execute(query);
    return linhas;
  },

  // UPDATE - Atualizar informações do usuário
  atualizarUsuario: async (id, nome, email, status) => {
    const query = `UPDATE usuarios 
                   SET nome = ?, email = ? , status = ?
                   WHERE id_usuario = ?`;
    const [resultado] = await db.execute(query, [nome, email, status, id]);
    return resultado.affectedRows;
  },

  // UPDATE - Atualizar último acesso
  atualizarUltimoAcesso: async (id) => {
    const query = `UPDATE usuarios 
                   SET ultimo_acesso = CURRENT_TIMESTAMP
                   WHERE id_usuario = ?`;
    const [resultado] = await db.execute(query, [id]);
    return resultado.affectedRows;
  },

  // DELETE - Deletar usuário
  deletarUsuario: async (id) => {
    const query = "DELETE FROM usuarios WHERE id_usuario = ?";
    const [resultado] = await db.execute(query, [id]);
    return resultado.affectedRows;
  }
};


