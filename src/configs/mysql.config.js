// Importação do módulo mysql
const mysql = require("mysql");

// Criação da conexão com o banco de dados
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "123456",
  database: "cinema_ingresso_db",
});

module.exports = connection;
