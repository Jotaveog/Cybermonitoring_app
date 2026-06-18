// importação do módulo express
const express = require("express");
const router = express.Router();

// Importar o controller de ativos
const ativoController = require("../controllers/ativoController.js");

// Importar middlewares de autenticação
const { verificarAutenticacao } = require("../middlewares/authMiddlewares.js");

// ROTAS PÚBLICAS (sem autenticação)
// GET /ativos - Listar todos os ativos
router.get("/", ativoController.listar);

// GET /ativos/setor/:setor - Listar ativos por setor
router.get("/setor/:setor", ativoController.listarPorSetor);

// GET /ativos/:id - Obter ativo por ID
router.get("/:id", ativoController.obterPorId);

// ROTAS PROTEGIDAS (requer autenticação)
router.use(verificarAutenticacao);

// POST /ativos - Criar novo ativo
router.post("/", ativoController.criar);

// PUT /ativos/:id - Atualizar ativo
router.put("/:id", ativoController.atualizar);

// DELETE /ativos/:id - Deletar ativo
router.delete("/:id", ativoController.deletar);

module.exports = router;
