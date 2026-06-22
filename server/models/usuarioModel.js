// importa a configuração do banco
const db = require("../config/db.js");

module.exports = {
  // Busca o usuário por email (com informações de perfil)
  buscarPorEmail: async (email) => {
    const query = `SELECT u.*, p.nome_perfil
                   FROM usuarios u
                   LEFT JOIN perfis p ON u.id_perfil = p.id_perfil
                   WHERE u.email = ?`;
    const [linhas] = await db.execute(query, [email]);
    return linhas[0];
  },

  // Busca o usuário por login
  buscarPorLogin: async (login) => {
    const query = `SELECT u.*, p.nome_perfil
                   FROM usuarios u
                   LEFT JOIN perfis p ON u.id_perfil = p.id_perfil
                   WHERE u.login = ?`;
    const [linhas] = await db.execute(query, [login]);
    return linhas[0];
  },

  // Busca usuário por ID
  buscarPorId: async (id) => {
    const query = `SELECT u.*, p.nome_perfil
                   FROM usuarios u
                   LEFT JOIN perfis p ON u.id_perfil = p.id_perfil
                   WHERE u.id_usuario = ?`;
    const [linhas] = await db.execute(query, [id]);
    return linhas[0];
  },

  // CREATE - Criar novo usuário
  criarUsuario: async (nome, email, senha_hash, id_perfil, status = 'ATIVO') => {
    const perfilId = id_perfil && Number(id_perfil) ? Number(id_perfil) : 2;
    const statusUsuario = status && (status === 'ATIVO' || status === 'INATIVO') ? status : 'ATIVO';
    const query = `INSERT INTO usuarios (nome, email, senha_hash, id_perfil, status)
                   VALUES (?, ?, ?, ?, ?)`;
    const [resultado] = await db.execute(query, [nome, email, senha_hash, perfilId, statusUsuario]);
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

  // Listar perfis disponíveis
  listarPerfis: async () => {
    const query = `SELECT id_perfil, nome_perfil FROM perfis ORDER BY id_perfil ASC`;
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

  // Atualizar usuário completo (nome, email, perfil, status e opcionalmente senha)
  atualizarUsuarioCompleto: async (id, nome, email, id_perfil, status, senha_hash) => {
    const perfilId = id_perfil && Number(id_perfil) ? Number(id_perfil) : 2;
    if (senha_hash) {
      const query = `UPDATE usuarios SET nome = ?, email = ?, id_perfil = ?, status = ?, senha_hash = ? WHERE id_usuario = ?`;
      const [resultado] = await db.execute(query, [nome, email, perfilId, status, senha_hash, id]);
      return resultado.affectedRows;
    } else {
      const query = `UPDATE usuarios SET nome = ?, email = ?, id_perfil = ?, status = ? WHERE id_usuario = ?`;
      const [resultado] = await db.execute(query, [nome, email, perfilId, status, id]);
      return resultado.affectedRows;
    }
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


