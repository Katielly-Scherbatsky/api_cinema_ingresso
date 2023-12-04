// Colocar as rotas referente ao recursos de filme
// Importação de módulos
const express = require("express");
const filmeController = require("../controllers/filme.controller");

// Criação do objeto router
const router = express.Router();

// Definição de rotas
router.get("/filme", filmeController.list);
router.get("/filme/:codigo", filmeController.show);
router.post("/filme", filmeController.create);
router.put("/filme/:codigo", filmeController.update);
router.delete("/filme/:codigo", filmeController.destroy);

// Exportação do objeto router
module.exports = router;
