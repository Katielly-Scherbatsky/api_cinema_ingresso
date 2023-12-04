// Colocar as rotas referente ao recursos de poltrona
const express = require("express");
const poltronaController = require("../controllers/poltrona.controller");

const router = express.Router();

router.get("/poltrona", poltronaController.list);
router.get("/poltrona/:codigo", poltronaController.show);
router.post("/poltrona", poltronaController.create);
router.put("/poltrona/:codigo", poltronaController.update);
router.delete("/poltrona/:codigo", poltronaController.destroy);

// exports das configs;
module.exports = router;
