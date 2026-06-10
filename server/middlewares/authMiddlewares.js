const jwt = require('jsonwebtoken')

/**
 * Middleware: Verificar se o usuário está autenticado
 * Valida o token JWT nos cookies e redireciona para login se inválido
 */
function verificarAutenticacao(req, res, next) {
    const token = req.cookies?.token

    // Se não tiver token, redireciona para login
    if(!token){
        return res.redirect('/login')
    }
    
    try{
        // Verifica se o token é válido
        const dados = jwt.verify(token, process.env.JWT_SECRET)

        // Salva os dados do usuário na requisição
        req.usuario = dados

        // Disponibiliza dados do usuário no EJS
        res.locals.usuario = dados
        
        next()
    }
    catch(erro){
        // Token inválido ou expirado
        res.clearCookie('token')
        return res.redirect('/login')
    }
}

/**
 * Middleware: Apenas Administrador
 * Bloqueia acesso se o usuário não for administrador
 */
function somenteAdmin(req, res, next){
    const perfilUsuario = req.usuario.perfil.toLowerCase()
    
    if(perfilUsuario !== "administrador"){
        return res.status(403).render('erro', {
            mensagem: "Acesso negado: Somente administradores podem acessar esta área"
        })
    }
    next()
}

/**
 * Middleware: Apenas Técnico
 * Bloqueia acesso se o usuário não for técnico
 */
function somenteTenico(req, res, next){
    const perfilUsuario = req.usuario.perfil.toLowerCase()
    
    if(perfilUsuario !== "tecnico"){
        return res.status(403).render('erro', {
            mensagem: "Acesso negado: Somente técnicos podem acessar esta área"
        })
    }
    next()
}

module.exports = {
    verificarAutenticacao,
    somenteAdmin,
    somenteTenico
}