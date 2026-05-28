const jwt = require('jsonwebtoken')

// Verifica se existe algum token
function verificarAutenticacao(req, res, next) {
    
    const token = req.cookies?.token

    // Se não tiver, já redireciona o usuário para a tela de login
    if(!token){
        return res.redirect('/login')
    }
    
    try{
        // Verifica se o token é válido ou não
        const dados = jwt.verify(token, process.env.JWT_SECRET)

        // Salva o usuário no backend, para todos terem acesso
        req.usuario = dados

        // Variável global para o EJS ter acesso as informações do usuário logado
        res.locals.usuario = dados
        
        // Deixa o usuário prosseguir
        next()
    }
    catch(erro){
        res.clearCookie('token') // Apaga o token inválido
        return res.redirect('/login') // Vai pra tela de login
    }
}

// FILTROS POR PERFIL
// Apenas adm
function somenteAdmin(req,res, next){
    if(req.usuario.perfil !== "administrador"){
        return res.status(403).render('erro', {mensagem: "Acesso negado: Somente administradores" })
    }
    next()
}

function somenteOfertante(req,res, next){
    if(req.usuario.perfil !== "administrador" && req.usuario.perfil !== "ofertante"){
        return res.status(403).render('erro', {mensagem: "Acesso negado: Área para administradores e ofertantes" })
        
    }
    next()
}

// Apenas interessados
function somenteInteressado(req,res, next){
    if(req.usuario.perfil !== "interessado"){
        return res.status(403).render('erro', {mensagem: "Acesso negado: Área exclusiva para interessados" })
    }
    next()
}

// Área para interessados e ofertantes
function usuariosComuns(req, res, next){
    if(req.usuario.perfil !== "interessado" && req.usuario.perfil !== "ofertante"){
        return res.status(403).render('erro', {mensagem: "Acesso negado"})
    }
    next()
}

module.exports = {
    verificarAutenticacao,
    somenteAdmin,
    somenteInteressado,
    somenteOfertante,
    usuariosComuns
}