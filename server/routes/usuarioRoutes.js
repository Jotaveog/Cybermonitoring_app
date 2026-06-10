// importação do módulo express
const express = require("express");
const router = express.Router();

// Importar o controller do usuario
const usuarioController = require("../controllers/usuarioController.js")

// Importar o multer
const upload = require("../config/multer.js")

// Importar o middleware de autenticação
const { verificarAutenticacao, somenteAdmin } = require("../middlewares/authMiddleware.js")

// Declaração das rotas do usuário
// ROTAS PÚBLICAS
// Envia os dados de login
router.post("/login", usuarioController.login)

// Rota de saida
router.get("/logout", usuarioController.logout)

// Rota de cadastro de usuário
// O multer, salva a imagem primeiro, através do upload.single, depois chama o controller
router.post('/cadastrar', upload.single('foto'), usuarioController.cadastrar )

// ROTAS PRIVADAS
// Daqui pra baixo, só executa se tiver acesso para tal
router.use(verificarAutenticacao)
router.use(somenteAdmin)

// CRUD
// READ - LISTAR USUÁRIOS
// Obtém a lista de usuários
router.get("/", usuarioController.listar);

// CREATE - CRIR USUÁRIOS
// Retornar a página de cadastro
router.get("/cadastro", usuarioController.renderizarCadastro);

//DELETE - DELETAR USUÁRIOS
router.post("/deletar/:id", usuarioController.deletar)

// UPDATE - ATUALIZAR USUÁRIOS
router.get("/editar/:id", usuarioController.editar)

//UPDATE - ATUALIZAR INFORMAÇÕES USUÁRIOS

router.post("/atualizar/:id", upload.single('foto'), usuarioController.atualizarUsuario)
module.exports = router