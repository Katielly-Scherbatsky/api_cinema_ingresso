const express = require("express");
const router = express.Router();

// Configuração de rotas
// Rota principal
router.get("/", function (request, response) {
  return response.send("API de Gestão Cinematográfica");
});

router.get("/Autor", function (request, response) {
  return response.send("Autor: Katielly");
});

router.get("/sobre", function (repost, response) {
  return response.send(
    "A API de Gestão Cinematográfica simplifica o gerenciamento de cinemas, oferecendo funcionalidades como reservas de ingressos, programação de sessões, acompanhamento de vendas e análise de desempenho. Intuitiva e flexível, essa ferramenta permite que operadores de cinemas otimizem processos, proporcionando uma experiência cinematográfica sem complicações para seus clientes."
  );
});

// Exportação da constante router código padrão
module.exports = router;
