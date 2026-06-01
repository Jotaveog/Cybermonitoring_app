//importação do módulo express
const express = require('express');
const router = express.Router();

//Rota de produtos genérica
router.get("/meus-produtos", (req, res) => {
  res.status(404).render('erro', {mensagem: "Essa pagina ainda não existe"});
});

//rota de saida
router.get("/vitrine", (req, res) => {
  res.status(404).render('erro', {mensagem: "Essa pagina ainda não existe"});
});

module.exports = router;