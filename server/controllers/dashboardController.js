// Importar models
const ativoModel = require("../models/ativoModel.js");
const monitoramentoModel = require("../models/monitoramentoModel.js");

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
        setores: setores || [],
        eventos: ultimos_eventos || []
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
        setores: setores || [],
        eventos: ultimos_eventos || []
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
