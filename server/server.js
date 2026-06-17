/**
 * ========================================
 * CYBERMONITORING - SERVER.JS
 * Sistema de Monitoramento de TI
 * ========================================
 * Arquivo principal do servidor Express
 * Responsável por: middleware, rotas públicas, inicialização
 */

// Importações essenciais
const express = require("express");
const path = require("path");
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Inicializar app Express
const app = express();
const port = process.env.PORT || 5000;

// ========================================
// MIDDLEWARES GLOBAIS
// ========================================

// Middleware para parsear JSON e formulários
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(require('cookie-parser')());

// ========================================
// CONFIGURAÇÃO DE VIEWS E ARQUIVOS ESTÁTICOS
// ========================================

// Configurar EJS como template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../client/views"));

// Servir arquivos estáticos (CSS, JS, imagens)
app.use(express.static(path.join(__dirname, "../client/public")));

// ========================================
// ROTAS PÚBLICAS
// ========================================

// Rota raiz - redireciona para login
app.get("/", (req, res) => {
  res.redirect("/login");
});

// Rota de login
app.get("/login", (req, res) => {
  res.render('auth/login');
});

// Rota de cadastro
app.get("/cadastro", (req, res) => {
  res.render('auth/cadastro');
});

// ========================================
// MIDDLEWARES DE AUTENTICAÇÃO
// ========================================

const { verificarAutenticacao, somenteAdmin, somenteTenico } = require("./middlewares/authMiddlewares.js");

// ========================================
// ROTAS PROTEGIDAS - DASHBOARDS
// ========================================

const dashboardController = require("./controllers/dashboardController.js");

// Dashboard Admin
app.get("/painel", verificarAutenticacao, somenteAdmin, dashboardController.dashboardAdmin);
app.get("/dashboard/admin", verificarAutenticacao, somenteAdmin, dashboardController.dashboardAdmin);

// Dashboard Técnico
app.get("/tecnico", verificarAutenticacao, somenteTenico, dashboardController.dashboardTecnico);
app.get("/dashboard/tecnico", verificarAutenticacao, somenteTenico, dashboardController.dashboardTecnico);

// Gerenciador de Computadores (Admin)
app.get("/gerenciar-computadores", verificarAutenticacao, somenteAdmin, dashboardController.gerenciarComputadoresAdmin);
app.get("/admin/gerenciar-computadores", verificarAutenticacao, somenteAdmin, dashboardController.gerenciarComputadoresAdmin);

// Gerenciador de Computadores (Técnico)
app.get("/tecnico/gerenciar-computadores", verificarAutenticacao, somenteTenico, dashboardController.gerenciarComputadoresTecnico);

// Relatórios (Técnico)
app.get("/tecnico/relatorios", verificarAutenticacao, somenteTenico, dashboardController.relatorios);

// ========================================
// ROTAS MODULARES
// ========================================

// Rotas de Usuários (login, cadastro, gerenciar)
const usuariosRoutes = require("./routes/usuarioRoutes.js");
app.use("/usuarios", usuariosRoutes);

// Rotas de Ativos (CRUD principal do sistema)
const ativoRoutes = require("./routes/ativoRoutes.js");
app.use("/ativos", ativoRoutes);


// ========================================
// INICIALIZAÇÃO DO SERVIDOR
// ========================================

const pool = require("./config/db.js");

(async () => {
  try {
    // Testa conexão com banco de dados
    await pool.getConnection();
    console.log("✓ Banco de dados conectado");

    // Inicia servidor Express
    app.listen(port, () => {
      console.log("========================================");
      console.log("   CYBERMONITORING - SERVIDOR ATIVO");
      console.log(`   Porta: ${port}`);
      console.log(`   URL: http://localhost:${port}`);
      console.log("========================================");
    });
  } catch (erro) {
    console.error("✗ Erro ao conectar com o banco de dados:", erro.message);
    process.exit(1);
  }
})();
