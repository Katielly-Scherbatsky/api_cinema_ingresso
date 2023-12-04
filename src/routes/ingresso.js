// Colocar as rotas referente ao recursos de ingresso
// Importação de módulos
const express = require("express");
const ingressoController = require("../controllers/ingresso.controller");

// Criação do objeto router
const router = express.Router();

// Definição de rotas
router.get("/ingresso", ingressoController.list);
router.get("/ingresso/:codigo", ingressoController.show);
router.post("/ingresso", ingressoController.create);
router.put("/ingresso/:codigo", ingressoController.update);
router.delete("/ingresso/:codigo", ingressoController.destroy);

// Exportação do objeto router
module.exports = router;
