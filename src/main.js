const express = require("express");
const app = express();

// Importação do arquivos de configuração de rotas
const baseRouter = require("./routes/base");
const clienteRouter = require("./routes/cliente");
const filmeRouter = require("./routes/filme");
const ingressoRouter = require("./routes/ingresso");
const poltronaRouter = require("./routes/poltrona");
const salaRouter = require("./routes/sala");
const sessaoRouter = require("./routes/sessao");
const vendaRouter = require("./routes/venda");

app.use(express.json());

//Configuração de uso das rotas
app.use(baseRouter);
app.use(clienteRouter);
app.use(filmeRouter);
app.use(ingressoRouter);
app.use(poltronaRouter);
app.use(salaRouter);
app.use(sessaoRouter);
app.use(vendaRouter);

// Iniciando a aplicação na porta 3000
app.listen(3000, function () {
  console.log("API iniciada na porta: 3000");
});
