// importação e uso do módulo express
const express = require("express");
const app = express();
// módulo do node para lidar com caminho de arquivos
const path = require("path");

// Importa o módulo do dotenv, lê o arquivo .env, e já configura inicialmente
require('dotenv').config()

// Define a porta do servidor com base nas variáveis de ambiente
// Se der errado, e porte será a 5000
const port = process.env.PORT || 5000;

// MIDDLEWARE PARA ENTENDER O JSON
// Lê os dados em JSON
app.use(express.json()) 
// Servidor está apto a ler os dados dos formulário
app.use(express.urlencoded({ extended: true })) 
// Permite ler cookies e alterar também
app.use(require('cookie-parser')())

// CONFIGURAÇÃO DO EJS E PASTAS DO FRONT END
// Define o EJS como engine do front
app.set("view engine", "ejs");
// Aponta para o express e ejs onde estão as páginas
app.set("views", path.join(__dirname, "../client/views"));
// Deixa a pasta public acessível ao usuário
app.use(express.static(path.join(__dirname, "../client/public")));

// ROTAS PÚBLICAS
// Criação de rotas padrão
app.get("/", (req, res) => {
  // Redireciona pra tela de login
  res.status(200).redirect("/login");
});

//Rota que retorna a página de login
app.get("/login", (req, res) => {
  res.render('auth/login');
});

// Rota que retorna a página de cadastro de usuário
app.get("/cadastro", (req, res) => {
  res.render('auth/cadastro');
});

// IMPORTAR MIDDLEWARES
const { verificarAutenticacao } = require("./middlewares/authMiddlewares.js");

// ROTAS PROTEGIDAS DOS DASHBOARDS
app.get("/dashboard/admin", verificarAutenticacao, (req, res) => {
  res.render('dashboard/administrador/index');
});

app.get("/dashboard/tecnico", verificarAutenticacao, (req, res) => {
  res.render('dashboard/tecnico/index');
});

// Rota do Painel
app.get("/painel", verificarAutenticacao, async (req, res) => {
  try {
    // Importar model de ativos
    const db = require("./config/db.js");
    
    // Buscar total de ativos
    const [ativos] = await db.execute("SELECT COUNT(*) as total FROM ativos WHERE status_cadastro = 'ATIVO'");
    const totalAtivos = ativos[0].total;
    
    // Buscar contagem por status de monitoramento
    const [statusMonitor] = await db.execute(`
      SELECT 
        COUNT(CASE WHEN status_monitoramento = 'NORMAL' THEN 1 END) as otimo,
        COUNT(CASE WHEN status_monitoramento = 'ATENCAO' THEN 1 END) as atencao,
        COUNT(CASE WHEN status_monitoramento = 'CRITICO' THEN 1 END) as critico
      FROM monitoramentos
      WHERE data_coleta >= DATE_SUB(NOW(), INTERVAL 1 DAY)
    `);
    
    const stats = statusMonitor[0];
    
    // Buscar ativos por setor
    const [setoresData] = await db.execute(`
      SELECT setor as nome, COUNT(*) as q 
      FROM ativos 
      WHERE status_cadastro = 'ATIVO' AND setor IS NOT NULL
      GROUP BY setor
    `);
    
    // Buscar últimos eventos de monitoramento
    const [eventosData] = await db.execute(`
      SELECT 
        DATE_FORMAT(m.data_coleta, '%Y-%m-%d %H:%i:%S') as dt,
        a.nome_maquina as host,
        CONCAT('CPU: ', m.uso_cpu, '% | Memória: ', m.uso_memoria, '%') as info
      FROM monitoramentos m
      JOIN ativos a ON m.id_ativo = a.id_ativo
      ORDER BY m.data_coleta DESC
      LIMIT 5
    `);
    
    res.render('admin/painel', {
      totalAtivos: totalAtivos,
      otimo: stats.otimo || 0,
      atencao: stats.atencao || 0,
      critico: stats.critico || 0,
      setores: setoresData || [],
      eventos: eventosData || []
    });
  } catch (erro) {
    console.error("Erro ao carregar painel:", erro);
    res.render('admin/painel', {
      totalAtivos: 0,
      otimo: 0,
      atencao: 0,
      critico: 0,
      setores: [],
      eventos: []
    });
  }
});

// Rota para Gerenciar Computadores
app.get("/gerenciar-computadores", verificarAutenticacao, (req, res) => {
  res.render('admin/gerenciarPc', { usuario: req.session.user });
});

//Importar as rotas de usuário
const usuariosRoutes = require("./routes/usuarioRoutes.js");
// Requisições comecando com /usuarios é gerenciada pelo sub-arquivo de rotas
app.use("/usuarios", usuariosRoutes);

// Importar as rotas de produtos
const produtosRoutes = require("./routes/produtosRoutes.js")
// Requisições começando com /produtos é gerenciada pelo sub-arquivo de rotas
app.use("/produtos", produtosRoutes);


// //Função para subir o servidor
// app.listen(port, () => {
//   console.log(`Servidor ativo na porta: ${port}`);
//   console.log(`Link: http://localhost:${port}`);
// });

// Traz as configurações do banco
const pool = require("./config/db.js");
//Cria uma conexão teste com o banco
(async () => {
  try {
    // Se o banco de dados estiver ativo, ai sim o servidor será iniciado
    await pool.getConnection();
    console.log("Banco conectado");
    // Se o banco de dados estiver ativo, ai sim o servidor será iniciado
    app.listen(port, () => {
      console.log(`Link: http://localhost:${port}`);
      console.log(`Servidor funcionando na porta ${port}`);
    });
  } catch (erro) {
    // Se deu erro, avisa e encerra a tentativa
    console.log("Erro ao tentar conectar com o banco de dados");
    process.exit(1);
  }
})();
