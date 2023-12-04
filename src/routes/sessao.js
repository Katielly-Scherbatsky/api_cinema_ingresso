// Colocar as rotas referente ao recursos de sessao
// Importação de módulos
const express = require("express");
const sessaoController = require("../controllers/sessao.controller");

// Criação do objeto router
const router = express.Router();

// Definição de rotas
router.get("/sessao", sessaoController.list);
router.get("/sessao/:codigo", sessaoController.show);
router.post("/sessao", sessaoController.create);
router.put("/sessao/:codigo", sessaoController.update);
router.delete("/sessao/:codigo", sessaoController.destroy);

// Exportação do objeto router
module.exports = router;
