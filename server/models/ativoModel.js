// importa a configuração do banco
const db = require("../config/db.js");

module.exports = {
  // Busca todos os ativos ativos com o último monitoramento registrado
  listarAtivos: async () => {
    const query = `SELECT a.*, m.status_monitoramento, m.uso_cpu, m.uso_memoria, m.data_coleta AS ultima_atualizacao
                   FROM ativos a
                   LEFT JOIN monitoramentos m ON m.id_monitoramento = (
                     SELECT id_monitoramento
                     FROM monitoramentos
                     WHERE id_ativo = a.id_ativo
                     ORDER BY data_coleta DESC
                     LIMIT 1
                   )
                   WHERE a.status_cadastro = 'ATIVO'
                   ORDER BY a.nome_maquina ASC`;
    const [linhas] = await db.execute(query);
    return linhas;
  },

  // Busca ativo por ID com o último monitoramento registrado
  buscarPorId: async (id) => {
    const query = `SELECT a.*, m.status_monitoramento, m.uso_cpu, m.uso_memoria, m.data_coleta AS ultima_atualizacao
                   FROM ativos a
                   LEFT JOIN monitoramentos m ON m.id_monitoramento = (
                     SELECT id_monitoramento
                     FROM monitoramentos
                     WHERE id_ativo = a.id_ativo
                     ORDER BY data_coleta DESC
                     LIMIT 1
                   )
                   WHERE a.id_ativo = ? AND a.status_cadastro = 'ATIVO'`;
    const [linhas] = await db.execute(query, [id]);
    return linhas[0];
  },

  // Busca ativos com dados de relatório (mesma base de listarAtivos)
  listarAtivosRelatorio: async () => {
    return await module.exports.listarAtivos();
  },

  // Busca ativos por setor
  buscarPorSetor: async (setor) => {
    const query = `SELECT * FROM ativos 
                   WHERE setor = ? AND status_cadastro = 'ATIVO'
                   ORDER BY nome_maquina ASC`;
    const [linhas] = await db.execute(query, [setor]);
    return linhas;
  },

  // CREATE - Criar novo ativo
  criarAtivo: async (dados) => {
    const { nome_maquina, ip, setor, laboratorio, sistema_operacional, patrimonio, numero_serie, mac_address } = dados;
    const query = `INSERT INTO ativos (nome_maquina, patrimonio, numero_serie, ip, mac_address, setor, laboratorio, sistema_operacional, status_cadastro)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ATIVO')`;
    const [resultado] = await db.execute(query, [nome_maquina, patrimonio, numero_serie, ip, mac_address, setor, laboratorio, sistema_operacional]);
    return resultado.insertId;
  },

  // READ - Contar total de ativos
  contarAtivos: async () => {
    const query = `SELECT COUNT(*) as total FROM ativos WHERE status_cadastro = 'ATIVO'`;
    const [resultado] = await db.execute(query);
    return resultado[0].total;
  },

  // Contar ativos por status de monitoramento
  contarPorStatusMonitoramento: async () => {
    const query = `SELECT 
                    COUNT(CASE WHEN m.status_monitoramento = 'NORMAL' THEN 1 END) as normal,
                    COUNT(CASE WHEN m.status_monitoramento = 'ATENCAO' THEN 1 END) as atencao,
                    COUNT(CASE WHEN m.status_monitoramento = 'CRITICO' THEN 1 END) as critico
                   FROM monitoramentos m
                   WHERE m.data_coleta >= DATE_SUB(NOW(), INTERVAL 1 DAY)`;
    const [resultado] = await db.execute(query);
    return resultado[0];
  },

  // Contar ativos por setor
  contarPorSetor: async () => {
    const query = `SELECT setor as nome, COUNT(*) as quantidade
                   FROM ativos 
                   WHERE status_cadastro = 'ATIVO' AND setor IS NOT NULL
                   GROUP BY setor
                   ORDER BY setor ASC`;
    const [linhas] = await db.execute(query);
    return linhas;
  },

  // UPDATE - Atualizar ativo
  atualizarAtivo: async (id, dados) => {
    const { nome_maquina, ip, setor, laboratorio, sistema_operacional, patrimonio, numero_serie, mac_address, status_cadastro } = dados;
    const query = `UPDATE ativos 
                   SET nome_maquina = ?, patrimonio = ?, numero_serie = ?, ip = ?, mac_address = ?, setor = ?, laboratorio = ?, sistema_operacional = ?, status_cadastro = ?
                   WHERE id_ativo = ?`;
    const [resultado] = await db.execute(query, [nome_maquina, patrimonio, numero_serie, ip, mac_address, setor, laboratorio, sistema_operacional, status_cadastro, id]);
    return resultado.affectedRows;
  },

  // DELETE - Deletar ativo (soft delete)
  deletarAtivo: async (id) => {
    const query = `UPDATE ativos SET status_cadastro = 'INATIVO' WHERE id_ativo = ?`;
    const [resultado] = await db.execute(query, [id]);
    return resultado.affectedRows;
  },

  // Verificar se um ativo já existe (por IP ou nome_maquina)
  verificarDuplicidade: async (nome_maquina, ip) => {
    const query = `SELECT id_ativo FROM ativos 
                   WHERE (nome_maquina = ? OR ip = ?) AND status_cadastro = 'ATIVO'`;
    const [resultado] = await db.execute(query, [nome_maquina, ip]);
    return resultado.length > 0;
  }
};
