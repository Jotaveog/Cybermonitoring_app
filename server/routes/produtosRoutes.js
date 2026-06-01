// Importação do módulo express
const express = require("express");
const router = express.Router();

// Rota de produtor genérica
router.get("/meus-produtos", (req,res) => { res.status(404).render('erro', { mensagem: "Essa página ainda não existe"})})

// Rota de saida
router.get("/vitrine", (req,res) => {res.status(404).render('erro', { mensagem: "Essa página ainda não existe"})})


module.exports = router