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
        const mensagem = encodeURIComponent("Email e senha são obrigatórios");
        return res.redirect(`/login?erro=${mensagem}`);
      }

      // Executa a função de busca no model
      const usuario = await usuarioModel.buscarPorEmail(email);
      
      // Se não existir, mensagem de erro
      if (!usuario) {
        const mensagem = encodeURIComponent("Credenciais inválidas");
        return res.redirect(`/login?erro=${mensagem}`);
      }

      // Verifica se o usuário está ativo
      if (usuario.status !== "ATIVO") {
        const mensagem = encodeURIComponent("Usuário inativo. Contacte o administrador");
        return res.redirect(`/login?erro=${mensagem}`);
      }

      // Compara a senha que o usuário digitou com a senha do banco
      const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
      
      // Se senhas não coincidirem, mensagem de erro
      if (!senhaValida) {
        const mensagem = encodeURIComponent("Credenciais inválidas");
        return res.redirect(`/login?erro=${mensagem}`);
      }

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
        return res.redirect("/painel");
      if (perfilNome === "Tecnico")
        return res.redirect("/tecnico");
      
    } catch (erro) {
      console.error("Erro no login:", erro);
      const mensagem = encodeURIComponent("Erro interno no servidor");
      res.redirect(`/login?erro=${mensagem}`);
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

  cadastrar: async (req, res) => { // async porque tem operações assíncronas dentro da função (bcrypt e model)
    
    try {
    // Pega as infomações das caixinhas da view, de acordo com o name delas
    const { nome, email, senha, id_perfil, status } = req.body;
    const perfilId = id_perfil ? parseInt(id_perfil, 10) : 2;
    const statusUsuario = status && (status === 'ATIVO' || status === 'INATIVO') ? status : 'ATIVO';

    // Permite criar administrador apenas se o usuário autenticado for administrador
    if (perfilId === 1) {
      let allowAdminCreate = false;
      if (req.cookies && req.cookies.token) {
        try {
          const dec = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
          if (dec.perfil && dec.perfil.toString().toLowerCase() === 'administrador') allowAdminCreate = true;
        } catch (e) {
          // token inválido, não permite
        }
      }
      if (!allowAdminCreate) {
        const mensagem = encodeURIComponent('Não é permitido criar usuários com perfil de administrador');
        return res.redirect(`/usuarios?erro=${mensagem}`);
      }
    }

        // Criptografa a senha antes de salvar no banco
        const senhaHash = await bcrypt.hash(senha, 10);

        // Chama o model passando as informações para criar o usuário (agora sem login)
        await usuarioModel.criarUsuario(nome, email, senhaHash, perfilId, statusUsuario);

        // Variável para definir para onde o usuário será redirecionado após criar o novo usuário
        let redirecionadoPara = "/login";
        // Verifica se o usuário que está criando o novo usuário é um administrador, para redirecionar ele para a tela de usuários, caso contrário, redireciona para a tela de login
        if(req.cookies && req.cookies.token) {
            try{
                // lê o token dos cookies e verifica ele, usando a mesma chave secreta que foi usada para criar o token
                const decodificado = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
                if (decodificado.perfil && decodificado.perfil.toString().toLowerCase() === "administrador") {
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
        const mensagem = encodeURIComponent("Erro interno no servidor");
        res.redirect(`/usuarios?erro=${mensagem}`);
        }
    },

    // Renderizar edição
    renderizarEdicao: async (req, res) => {
      try {
        const { id } = req.params;
        if (!id || isNaN(id)) {
          const mensagem = encodeURIComponent('ID inválido');
          return res.redirect(`/usuarios?erro=${mensagem}`);
        }

        const usuario = await usuarioModel.buscarPorId(id);
        if (!usuario) {
          const mensagem = encodeURIComponent('Usuário não encontrado');
          return res.redirect(`/usuarios?erro=${mensagem}`);
        }

        const perfis = await usuarioModel.listarPerfis();
        res.render('usuarios/editar', { usuario, perfis });
      } catch (erro) {
        console.error('Erro ao carregar edição:', erro);
        const mensagem = encodeURIComponent('Erro interno ao carregar edição');
        res.redirect(`/usuarios?erro=${mensagem}`);
      }
    },

    // Atualizar usuário
    atualizar: async (req, res) => {
      try {
        const { id } = req.params;
        const { nome, email, status, id_perfil, senha } = req.body;
        if (!id || isNaN(id)) {
          const mensagem = encodeURIComponent('ID inválido');
          return res.redirect(`/usuarios?erro=${mensagem}`);
        }

        if (senha && senha.trim() !== '' && senha.length < 6) {
          const mensagem = encodeURIComponent('A senha deve ter pelo menos 6 caracteres');
          return res.redirect(`/usuarios/editar/${id}?erro=${mensagem}`);
        }

        let senhaHash = null;
        if (senha && senha.trim() !== '') {
          senhaHash = await bcrypt.hash(senha, 10);
        }

        const perfilId = id_perfil && Number(id_perfil) ? Number(id_perfil) : 2;
        const linhas = await usuarioModel.atualizarUsuarioCompleto(id, nome, email, perfilId, status || 'ATIVO', senhaHash);
        if (linhas === 0) {
          const mensagem = encodeURIComponent('Usuário não encontrado');
          return res.redirect(`/usuarios?erro=${mensagem}`);
        }

        res.redirect('/usuarios');
      } catch (erro) {
        console.error('Erro ao atualizar usuário:', erro);
        const mensagem = encodeURIComponent('Erro interno ao atualizar usuário');
        res.redirect(`/usuarios?erro=${mensagem}`);
      }
    },

    // READ - LISTAR USUÁRIOS
    listar: async(req,res) => {
      try{
          // Se deu certo
          const [usuarios, perfis] = await Promise.all([
            usuarioModel.listarUsuarios(),
            usuarioModel.listarPerfis()
          ]);
          res.render('usuarios/listar', { usuarios, perfis })
      }
      catch(erro){
          // Se deu erro
          console.error('Erro ao listar usuários:', erro);
          const mensagem = encodeURIComponent("Erro ao listar usuários");
          res.redirect(`/?erro=${mensagem}`);
        }
    },

    // API - Obter dados do usuário em JSON
    obterDados: async (req, res) => {
      try {
        const { id } = req.params;
        if (!id || isNaN(id)) {
          return res.status(400).json({ erro: 'ID inválido' });
        }

        const usuario = await usuarioModel.buscarPorId(id);
        if (!usuario) {
          return res.status(404).json({ erro: 'Usuário não encontrado' });
        }

        res.json(usuario);
      } catch (erro) {
        console.error('Erro ao buscar dados do usuário:', erro);
        res.status(500).json({ erro: 'Erro ao buscar dados do usuário' });
      }
    },

    // POST - Desativar usuário (apenas admin)
    desativar: async (req, res) => {
      try {
        const { id } = req.params;
        if (!id || isNaN(id)) {
          const mensagem = encodeURIComponent('ID inválido');
          return res.redirect(`/usuarios?erro=${mensagem}`);
        }

        const linhas = await usuarioModel.desativarUsuario(id);
        if (linhas === 0) {
          const mensagem = encodeURIComponent('Usuário não encontrado');
          return res.redirect(`/usuarios?erro=${mensagem}`);
        }

        // Redireciona para a lista de usuários
        res.redirect('/usuarios');
      } catch (erro) {
        console.error('Erro ao desativar usuário:', erro);
        const mensagem = encodeURIComponent('Erro interno ao desativar usuário');
        res.redirect(`/usuarios?erro=${mensagem}`);
      }
    }

}


 


