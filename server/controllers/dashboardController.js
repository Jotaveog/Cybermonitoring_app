// Importar models
const ativoModel = require("../models/ativoModel.js");
const monitoramentoModel = require("../models/monitoramentoModel.js");

const setoresExemplo = [
  { nome: 'TI', quantidade: 18 },
  { nome: 'Financeiro', quantidade: 12 },
  { nome: 'RH', quantidade: 9 },
  { nome: 'Logística', quantidade: 7 },
  { nome: 'Suporte', quantidade: 14 }
];

const eventosExemplo = [
  { dt: '17/06/2026 09:30', host: 'SRV-01', info: 'Backup concluído com sucesso' },
  { dt: '17/06/2026 09:15', host: 'PC-204', info: 'Atualização de antivírus realizada' },
  { dt: '17/06/2026 08:50', host: 'SRV-03', info: 'Disco com 82% de utilização' },
  { dt: '17/06/2026 08:20', host: 'ROTA-07', info: 'Conexão retomada após falha' },
  { dt: '17/06/2026 07:55', host: 'PC-118', info: 'Login bloqueado por senha expirada' }
];

module.exports = {
  // Dashboard Admin - visão completa
  dashboardAdmin: async (req, res) => {
    try {
      // Buscar estatísticas gerais
      const totalAtivos = await ativoModel.contarAtivos();
      const statusMonitor = await ativoModel.contarPorStatusMonitoramento();
      const setores = await ativoModel.contarPorSetor();
      const ultimos_eventos = await monitoramentoModel.buscarUltimos(5);

      res.render('admin/painel', {
        totalAtivos: totalAtivos,
        otimo: statusMonitor.normal || 0,
        atencao: statusMonitor.atencao || 0,
        critico: statusMonitor.critico || 0,
        setores: setoresExemplo,
        eventos: eventosExemplo
      });
    } catch (erro) {
      console.error("Erro ao carregar dashboard admin:", erro);
      res.render('admin/painel', {
        totalAtivos: 0,
        otimo: 0,
        atencao: 0,
        critico: 0,
        setores: [],
        eventos: []
      });
    }
  },

  // Dashboard Técnico - visão restrita
  dashboardTecnico: async (req, res) => {
    try {
      // Buscar estatísticas gerais (mesmos dados, interface diferente)
      const totalAtivos = await ativoModel.contarAtivos();
      const statusMonitor = await ativoModel.contarPorStatusMonitoramento();
      const setores = await ativoModel.contarPorSetor();
      const ultimos_eventos = await monitoramentoModel.buscarUltimos(5);

      res.render('tecnico/painel', {
        totalAtivos: totalAtivos,
        otimo: statusMonitor.normal || 0,
        atencao: statusMonitor.atencao || 0,
        critico: statusMonitor.critico || 0,
        setores: setoresExemplo,
        eventos: eventosExemplo
      });
    } catch (erro) {
      console.error("Erro ao carregar dashboard técnico:", erro);
      res.render('tecnico/painel', {
        totalAtivos: 0,
        otimo: 0,
        atencao: 0,
        critico: 0,
        setores: [],
        eventos: []
      });
    }
  },

  // Página de gerenciamento de computadores (Admin)
  gerenciarComputadoresAdmin: async (req, res) => {
    try {
      const ativos = await ativoModel.listarAtivos();
      res.render('admin/gerenciarPc', { ativos: ativos || [] });
    } catch (erro) {
      console.error("Erro ao carregar gerenciador de computadores:", erro);
      res.render('admin/gerenciarPc', { ativos: [] });
    }
  },

  // Página de gerenciamento de computadores (Técnico)
  gerenciarComputadoresTecnico: async (req, res) => {
    try {
      const ativos = await ativoModel.listarAtivos();
      res.render('tecnico/gerenciar-computadores', { ativos: ativos || [] });
    } catch (erro) {
      console.error("Erro ao carregar gerenciador de computadores:", erro);
      res.render('tecnico/gerenciar-computadores', { ativos: [] });
    }
  },

  // Página de relatórios (Técnico)
  relatorios: async (req, res) => {
    try {
      const eventos_criticos = await monitoramentoModel.buscarEventosCriticos(20);
      res.render('tecnico/relatorios', { eventos_criticos: eventos_criticos || [] });
    } catch (erro) {
      console.error("Erro ao carregar relatórios:", erro);
      res.render('tecnico/relatorios', { eventos_criticos: [] });
    }
  }
};
