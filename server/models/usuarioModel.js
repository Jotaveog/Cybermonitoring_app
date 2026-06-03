// importa a configuração do banco
const db = require("../config/db.js")

module.exports = {
    // Busca o usuário na tabela, com o email fornecido
    buscarPorEmail: async (email) =>{
        // Query pra fazer a consulta no banco, trazendo também o perfil vinculado
        const query = `SELECT u.*, LOWER(p.nome_perfil) AS perfil
                       FROM usuarios u
                       JOIN perfis p ON u.id_perfil = p.id_perfil
                       WHERE u.email = ?`
        // Guarda o resultado da consulta na variável
        const [linhas] = await db.execute(query, [email])
        // Retorna pro controller o resultado, nesse caso o usuário encontrado
        return linhas[0]
    }
    ,
    // CRUD
    // CREATE
    criarUsuario : async (nome, email, login, senha_hash, id_perfil) =>{
        // Query pra fazer a consulta no banco
        const query = `INSERT INTO usuarios (nome, email, login, senha_hash, id_perfil)
                       VALUES (?,?,?,?,?)`
        // Guarda o resultado da consulta na variável
        const [resultado] = await db.execute(query, [nome, email, login, senha_hash, id_perfil])
        // Retorna pro controller o resultado, nesse caso o id do usuário inserido
        return resultado.insertId 
    }
}
//READ
listarUsuarios : async () =>{
    // Query pra fazer a consulta no banco
    const query = 'SELECT * FROM usuarios'
    // Guarda o resultado da consulta na variável
    const [linhas] = await db.execute(query)
    // Retorna pro controller o resultado, nesse caso a lista de usuários
    return linhas
},

        deletarUsuario ; async (id) => {
        // Query pra fazer a consulta no banco
        const query = 'DELETE FROM usuarios WHERE id = ?'
        // Guarda o resultado da consulta na variável
        const [resultado] = await db.execute(query, [id])
        // Retorna pro controller o resultado, nesse caso o número de linhas afetadas
        return resultado.affectedRows
    }