// Colocar as rotas referente ao recursos de ingresso
const express = require("express");
const ingressoController = require("../controllers/ingresso.controller");

const router = express.Router();

router.get("/ingresso", ingressoController.list);
router.get("/ingresso/:codigo", ingressoController.show);
router.post("/ingresso", ingressoController.create);
router.put("/ingresso/:codigo", ingressoController.update);
router.delete("/ingresso/:codigo", ingressoController.destroy);

// exports das configs;
module.exports = router;
