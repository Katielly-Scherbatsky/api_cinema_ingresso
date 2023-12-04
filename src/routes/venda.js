// Colocar as rotas referente ao recursos de venda
const express = require("express");
const vendaController = require("../controllers/venda.controller");

const router = express.Router();

router.get("/venda", vendaController.list);
router.get("/venda/:codigo", vendaController.show);
router.post("/venda", vendaController.create);
router.put("/venda/:codigo", vendaController.update);
router.delete("/venda/:codigo", vendaController.destroy);

// exports das configs;
module.exports = router;
