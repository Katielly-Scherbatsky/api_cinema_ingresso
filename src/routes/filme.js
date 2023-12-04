// Colocar as rotas referente ao recursos de filme
const express = require("express");
const filmeController = require("../controllers/filme.controller");

const router = express.Router();

router.get("/filme", filmeController.list);
router.get("/filme/:codigo", filmeController.show);
router.post("/filme", filmeController.create);
router.put("/filme/:codigo", filmeController.update);
router.delete("/filme/:codigo", filmeController.destroy);

// exports das configs;
module.exports = router;
