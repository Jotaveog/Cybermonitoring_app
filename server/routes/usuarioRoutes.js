// importação do módulo express
const express = require("express");
const router = express.Router();

// Importar o controller do usuario
const usuarioController = require("../controllers/usuarioController.js");

// Importar o middleware de autenticação
const {
  verificarAutenticacao,
  somenteAdmin,
} = require("../middlewares/authMiddlewares.js");
// Declaração das rotas do usuário
// ROTAS PÚBLICAS

// Importar o  multer
const upload = require("../config/multer.js");

// Envia os dados de login
router.post("/login", usuarioController.login);

// Rota de saida
router.get("/logout", usuarioController.logout);

// Rota de saida
router.get("/login", usuarioController.login);

// Rota de cadastro de usuários
// O multer, salva a imagem
router.post("/cadastrar", upload.single("foto"), usuarioController.cadastrar);

// ROTAS PRIVADAS
// Daqui pra baixo, só executa se tiver acesso para tal
router.use(verificarAutenticacao);
router.use(somenteAdmin);

// Obtém a lista de usuários
router.get("/", (req, res) => {
  res.status(200).render("usuarios/listar");
});
//Retornar a página de cadastro
router.get("/cadastro", (req, res) => {
  res.status(200).render("usuarios/cadastrar");
});

module.exports = router;