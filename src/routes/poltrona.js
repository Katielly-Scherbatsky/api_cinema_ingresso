// Colocar as rotas referente ao recursos de poltrona
// Importação de módulos
const express = require("express");
const poltronaController = require("../controllers/poltrona.controller");

// Criação do objeto router
const router = express.Router();

// Definição de rotas
router.get("/poltrona", poltronaController.list);
router.get("/poltrona/:codigo", poltronaController.show);
router.post("/poltrona", poltronaController.create);
router.put("/poltrona/:codigo", poltronaController.update);
router.delete("/poltrona/:codigo", poltronaController.destroy);

// Exportação do objeto router
module.exports = router;
