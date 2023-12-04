const Validator = require("validatorjs");
const connection = require("../configs/mysql.config");

// Função que deve receber um identificador (código) e retornar a venda correspondente
function show(req, res) {
  // Extração do código da venda a partir dos parâmetros da requisição
  const codigo = req.params.codigo;

  // Verificação se o código foi fornecido corretamente
  if (!codigo) {
    return res.status(400).json({ erro: "Identificador não fornecido" });
  }

  // Consulta SQL para obter informações da venda
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

      // Envio das informações do cliente como resposta
      return res.status(200).json(resultado[0]);
    }
  );
}

// Function list
function list(request, response) {
  // Consulta SQL para obter todas as vendas
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

      // Envio dos dados das vendas como resposta
      return response.status(200).json({ dados: resultado });
    }
  );
}

// Function create
function create(request, response) {
  // Definição das regras de validação utilizando o módulo validatorjs
  const regras = {
    valor: "required|numeric|min:0.01",
    data_hora: "required|date",
    forma_pagamento: "required|string|max:200",
    situacao: "required|string|max:20",
    ingresso_id: "required|integer",
    cliente_id: "required|integer",
  };

  // Criação de um objeto Validator para validar os dados da requisição
  const validacao = new Validator(request.body, regras);

  if (validacao.fails()) {
    return response.status(400).json(validacao.errors);
  }

  // Extração dos dados da requisição
  const {
    valor,
    data_hora,
    forma_pagamento,
    situacao,
    ingresso_id,
    cliente_id,
  } = request.body;

  // Consulta SQL para verificar se o cliente_id existe
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

      // Consulta SQL para verificar se o ingresso_id existe
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

          // Consulta SQL para verificar se já existe uma venda com o ingresso_id
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

              // Consulta SQL para inserir uma nova venda no banco de dados
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

                  // Verificação se alguma venda foi inserida
                  if (resultado.affectedRows === 0) {
                    return response.status(500).json({
                      erro: "Ocorreram erros ao tentar salvar a informação",
                    });
                  }

                  // Envio dos dados da venda criada como resposta
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
  // Extração do código da venda a ser atualizada a partir dos parâmetros da requisição
  const codigo = request.params.codigo;

  // Definição das regras de validação
  const regras = {
    valor: "required|numeric|min:0.01",
    data_hora: "required|date",
    forma_pagamento: "required|string|max:200",
    situacao: "required|string|max:20",
    ingresso_id: "required|integer",
    cliente_id: "required|integer",
  };

  // Criação de um objeto Validator para validar os dados da requisição
  const validacao = new Validator(request.body, regras);

  if (validacao.fails()) {
    return response.status(400).json(validacao.errors);
  }

  // Consulta SQL para buscar os dados da venda no banco de dados
  connection.query(
    "SELECT * FROM venda WHERE id_ven= ?",
    [codigo],
    function (err, resultado) {
      if (err) {
        return response
          .status(500)
          .json({ erro: "Ocorreram erros ao buscar os dados" });
      }

      // Verificação se a venda a ser atualizada foi encontrado no banco de dados
      if (resultado.length === 0) {
        return response.status(404).json({
          erro: `Não foi possível encontrar a venda`,
        });
      }

      // Extração dos dados atualizados da requisição
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

                  // Consulta SQL para atualizar os dados da venda no banco de dados
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

                      // Verificação se alguma venda foi atualizada
                      if (resultado.affectedRows === 0) {
                        return response.status(500).json({
                          erro: "Nenhuma venda foi atualizada",
                        });
                      }

                      // Envio dos dados da venda atualizada como resposta
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
  // Obtenção do código da venda a ser excluída
  const codigo = request.params.codigo;

  // Consulta SQL para excluir a venda do banco de dados
  connection.query(
    "DELETE FROM venda WHERE id_ven = ?",
    [codigo],
    function (err, resultado) {
      if (err) {
        return response.json({
          erro: "Ocorreu um erro ao tentar excluir a venda",
        });
      }

      // Verificação se a venda foi encontrada e excluída com sucesso
      if (resultado.affectedRows === 0) {
        return response.json({
          erro: `Venda #${codigo} não foi encontrado`,
        });
      }

      // Resposta de sucesso após a exclusão bem-sucedida
      return response.json({
        mensagem: `Venda ${codigo} foi deletada com sucesso`,
      });
    }
  );
}

// Module exports: exportar as funções definidas
module.exports = { show, list, create, update, destroy };
