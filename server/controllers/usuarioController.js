// importação do model
const usuarioModel = require("../models/usuarioModel.js")

// importar pacotes
// para criptrograffia
const bcrypt = require('bcrypt')
// para lidar com cookies
const jwt = require('jsonwebtoken')

module.exports = {
    //FUNÇÕES DE LOGIN
    login: async (req, res) => {
        try {
            // Pega as infomações das caixinhas da view, de acordo com o name delas
            const { email, senha } = req.body

            // Executa a função de busca no model
            const usuario = await usuarioModel.buscarPorEmail(email)
            // Se não existir, mensagem de erro
            if (!usuario) return res.status(404).render('erro', { mensagem: "Credenciais inválidas" })

            // compara a senha que o usuário digitou, com a senha do usuario retornado no banco
            const senhaValida = await bcrypt.compare(senha, usuario.senha)
            // Se senhas não coincidirem, mensagem de erro
            if (!senhaValida) return res.status(404).render('erro', { mensagem: "Credenciais inválidas" })

            // Gera o token de acesso, contendo o perfil 
            const token = jwt.sign(
                { id: usuario.id, perfil: usuario.perfil, nome: usuario.nome },
                process.env.JWT_SECRET,
                { expiresIn: '2h' }
            )

            // Guardar o token nos cookies do navegador
            res.cookie('token', token, { httpOnly: true })

            // Redirecionamento de acordo com o perfil
            if (usuario.perfil === "administrador") return res.redirect("/usuarios")
            if (usuario.perfil === "ofertante") return res.redirect("/produtos/meus-produtos")
            if (usuario.perfil === "interessado") return res.redirect("/produtos/vitrine")
        }
        catch (erro) {
            res.status(500).render('erro', { mensagem: "Erro interno no servidor" })
        }
    },

    logout: (req, res) => {
        //Limpa o token dos cookies
        res.clearCookie('token')
        // Volta pra tela de login
        res.redirect("/login")
    },

    // CRUD
    // CRIAR USUÁRIOS
    renderizarCadastro: (req, res) => {
        res.render('usuarios/cadastrar')
    },

    cadastrar: async (req, res) => {
        try {
            // Objeto com as informações preenchidas nos inputs
            const { nome, email, senha, telefone, perfil } = req.body

            // Não deixa o usuário cadastrar um adm
            if (perfil === 'administrador') {
                return res.status(403).render('erro', { mensagem: "Você não possui acesso" })
            }

            // Multer salva a imagem na pasta, e a variável guarda o nome dela caso o usuário tenha anexado uma imagem
            const fotoDaPessoa = req.file ? `uploads/usuarios/${req.file.filename}` : null

            // Criptrografa a senha do usuario
            const senhaHash = await bcrypt.hash(senha, 10)

            // Chama o model passando as informações já corrigidas
            await usuarioModel.criarUsuario(nome, email, senhaHash, telefone, fotoDaPessoa, perfil)

            // Variável pra guardar onde tem de redirecionar o usuário
            let redirecionadoPara = '/login'
            // Verifica se já tem alguém logado, analisando se há algum token salvo
            if (req.cookies && req.cookies.token) {
                try {
                    // Lê o token, e se o usuário atual for um adm, redireciona para tela geral dos adm
                    const decodificado = jwt.verify(req.cookies.token, process.env.JWT_SECRET)
                    if (decodificado.perfil === 'administrador') {
                        redirecionadoPara = '/usuarios'
                    }
                }
                catch (erro) {
                    // Segue o jogo indo pra login mesmo
                }
            }
            // Ao fim, redireciona o usuário pra onde ele tem que ir, /login ou /usuarios 
            res.redirect(redirecionadoPara)
        }
        catch (erro) {
            console.error(erro)
            res.status(500).render('erro',
                { mensagem: "Erro ao cadastrar usuário" })
        }
    },
    //READ - LISTAR USUÁRIOS
    listar: async (req, res) => {
        try {
            // Se deu certo, mostra a página de usuários
            const usuarios = await usuarioModel.listarUsuarios()
            // Renderiza a tela de usuários, passando o objeto com a lista completa 
            res.render('usuarios/listar2', { usuarios })
        }
        catch (erro) {
            //Se deu erro, mostra a tela de erro padrão para pessoa 
            res.status(500).render('erro', { mensagem: "Erro ao listar usuários" })
        }
    },
    //DELETE - DELETAR USUÁRIOS
    deletar: async (req, res) => {
        try {
            const idVindoDaURL = req.params.id
            await usuarioModel.deletarUsuario(idVindoDaURL)
            res.redirect('/usuarios')
        }
        catch (erro) {
            res.status(500).render('erro', { mensagem: "Erro ao deletar usuário" })
        }

    },
    // UPDATE - ATUALIZAR UM USUÁRIO COM BASE NO ID
    // RENDERIZA A PÁGINA DE CADASTRO
    editar: async (req, res) => {
        try {

            // Busca o id do usuário, vindo da url da requisição, através do req.params
            // Exemplo: editar/5 <- o 5 é o id do indivíduo
            const idVindoDaUrl = req.params.id

            // Chama o model para buscar as informações
            const usuarioEditado = await usuarioModel.buscarPorId(idVindoDaUrl)

            // renderiza a página de editar, já com o formulário preenchido com as informações
            res.render('usuarios/editar', { usuarioEditado })

        }
        catch (erro) {
            res.status(500).render('erro', { mensagem: "Erro ao abrir tela de edição" })
        }
    },

    // ATUALIZA O USUÁRIO COM AS NOVAS INFORMAÇÕES
    atualizarUsuario: async (req, res) => {
        try {

            // Busca o id do usuário, vindo da url da requisição, através do req.params
            // Exemplo: editar/5 <- o 5 é o id do indivíduo
            const idVindoDaUrl = req.params.id

            // Cria um objeto com as informações das caixinhas
            const { nome, email, senha, telefone, perfil } = req.body

            // Resgata o caminho da foto, vindo do multer
            const fotoDaPessoa = req.file ? `/uploads/usuarios/${req.file.filename}` : null

            // Parte da senha, caso necessário
            let senhaHash
            if (senha && senha.trim() !== '') {
                // Se o campo senha estiver preenchido, criptografa a nova senha
                senhaHash = await bcrypt.hash(senha, 10)
            }
            else {
                // Se o campo senha estiver em branco, deixa a mesma que tava antes
                const usuarioAntigo = await usuarioModel.buscarPorId(idVindoDaUrl)
                senhaHash = usuarioAntigo.senha
            }


            //Chamar o model, e atualizar o usuario
            await usuarioModel.atualizarUsuario(idVindoDaUrl, nome, email, senhaHash, telefone, fotoDaPessoa, perfil)
            //Redirecionar para a tela de usuários
            res.redirect('/usuarios')

        }
        catch (erro) {
            res.status(500).render('erro', { mensagem: "Erro ao atualizar usuário" })
        }

    }
}