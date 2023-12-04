// Colocar as rotas referente ao recursos de sala
// Importação de módulos
const express = require("express");
const salaController = require("../controllers/sala.controller");

// Criação do objeto router
const router = express.Router();

// Definição de rotas
router.get("/sala", salaController.list);
router.get("/sala/:codigo", salaController.show);
router.post("/sala", salaController.create);
router.put("/sala/:codigo", salaController.update);
router.delete("/sala/:codigo", salaController.destroy);

// Exportação do objeto router
module.exports = router;
