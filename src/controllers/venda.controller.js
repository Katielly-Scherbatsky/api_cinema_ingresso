const Validator = require("validatorjs");
const connection = require("../configs/mysql.config");

// Função que deve receber um identificador (código) e retornar a venda correspondente
function show(req, res) {
  const codigo = req.params.codigo;

  if (!codigo) {
    return res.status(400).json({ erro: "Identificador não fornecido" });
  }

  connection.query(
    `SELECT v.id_ven, v.valor, v.data_hora, v.forma_pagamento, v.situacao, c.nome, i.codigo, i.data_hora FROM venda v
    JOIN cliente c ON c.id_cli = v.cliente_id
    JOIN ingresso i ON i.id_ing = v.ingresso_id
    WHERE v.id_ven = ?;`,
    [codigo],
    function (err, resultado) {
      if (err) {
        return res.status(500).json({
          erro: "Ocorreram erros ao tentar buscar a informação",
        });
      }

      if (resultado.length === 0) {
        return res
          .status(404)
          .json({ erro: `O código #${codigo} não foi encontrado!` });
      }

      return res.status(200).json(resultado[0]);
    }
  );
}

// Function list
function list(request, response) {
  connection.query(
    `SELECT v.id_ven, v.valor, v.data_hora, v.forma_pagamento, v.situacao, c.nome, i.codigo, i.data_hora FROM venda v
    JOIN cliente c ON c.id_cli = v.cliente_id
    JOIN ingresso i ON i.id_ing = v.ingresso_id;`,
    function (err, resultado) {
      if (err) {
        return response
          .status(500)
          .json({ erro: "Ocorreram erros ao buscar os dados" });
      }
      return response.status(200).json({ dados: resultado });
    }
  );
}

// Function create
function create(request, response) {
  const regras = {
    valor: "required|numeric|min:0.01",
    data_hora: "required|date",
    forma_pagamento: "required|string|max:200",
    situacao: "required|string|max:20",
    ingresso_id: "required|integer",
    cliente_id: "required|integer",
  };

  const validacao = new Validator(request.body, regras);

  if (validacao.fails()) {
    return response.status(400).json(validacao.errors);
  }

  const {
    valor,
    data_hora,
    forma_pagamento,
    situacao,
    ingresso_id,
    cliente_id,
  } = request.body;

  // Verifica se o cliente_id existe
  connection.query(
    "SELECT * FROM cliente WHERE id_cli = ?",
    [cliente_id],
    function (errCliente, resultadoCliente) {
      if (errCliente) {
        return response.status(500).json({
          erro: "Ocorreram erros ao tentar verificar o cliente",
        });
      }

      if (resultadoCliente.length === 0) {
        return response.status(400).json({
          erro: "O cliente_id informado não existe",
        });
      }

      // Verifica se o ingresso_id existe
      connection.query(
        "SELECT * FROM ingresso WHERE id_ing = ?",
        [ingresso_id],
        function (errIngresso, resultadoIngresso) {
          if (errIngresso) {
            return response.status(500).json({
              erro: "Ocorreram erros ao tentar verificar o ingresso",
            });
          }

          if (resultadoIngresso.length === 0) {
            return response.status(400).json({
              erro: "O ingresso_id informado não existe",
            });
          }

          // Verifica se já existe uma venda com o ingresso_id
          connection.query(
            "SELECT * FROM venda WHERE ingresso_id = ?",
            [ingresso_id],
            function (errVenda, resultadoVenda) {
              if (errVenda) {
                return response.status(500).json({
                  erro: "Ocorreram erros ao tentar verificar a venda",
                });
              }

              if (resultadoVenda.length > 0) {
                return response.status(400).json({
                  erro: "Já existe uma venda com o ingresso_id informado",
                });
              }

              // Se todos os IDs existirem e não houver venda, realiza a inserção
              connection.query(
                "INSERT INTO venda (valor, data_hora, forma_pagamento, situacao, ingresso_id, cliente_id) VALUES (?, ?, ?, ?, ?, ?)",
                [
                  valor,
                  data_hora,
                  forma_pagamento,
                  situacao,
                  ingresso_id,
                  cliente_id,
                ],
                function (err, resultado) {
                  if (err) {
                    return response.status(500).json({
                      erro: "Ocorreram erros ao tentar salvar a informação",
                    });
                  }

                  if (resultado.affectedRows === 0) {
                    return response.status(500).json({
                      erro: "Ocorreram erros ao tentar salvar a informação",
                    });
                  }

                  return response.status(201).json({
                    valor,
                    data_hora,
                    forma_pagamento,
                    situacao,
                    ingresso_id,
                    cliente_id,
                    id: resultado.insertId,
                  });
                }
              );
            }
          );
        }
      );
    }
  );
}

