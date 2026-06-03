// importação do model
const usuarioModel = require("../models/usuarioModel.js");

// importar pacotes
// para criptografia
const bcrypt = require("bcrypt");
// para lidar com cookies
const jwt = require("jsonwebtoken");
// para registrar logs do sistema
const db = require("../config/db.js");


module.exports = {
  //FUNÇÕES DE LOGIN
  login: async (req, res) => {
    try {
      // Pega as informações das caixinhas da view
      const { email, senha } = req.body;

      // Valida campos obrigatórios
      if (!email || !senha) {
        return res
          .status(400)
          .render("erro", { mensagem: "Email e senha são obrigatórios" });
      }

      // Executa a função de busca no model
      const usuario = await usuarioModel.buscarPorEmail(email);
      
      // Se não existir, mensagem de erro
      if (!usuario)
        return res
          .status(404)
          .render("erro", { mensagem: "Credenciais inválidas" });

      // Verifica se o usuário está ativo
      if (usuario.status !== "ATIVO") {
        return res
          .status(403)
          .render("erro", { mensagem: "Usuário inativo. Contacte o administrador" });
      }

      // Compara a senha que o usuário digitou com a senha do banco
      const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
      
      // Se senhas não coincidirem, mensagem de erro
      if (!senhaValida)
        return res
          .status(404)
          .render("erro", { mensagem: "Credenciais inválidas" });

      // Busca o nome do perfil
      const perfilNome = usuario.nome_perfil || "Tecnico";

      // Gera o token de acesso, contendo o perfil e nome
      const token = jwt.sign(
        { 
          id: usuario.id_usuario, 
          perfil: perfilNome, 
          nome: usuario.nome,
          id_perfil: usuario.id_perfil
        },
        process.env.JWT_SECRET,
        { expiresIn: "2h" },
      );

      // Guardar o token nos cookies do navegador
      res.cookie("token", token, { httpOnly: true });

      // Atualizar último acesso
      await usuarioModel.atualizarUltimoAcesso(usuario.id_usuario);

      // Registrar login nos logs do sistema
      await db.query(
        "INSERT INTO logs_sistema (id_usuario, acao, descricao, ip_origem) VALUES (?, ?, ?, ?)",
        [usuario.id_usuario, "LOGIN", "Acesso realizado com sucesso", req.ip || "127.0.0.1"]
      );

      // Redirecionamento de acordo com o perfil
      if (perfilNome === "Administrador") 
        return res.redirect("/dashboard/admin");
      if (perfilNome === "Tecnico")
        return res.redirect("/dashboard/tecnico");
      
    } catch (erro) {
      console.error("Erro no login:", erro);
      res.status(500).render("erro", { mensagem: "Erro interno no servidor" });
    }
  },


  logout: (req, res) => {
    try {
      // Registrar logout nos logs do sistema
      const usuarioId = req.usuario?.id;
      if (usuarioId) {
        db.query(
          "INSERT INTO logs_sistema (id_usuario, acao, descricao, ip_origem) VALUES (?, ?, ?, ?)",
          [usuarioId, "LOGOUT", "Desconexão realizada", req.ip || "127.0.0.1"]
        ).catch(err => console.error("Erro ao registrar logout:", err));
      }

      // Limpa o token dos cookies
      res.clearCookie("token");
      
      // Volta pra tela de login
      res.redirect("/login");
    } catch (erro) {
      console.error("Erro no logout:", erro);
      res.redirect("/login");
    }
  },


  // CRUD - CRIAR USUÁRIOS
  renderizarCadastro: (req, res) => {
    res.render("auth/cadastro");
  },

  cadastrar: async (req, res) => {
    try {
      // Pega as informações do formulário
      const { nome, email, login, senha, id_perfil } = req.body;

      // Validações básicas
      if (!nome || !email || !login || !senha) {
        return res
          .status(400)
          .render("erro", { mensagem: "Todos os campos são obrigatórios" });
      }

      // Validar tamanho mínimo da senha
      if (senha.length < 6) {
        return res
          .status(400)
          .render("erro", { mensagem: "A senha deve ter no mínimo 6 caracteres" });
      }

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res
          .status(400)
          .render("erro", { mensagem: "Email inválido" });
      }

      // Verificar se email já existe
      const usuarioExistente = await usuarioModel.buscarPorEmail(email);
      if (usuarioExistente) {
        return res
          .status(400)
          .render("erro", { mensagem: "Email já cadastrado no sistema" });
      }

      // Verificar se login já existe
      const loginExistente = await usuarioModel.buscarPorLogin(login);
      if (loginExistente) {
        return res
          .status(400)
          .render("erro", { mensagem: "Login já cadastrado no sistema" });
      }

      // Se é auto-cadastro (sem token), atribuir perfil de Técnico (id 2)
      let perfilId = 2; // Técnico é o perfil padrão
      
      // Se tem token, verificar se é admin e permitir escolha de perfil
      if (req.cookies && req.cookies.token) {
        try {
          const decodificado = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
          
          // Apenas admin pode criar usuários com perfil específico
          if (decodificado.perfil === "Administrador" && id_perfil) {
            perfilId = parseInt(id_perfil, 10);
            
            // Não permitir criar admin via interface
            if (perfilId === 1) {
              return res
                .status(403)
                .render("erro", {
                  mensagem: "Não é permitido criar usuários com perfil de Administrador",
                });
            }
          }
        } catch (erro) {
          console.error("Erro ao verificar token no cadastro:", erro);
          perfilId = 2; // Fallback para Técnico
        }
      }

      // Criptografa a senha antes de salvar no banco
      const senhaHash = await bcrypt.hash(senha, 10);

      // Chama o model passando as informações para criar o usuário
      const novoUsuario = await usuarioModel.criarUsuario(
        nome, 
        email, 
        login, 
        senhaHash, 
        perfilId
      );

      // Registrar criação de usuário nos logs
      if (req.usuario?.id) {
        await db.query(
          "INSERT INTO logs_sistema (id_usuario, acao, descricao, ip_origem) VALUES (?, ?, ?, ?)",
          [
            req.usuario.id, 
            "CRIAR_USUARIO", 
            `Novo usuário criado: ${email}`, 
            req.ip || "127.0.0.1"
          ]
        ).catch(err => console.error("Erro ao registrar criação:", err));
      }

      // Variável para definir para onde o usuário será redirecionado
      let redirecionadoPara = "/login";
      
      // Se foi um admin que criou, redirecionar para a página de usuários
      if (req.usuario?.perfil === "Administrador") {
        redirecionadoPara = "/usuarios";
      }

      // Redireciona
      res.redirect(redirecionadoPara);

    } catch (erro) {
      console.error("Erro ao cadastrar usuário:", erro);
      res.status(500).render('erro', { mensagem: "Erro ao cadastrar usuário" });
    }
  },

  // READ - LISTAR USUÁRIOS (apenas para admin)
  listar: async (req, res) => {
    try {
      // Busca todos os usuários do sistema
      const usuarios = await usuarioModel.listarUsuarios();
      
      res.render("usuarios/listar", { usuarios });
    }
    catch (erro) {
      console.error("Erro ao listar usuários:", erro);
      res.status(500).render('erro', { mensagem: "Erro ao listar usuários" });
    }
  },

  // UPDATE - ATUALIZAR USUÁRIO
  atualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const { nome, email, status } = req.body;

      // Validações
      if (!nome || !email || !status) {
        return res
          .status(400)
          .render("erro", { mensagem: "Nome, email e status são obrigatórios" });
      }

      // Validar status
      if (!["ATIVO", "INATIVO"].includes(status)) {
        return res
          .status(400)
          .render("erro", { mensagem: "Status inválido" });
      }

      // Atualizar usuário
      await usuarioModel.atualizarUsuario(id, nome, email, status);

      // Registrar ação nos logs
      await db.query(
        "INSERT INTO logs_sistema (id_usuario, acao, descricao, ip_origem) VALUES (?, ?, ?, ?)",
        [
          req.usuario.id, 
          "ATUALIZAR_USUARIO", 
          `Usuário ID ${id} atualizado`, 
          req.ip || "127.0.0.1"
        ]
      ).catch(err => console.error("Erro ao registrar atualização:", err));

      res.redirect('/usuarios');
    }
    catch (erro) {
      console.error("Erro ao atualizar usuário:", erro);
      res.status(500).render('erro', { mensagem: "Erro ao atualizar usuário" });
    }
  },

  // DELETE - DELETAR USUÁRIOS (apenas para admin)
  deletar: async (req, res) => {
    try {
      const idVindoDaURL = req.params.id;

      // Verificar se não é o próprio usuário
      if (parseInt(idVindoDaURL) === req.usuario.id) {
        return res
          .status(403)
          .render("erro", { mensagem: "Você não pode deletar sua própria conta" });
      }

      await usuarioModel.deletarUsuario(idVindoDaURL);

      // Registrar ação nos logs
      await db.query(
        "INSERT INTO logs_sistema (id_usuario, acao, descricao, ip_origem) VALUES (?, ?, ?, ?)",
        [
          req.usuario.id, 
          "DELETAR_USUARIO", 
          `Usuário ID ${idVindoDaURL} deletado`, 
          req.ip || "127.0.0.1"
        ]
      ).catch(err => console.error("Erro ao registrar deleção:", err));

      res.redirect('/usuarios');
    }
    catch (erro) {
      console.error("Erro ao deletar usuário:", erro);
      res.status(500).render('erro', { mensagem: "Erro ao deletar usuário" });
    }
  }

}