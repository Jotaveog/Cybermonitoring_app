const express = require('express');
const router = express.Router();

// Rotas mínimas de produtos (placeholder)
router.get('/', (req, res) => {
  res.send('Rota de produtos - placeholder');
});

module.exports = router;
