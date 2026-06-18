// importa a configuração do banco
const db = require("../config/db.js");

module.exports = {
  // Busca últimos monitoramentos
  buscarUltimos: async (limite = 10) => {
    const limit = Number(limite) || 10;
    const query = `SELECT m.*, a.nome_maquina
                   FROM monitoramentos m
                   JOIN ativos a ON m.id_ativo = a.id_ativo
                   ORDER BY m.data_coleta DESC
                   LIMIT ${limit}`;
    const [linhas] = await db.execute(query);
    return linhas;
  },

  // Busca monitoramentos de um ativo específico
  buscarPorAtivo: async (id_ativo, periodo = 30) => {
    const query = `SELECT * FROM monitoramentos
                   WHERE id_ativo = ? AND data_coleta >= DATE_SUB(NOW(), INTERVAL ? DAY)
                   ORDER BY data_coleta DESC`;
    const [linhas] = await db.execute(query, [id_ativo, periodo]);
    return linhas;
  },

  // CREATE - Criar novo monitoramento
  criarMonitoramento: async (dados) => {
    const { id_ativo, status_monitoramento, uso_cpu, uso_memoria, uso_disco, temperatura, observacoes } = dados;
    const query = `INSERT INTO monitoramentos (id_ativo, status_monitoramento, uso_cpu, uso_memoria, uso_disco, temperatura, observacoes, data_coleta)
                   VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`;
    const [resultado] = await db.execute(query, [id_ativo, status_monitoramento, uso_cpu, uso_memoria, uso_disco, temperatura, observacoes]);
    return resultado.insertId;
  },

  // Obter último monitoramento de um ativo
  buscarUltimoMonitoramento: async (id_ativo) => {
    const query = `SELECT * FROM monitoramentos
                   WHERE id_ativo = ?
                   ORDER BY data_coleta DESC
                   LIMIT 1`;
    const [linhas] = await db.execute(query, [id_ativo]);
    return linhas[0];
  },

  // Contagem de monitoramentos por status (últimas 24h)
  contarPorStatusUltimas24h: async () => {
    const query = `SELECT 
                    status_monitoramento,
                    COUNT(*) as quantidade
                   FROM monitoramentos
                   WHERE data_coleta >= DATE_SUB(NOW(), INTERVAL 1 DAY)
                   GROUP BY status_monitoramento`;
    const [linhas] = await db.execute(query);
    return linhas;
  },

  // Buscar eventos críticos recentes
  buscarEventosCriticos: async (limite = 10) => {
    const limit = Number(limite) || 10;
    const query = `SELECT m.*, a.nome_maquina
                   FROM monitoramentos m
                   JOIN ativos a ON m.id_ativo = a.id_ativo
                   WHERE m.status_monitoramento = 'CRITICO'
                   AND m.data_coleta >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                   ORDER BY m.data_coleta DESC
                   LIMIT ${limit}`;
    const [linhas] = await db.execute(query);
    return linhas;
  },

  // Buscar eventos de histórico de status
  buscarHistoricoEventos: async (limite = 100) => {
    const limit = Number(limite) || 100;
    const query = `SELECT h.*, a.nome_maquina,
                          CONCAT(h.status_anterior, ' → ', h.status_novo) AS tipo_evento
                   FROM historico_status h
                   JOIN ativos a ON h.id_ativo = a.id_ativo
                   ORDER BY h.data_registro DESC
                   LIMIT ${limit}`;
    const [linhas] = await db.execute(query);
    return linhas;
  },

  // Limpar histórico de status
  limparHistorico: async () => {
    const query = `DELETE FROM historico_status`;
    const [resultado] = await db.execute(query);
    return resultado.affectedRows;
  },

  // Estatísticas de monitoramento (para relatórios)
  buscarEstatisticas: async (data_inicio, data_fim) => {
    const query = `SELECT 
                    COUNT(*) as total_registros,
                    AVG(uso_cpu) as media_cpu,
                    MAX(uso_cpu) as pico_cpu,
                    AVG(uso_memoria) as media_memoria,
                    MAX(uso_memoria) as pico_memoria,
                    COUNT(CASE WHEN status_monitoramento = 'CRITICO' THEN 1 END) as alertas_criticos
                   FROM monitoramentos
                   WHERE data_coleta BETWEEN ? AND ?`;
    const [resultado] = await db.execute(query, [data_inicio, data_fim]);
    return resultado[0];
  }
};
