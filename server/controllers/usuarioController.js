// importação do model
const usuarioModel = require("../models/usuarioModel.js");

// importar pacotes
// para criptrograffia
const bcrypt = require("bcrypt");
// para lidar com cookies
const jwt = require("jsonwebtoken");


module.exports = {
  //FUNÇÕES DE LOGIN
  login: async (req, res) => {
    try {
      // Pega as infomações das caixinhas da view, de acordo com o name delas
      const { email, senha } = req.body;

      // Executa a função de busca no model
      const usuario = await usuarioModel.buscarPorEmail(email);
      // Se não existir, mensagem de erro
      if (!usuario)
        return res
          .status(404)
          .render("erro", { mensagem: "Credenciais inválidas" });

      // compara a senha que o usuário digitou, com a senha do usuario retornado no banco
      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      // Se senhas não coincidirem, mensagem de erro
      if (!senhaValida)
        return res
          .status(404)
          .render("erro", { mensagem: "Credenciais inválidas" });

      // Gera o token de acesso, contendo o perfil
      const token = jwt.sign(
        { id: usuario.id, perfil: usuario.perfil, nome: usuario.nome },
        process.env.JWT_SECRET,
        { expiresIn: "2h" },
      );

      // Guardar o token nos cookies do navegador
      res.cookie("token", token, { httpOnly: true });

      // Redirecionamento de acordo com o perfil
      if (usuario.perfil === "administrador") return res.redirect("/usuarios");
      if (usuario.perfil === "ofertante")
        return res.redirect("/produtos/meus-produtos");
      if (usuario.perfil === "interessado")
        return res.redirect("/produtos/vitrine");
    } catch (erro) {
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
    const { nome, email, senha, telefone, perfil } = req.body;

    if (perfil === "administrador")
      return res
        .status(403)
        .render("erro", {
          mensagem:
            "Não é permitido criar usuários com perfil de administrador",
        });

        // Multer salva a foto da pessoa na pasta uploads/usuarios, e o nome do arquivo fica disponível em req.file.filename
        const fotoDaPessoa = req.file ? `uploads/usuarios/${req.file.filename}` : null;


        // Criptografa a senha antes de salvar no banco
        const senhaHash = await bcrypt.hash(senha, 10);

        // Chama o model passando as informações para criar o usuário
        await usuarioModel.criarUsuario(nome, email, senhaHash, telefone, fotoDaPessoa, perfil);

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
    }
}
 
