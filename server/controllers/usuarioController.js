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
    //Limpa o token dos cookies
    res.clearCookie("token");
    // Volta pra tela de login
    res.redirect("/login");
  },

  // CRUD
  // Criar Usuários

  renderizarCadastro: (req, res) => {
    res.render("usuarios/cadastro");
  },

  cadastrar: async (req, res) => { // async porque tem operações assíncronas dentro da função (bcrypt e model)
    
    try {
    // Pega as infomações das caixinhas da view, de acordo com o name delas
    const { nome, email, login, senha, id_perfil } = req.body;
    const perfilId = id_perfil ? parseInt(id_perfil, 10) : 2;

    if (perfilId === 1) // 1 representa o perfil de administrador
      return res
        .status(403)
        .render("erro", {
          mensagem:
            "Não é permitido criar usuários com perfil de administrador",
        });

        // Criptografa a senha antes de salvar no banco
        const senhaHash = await bcrypt.hash(senha, 10);

        // Chama o model passando as informações para criar o usuário
        await usuarioModel.criarUsuario(nome, email, login, senhaHash, perfilId);

        // Variável para definir para onde o usuário será redirecionado após criar o novo usuário
        let redirecionadoPara = "/login";
        // Verifica se o usuário que está criando o novo usuário é um administrador, para redirecionar ele para a tela de usuários, caso contrário, redireciona para a tela de login
        if(req.cookies && req.cookies.token) {
            try{
                // lê o token dos cookies e verifica ele, usando a mesma chave secreta que foi usada para criar o token
                const decodificado = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
                if (decodificado.perfil === "administrador") {
                    redirecionadoPara = "/usuarios";
            }
        }
        catch (erro) { // Se o token for inválido ou tiver expirado, ele cai aqui
            console.error("Erro ao verificar token:", erro);
        }
    }

    // Redireciona para a tela de login
    res.redirect(redirecionadoPara);

    } catch (erro) {
        console.error("Erro ao cadastrar usuário:", erro);
        res.status(500).render("erro", { mensagem: "Erro interno no servidor" });
        }
    },

    // READ - LISTAR USUÁRIOS
    listar: async(req,res) => {
      try{
          // Se deu certo
          const usuarios = await usuarioModel.listarUsuarios()
          res.render('usuarios/listar', { usuarios })
      }
      catch(erro){
          // Se deu erro
          res.status(500).render('erro', {mensagem: "Erro ao listar usuários"})
        }
    }
}

 
