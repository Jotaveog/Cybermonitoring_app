// Importar models
const ativoModel = require("../models/ativoModel.js");
const db = require("../config/db.js");

module.exports = {
  // READ - Listar todos os ativos
  listar: async (req, res) => {
    try {
      const ativos = await ativoModel.listarAtivos();
      res.json({ sucesso: true, dados: ativos });
    } catch (erro) {
      console.error("Erro ao listar ativos:", erro);
      res.status(500).json({ sucesso: false, mensagem: "Erro ao listar ativos" });
    }
  },

  // READ - Obter ativo por ID
  obterPorId: async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({ sucesso: false, mensagem: "ID inválido" });
      }

      const ativo = await ativoModel.buscarPorId(id);
      
      if (!ativo) {
        return res.status(404).json({ sucesso: false, mensagem: "Ativo não encontrado" });
      }

      res.json({ sucesso: true, dados: ativo });
    } catch (erro) {
      console.error("Erro ao obter ativo:", erro);
      res.status(500).json({ sucesso: false, mensagem: "Erro ao obter ativo" });
    }
  },

  // CREATE - Criar novo ativo
  criar: async (req, res) => {
    try {
      const { nome_maquina, ip, setor, laboratorio, so, patrimonio, numero_serie, mac_address } = req.body;

      // Validar campos obrigatórios
      if (!nome_maquina || !ip) {
        return res.status(400).json({ sucesso: false, mensagem: "Nome da máquina e IP são obrigatórios" });
      }

      // Verificar duplicidade
      const existe = await ativoModel.verificarDuplicidade(nome_maquina, ip);
      if (existe) {
        return res.status(400).json({ sucesso: false, mensagem: "Já existe um ativo com este nome ou IP" });
      }

      // Criar ativo
      const novoId = await ativoModel.criarAtivo({
        nome_maquina,
        ip,
        setor: setor || null,
        laboratorio: laboratorio || null,
        sistema_operacional: so || null,
        patrimonio: patrimonio || null,
        numero_serie: numero_serie || null,
        mac_address: mac_address || null
      });

      // Registrar log do sistema
      await db.execute(
        "INSERT INTO logs_sistema (id_usuario, acao, descricao) VALUES (?, ?, ?)",
        [req.usuario.id, "CRIAR_ATIVO", `Ativo criado: ${nome_maquina}`]
      );

      res.json({ sucesso: true, mensagem: "Ativo criado com sucesso", id: novoId });
    } catch (erro) {
      console.error("Erro ao criar ativo:", erro);
      res.status(500).json({ sucesso: false, mensagem: "Erro ao criar ativo" });
    }
  },

  // UPDATE - Atualizar ativo
  atualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const { nome_maquina, ip, setor, laboratorio, so, patrimonio, numero_serie, mac_address, status_cadastro } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({ sucesso: false, mensagem: "ID inválido" });
      }

      // Validar campos obrigatórios
      if (!nome_maquina || !ip) {
        return res.status(400).json({ sucesso: false, mensagem: "Nome da máquina e IP são obrigatórios" });
      }

      // Atualizar ativo
      const linhasAtualizadas = await ativoModel.atualizarAtivo(id, {
        nome_maquina,
        ip,
        setor: setor || null,
        laboratorio: laboratorio || null,
        sistema_operacional: so || null,
        patrimonio: patrimonio || null,
        numero_serie: numero_serie || null,
        mac_address: mac_address || null,
        status_cadastro: status_cadastro || 'ATIVO'
      });

      if (linhasAtualizadas === 0) {
        return res.status(404).json({ sucesso: false, mensagem: "Ativo não encontrado" });
      }

      // Registrar log do sistema
      await db.execute(
        "INSERT INTO logs_sistema (id_usuario, acao, descricao) VALUES (?, ?, ?)",
        [req.usuario.id, "ATUALIZAR_ATIVO", `Ativo atualizado: ${nome_maquina}`]
      );

      res.json({ sucesso: true, mensagem: "Ativo atualizado com sucesso" });
    } catch (erro) {
      console.error("Erro ao atualizar ativo:", erro);
      res.status(500).json({ sucesso: false, mensagem: "Erro ao atualizar ativo" });
    }
  },

  // DELETE - Deletar ativo (soft delete)
  deletar: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({ sucesso: false, mensagem: "ID inválido" });
      }

      // Deletar ativo
      const linhasAtualizadas = await ativoModel.deletarAtivo(id);

      if (linhasAtualizadas === 0) {
        return res.status(404).json({ sucesso: false, mensagem: "Ativo não encontrado" });
      }

      // Registrar log do sistema
      await db.execute(
        "INSERT INTO logs_sistema (id_usuario, acao, descricao) VALUES (?, ?, ?)",
        [req.usuario.id, "DELETAR_ATIVO", `Ativo deletado: ID ${id}`]
      );

      res.json({ sucesso: true, mensagem: "Ativo deletado com sucesso" });
    } catch (erro) {
      console.error("Erro ao deletar ativo:", erro);
      res.status(500).json({ sucesso: false, mensagem: "Erro ao deletar ativo" });
    }
  },

  // Listar ativos por setor
  listarPorSetor: async (req, res) => {
    try {
      const { setor } = req.params;

      if (!setor) {
        return res.status(400).json({ sucesso: false, mensagem: "Setor é obrigatório" });
      }

      const ativos = await ativoModel.buscarPorSetor(setor);
      res.json({ sucesso: true, dados: ativos });
    } catch (erro) {
      console.error("Erro ao listar ativos por setor:", erro);
      res.status(500).json({ sucesso: false, mensagem: "Erro ao listar ativos" });
    }
  }
};
