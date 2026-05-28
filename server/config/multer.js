// IMPORTAÇÃO DOS MODULOS
const multer = require("multer")
const path = require("path")
const fs = require('fs')

// CONFIGURAÇÃO DO diskStorage, LUGAR ONDE AS IMAGENS SERÃO ARMAZENADAS
const storage = multer.diskStorage({
    // DEFINIÇÃO DA PASTA DE DESTINO
    destination: (req, file, cb) => {
        // PASTA RESERVA PARA CASO DÊ ERRADO O LOCAL CERTO
        let pastaDestino = 'gerais'
        // DEPENDENDO DA ROTA QUE CHAMAR, ENCAMINHA A IMAGEM PARA A PASTA CORRETA
        if(req.originalUrl.includes('/usuarios')){
            pastaDestino = 'usuarios'
        }
        else if(req.originalUrl.includes('/produtos')){
            pastaDestino = 'produtos'
        }
        // VARIÁVEL QUE GUARDA O CAMINHO DA PASTA PRINCIPAL DE UPLOADS
        const uploadPath = path.join(__dirname, `../../client/public/uploads/${pastaDestino}`)
        // SE NÃO EXISTIR A PASTA, O NODE TENTA CRIAR COM O MÓDULO FS
        if (!fs.existsSync(uploadPath)){
        fs.mkdirSync(uploadPath, { recursive: true })
        }

        cb(null, uploadPath)
        },

        // FUNÇÃO PARA ALTERAR O NOME DO ARQUIVO
        filename: (req, file, cb) => {
        // PEGA A DATA ATUAL
        const timestamp = Date.now()
        // GERA UM NÚMERO ALEATORIO
        const numeroAleatorio = Math.round(Math.random() * 1E9)
        // PEGA A EXTENSÃO DO ARQUIVO
        const extensaoDoArquivo = path. extname(file.originalname)
        // VARIÁVEL COM O NOME FINAL DO ARQUIVO, JÁ COM AS ALTERAÇÕES PARA EVITAR DUPLICATAS
        const nomeFinalSeguro = `${timestamp}-${numeroAleatorio}${extensaoDoArquivo}`
        // FUNÇÃO DE CALLBACK, NULL DIZ QUE NÃO HOUVE ERRO NENHUM, E RETORNA O NOME PARA A IMAGEM
        cb(null, nomeFinalSeguro)
    }
})

const upload = multer({ storage: storage })


module.exports = upload;