// Colocar as rotas referente ao recursos de cliente
const express = require("express");
const clienteController = require("../controllers/cliente.controller");

const router = express.Router();

router.get("/cliente", clienteController.list);
router.get("/cliente/:codigo", clienteController.show);
router.post("/cliente", clienteController.create);
router.put("/cliente/:codigo", clienteController.update);
router.delete("/cliente/:codigo", clienteController.destroy);

// exports das configs;
module.exports = router;
