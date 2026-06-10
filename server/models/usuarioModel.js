// importa a configuração do banco
const db = require("../config/db.js")

module.exports = {
    // Busca o usuário na tabela, com o email fornecido
    buscarPorEmail: async (email) => {
        // Query pra fazer a consulta no banco
        const query = 'SELECT * FROM usuarios WHERE email = ?'
        // Guarda o resultado da consulta na variável
        const [linhas] = await db.execute(query, [email])
        // Retorna pro controller o resultado, nesse caso o usuário encontrado
        return linhas[0]
    }
    ,
    // CRUD
    // CREATE
    criarUsuario: async (nome, email, senha, telefone, foto, perfil) => {
        // Query pra fazer a consulta no banco
        const query = `INSERT INTO usuarios (nome, email, senha, telefone, foto, perfil)
                       VALUES (?,?,?,?,?,?)`
        // Guarda o resultado da consulta na variável
        const [resultado] = await db.execute(query, [nome, email, senha, telefone, foto, perfil])
        // Retorna pro controller o resultado, nesse caso o id do usuário inserido
        return resultado.insertId
    },
    // READ
    listarUsuarios: async () => {
        const query = 'SELECT * FROM usuarios'
        // Guarda o resultado da consulta na variável
        const [linhas] = await db.execute(query)
        // Retorna pro controller o resultado, nesse caso a lista com todos os usuários
        return linhas
    },

    deletarUsuario: async (id) => {
        // Query pra fazer a consulta no banco
        const query = 'DELETE FROM usuarios WHERE id = ?'
        // Guarda o resultado da consulta na variável
        const [resultado] = await db.execute(query, [id])
        // Retorna pro controller o resultado, nesse caso o número de linhas afetadas
        return resultado.affectedRows
    },

    // UPDATE
    // BUSCA POR ID
    buscarPorId: async (id) => {
        // Query pra fazer a consulta no banco
        const query = 'SELECT * FROM usuarios WHERE id = ?'
        // Guarda o resultado da consulta na variável
        const [linhas] = await db.execute(query, [id])
        // Retorna pro controller o resultado, nesse caso o usuário encontrado
        return linhas[0]
    },

    //FAZ A ATUALIZAÇÃO
    atualizarUsuario: async (id, nome, email, senhaHash, telefone, foto, perfil) => {
        //LOGICA PARA ATUALIZAR COM E SEM FOTO ANEXADA
        if (foto) {
            const query = `UPDATE usuarios
                            SET nome = ?, email = ?, senha = ?, telefone = ?, foto = ?, perfil = ?
                            WHERE id = ?`
            const [resultado] = await db.execute(query, [nome, email, senhaHash, telefone, foto, perfil, id])
            return resultado.affectedRows
        }
        else {
            const query = `UPDATE usuarios
                            SET nome = ?, email = ?, senha = ?, telefone = ?, perfil = ?
                            WHERE id = ?`
            const [resultado] = await db.execute(query, [nome, email, senhaHash, telefone, perfil, id])
            return resultado.affectedRows
        }
    }
}
