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
  { dt: '17/06/2026 09:30', host: 'SRV-01', info: 'Backup concluído com sucesso', status: 'NORMAL' },
  { dt: '17/06/2026 09:15', host: 'PC-204', info: 'Atualização de antivírus realizada', status: 'NORMAL' },
  { dt: '17/06/2026 08:50', host: 'SRV-03', info: 'Disco com 82% de utilização', status: 'ATENCAO' },
  { dt: '17/06/2026 08:20', host: 'ROTA-07', info: 'Conexão retomada após falha', status: 'NORMAL' },
  { dt: '17/06/2026 07:55', host: 'PC-118', info: 'Login bloqueado por senha expirada', status: 'CRITICO' }
];

// Helper para consolidar lógica de dashboard
const renderizarDashboard = async (req, res, isAdmin = true) => {
  try {
    const totalAtivos = await ativoModel.contarAtivos();
    const statusMonitor = await ativoModel.contarPorStatusMonitoramento();
    const setores = await ativoModel.contarPorSetor();
    const ultimos_eventos = await monitoramentoModel.buscarUltimos(5);

    const eventosFormatados = ultimos_eventos.map(evento => ({
      dt: new Date(evento.data_coleta).toLocaleString('pt-BR'),
      host: evento.nome_maquina,
      status: evento.status_monitoramento || null,
      info: evento.observacoes || `CPU: ${evento.uso_cpu}% | Memória: ${evento.uso_memoria}% | Disco: ${evento.uso_disco}%`
    }));

    res.render('admin/painel', {
      totalAtivos: totalAtivos,
      otimo: statusMonitor.normal || 0,
      atencao: statusMonitor.atencao || 0,
      critico: statusMonitor.critico || 0,
      setores: setores || [],
      eventos: eventosFormatados.length ? eventosFormatados : eventosExemplo
    });
  } catch (erro) {
    console.error("Erro ao carregar dashboard:", erro);
    res.render('admin/painel', {
      totalAtivos: 0,
      otimo: 0,
      atencao: 0,
      critico: 0,
      setores: [],
      eventos: []
    });
  }
};

// Helper para consolidar lógica de gerenciar computadores
const renderizarGerenciador = async (req, res) => {
  try {
    const ativos = await ativoModel.listarAtivos();
    const setores = await ativoModel.contarPorSetor();
    res.render('admin/gerenciar-computadoresAdmin', { ativos: ativos || [], setores: setores || [] });
  } catch (erro) {
    console.error("Erro ao carregar gerenciador:", erro);
    res.render('admin/gerenciar-computadoresAdmin', { ativos: [], setores: [] });
  }
};

// Helper para consolidar lógica de relatórios
const renderizarRelatorios = async (req, res, isAdmin = false) => {
  try {
    const ativos = await ativoModel.listarAtivosRelatorio();
    const setores = await ativoModel.contarPorSetor();
    const statusResumo = await ativoModel.contarPorStatusMonitoramento();
    const totalAtivos = ativos.length;
    const onlineCount = (statusResumo && statusResumo.normal) ? statusResumo.normal : ativos.filter(a => a.status_monitoramento).length;

    const data = {
      ativos: ativos || [],
      setores: setores || [],
      statusResumo: statusResumo || { normal: 0, atencao: 0, critico: 0 },
      totalAtivos,
      onlineCount
    };

    // Admin tem acesso a histórico completo
    if (isAdmin) {
      try {
        data.historico = await monitoramentoModel.buscarHistoricoEventos(100);
      } catch (histErro) {
        console.error("Erro ao buscar histórico:", histErro);
        data.historico = [];
      }
    }

    res.render('admin/relatorios', data);
  } catch (erro) {
    console.error("Erro ao carregar relatórios:", erro);
    res.render('admin/relatorios', {
      ativos: [],
      setores: [],
      statusResumo: { normal: 0, atencao: 0, critico: 0 },
      totalAtivos: 0,
      onlineCount: 0
    });
  }
};

module.exports = {
  dashboardAdmin: (req, res) => renderizarDashboard(req, res, true),
  dashboardTecnico: (req, res) => renderizarDashboard(req, res, false),
  gerenciarComputadoresAdmin: (req, res) => renderizarGerenciador(req, res),
  gerenciarComputadoresTecnico: (req, res) => renderizarGerenciador(req, res),
  relatorios: (req, res) => renderizarRelatorios(req, res, false),
  relatoriosAdmin: (req, res) => renderizarRelatorios(req, res, true),
  limparHistorico: async (req, res) => {
    try {
      await monitoramentoModel.limparHistorico();
      res.json({ sucesso: true, mensagem: 'Histórico limpo com sucesso' });
    } catch (erro) {
      console.error('Erro ao limpar histórico:', erro);
      res.status(500).json({ sucesso: false, mensagem: 'Erro ao limpar histórico' });
    }
  }
};
