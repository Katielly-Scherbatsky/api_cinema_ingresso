// Colocar as rotas referente ao recursos de venda
// Importação de módulos
const express = require("express");
const vendaController = require("../controllers/venda.controller");

// Criação do objeto router
const router = express.Router();

// Definição de rotas
router.get("/venda", vendaController.list);
router.get("/venda/:codigo", vendaController.show);
router.post("/venda", vendaController.create);
router.put("/venda/:codigo", vendaController.update);
router.delete("/venda/:codigo", vendaController.destroy);

// Exportação do objeto router
module.exports = router;
