// Colocar as rotas referente ao recursos de cliente
// Importação de módulos
const express = require("express");
const clienteController = require("../controllers/cliente.controller");

// Criação do objeto router
const router = express.Router();

// Definição de rotas
router.get("/cliente", clienteController.list);
router.get("/cliente/:codigo", clienteController.show);
router.post("/cliente", clienteController.create);
router.put("/cliente/:codigo", clienteController.update);
router.delete("/cliente/:codigo", clienteController.destroy);

// Exportação do objeto router
module.exports = router;