// Function update
function update(request, response) {
  const codigo = request.params.codigo;

  const regras = {
    valor: "required|numeric|min:0.01",
    data_hora: "required|date",
    forma_pagamento: "required|string|max:200",
    situacao: "required|string|max:20",
    ingresso_id: "required|integer",
    cliente_id: "required|integer",
  };

  const validacao = new Validator(request.body, regras);

  if (validacao.fails()) {
    return response.status(400).json(validacao.errors);
  }

  // Buscar o dado no BD
  connection.query(
    "SELECT * FROM venda WHERE id_ven= ?",
    [codigo],
    function (err, resultado) {
      if (err) {
        return response
          .status(500)
          .json({ erro: "Ocorreram erros ao buscar os dados" });
      }

      if (resultado.length === 0) {
        return response.status(404).json({
          erro: `Não foi possível encontrar a venda`,
        });
      }

      const {
        valor,
        data_hora,
        forma_pagamento,
        situacao,
        ingresso_id,
        cliente_id,
      } = request.body;

      // Verifica se o cliente_id existe
      connection.query(
        "SELECT * FROM cliente WHERE id_cli = ?",
        [cliente_id],
        function (errCliente, resultadoCliente) {
          if (errCliente) {
            return response.status(500).json({
              erro: "Ocorreram erros ao tentar verificar o cliente",
            });
          }

          if (resultadoCliente.length === 0) {
            return response.status(400).json({
              erro: "O cliente_id informado não existe",
            });
          }

          // Verifica se o ingresso_id existe
          connection.query(
            "SELECT * FROM ingresso WHERE id_ing = ?",
            [ingresso_id],
            function (errIngresso, resultadoIngresso) {
              if (errIngresso) {
                return response.status(500).json({
                  erro: "Ocorreram erros ao tentar verificar o ingresso",
                });
              }

              if (resultadoIngresso.length === 0) {
                return response.status(400).json({
                  erro: "O ingresso_id informado não existe",
                });
              }

              // Verifica se já existe uma venda com o ingresso_id
              connection.query(
                "SELECT * FROM venda WHERE ingresso_id = ? AND id_ven != ?",
                [ingresso_id, codigo],
                function (errVenda, resultadoVenda) {
                  if (errVenda) {
                    return response.status(500).json({
                      erro: "Ocorreram erros ao tentar verificar a venda",
                    });
                  }

                  if (resultadoVenda.length > 0) {
                    return response.status(400).json({
                      erro: "Já existe uma venda com o ingresso_id informado",
                    });
                  }

                  // Se todos os IDs existirem e não houver venda, realiza a atualização
                  connection.query(
                    "UPDATE venda SET valor = ?, data_hora = ?, forma_pagamento = ?, situacao = ?, ingresso_id = ?, cliente_id = ? WHERE id_ven = ?",
                    [
                      valor,
                      data_hora,
                      forma_pagamento,
                      situacao,
                      ingresso_id,
                      cliente_id,
                      codigo,
                    ],
                    function (err, resultado) {
                      if (err) {
                        return response.status(500).json({
                          erro: "Ocorreu um erro ao tentar atualizar a venda",
                        });
                      }

                      if (resultado.affectedRows === 0) {
                        return response.status(500).json({
                          erro: "Nenhuma venda foi atualizada",
                        });
                      }
                      return response.status(200).json({
                        valor,
                        data_hora,
                        forma_pagamento,
                        situacao,
                        ingresso_id,
                        cliente_id,
                        id: codigo,
                      });
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
}

//function destroy
function destroy(request, response) {
  const codigo = request.params.codigo;

  connection.query(
    "DELETE FROM venda WHERE id_ven = ?",
    [codigo],
    function (err, resultado) {
      if (err) {
        return response.json({
          erro: "Ocorreu um erro ao tentar excluir a venda",
        });
      }

      if (resultado.affectedRows === 0) {
        return response.json({
          erro: `Venda #${codigo} não foi encontrado`,
        });
      }

      return response.json({
        mensagem: `Venda ${codigo} foi deletada com sucesso`,
      });
    }
  );
}

// Module exports sempre no final do arquivo
module.exports = { show, list, create, update, destroy };
