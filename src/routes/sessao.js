// Colocar as rotas referente ao recursos de sessao
const express = require("express");
const sessaoController = require("../controllers/sessao.controller");

const router = express.Router();

router.get("/sessao", sessaoController.list);
router.get("/sessao/:codigo", sessaoController.show);
router.post("/sessao", sessaoController.create);
router.put("/sessao/:codigo", sessaoController.update);
router.delete("/sessao/:codigo", sessaoController.destroy);

// exports das configs;
module.exports = router;
