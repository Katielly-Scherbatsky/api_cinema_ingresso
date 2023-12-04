// Colocar as rotas referente ao recursos de sala
const express = require("express");
const salaController = require("../controllers/sala.controller");

const router = express.Router();

router.get("/sala", salaController.list);
router.get("/sala/:codigo", salaController.show);
router.post("/sala", salaController.create);
router.put("/sala/:codigo", salaController.update);
router.delete("/sala/:codigo", salaController.destroy);

// exports das configs;
module.exports = router;
