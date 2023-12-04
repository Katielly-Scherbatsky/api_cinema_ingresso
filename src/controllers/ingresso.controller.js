const Validator = require("validatorjs");
const connection = require("../configs/mysql.config");

// Função que deve receber um identificador (código) e retornar o ingresso correspondente
function show(req, res) {
  // Extração do código do ingresso a partir dos parâmetros da requisição
  const codigo = req.params.codigo;

  // Verificação se o código foi fornecido corretamente
  if (!codigo) {
    return res.status(400).json({ erro: "Identificador não fornecido" });
  }

  // Consulta SQL para obter informações do ingresso
  connection.query(
    `SELECT i.id_ing, i.codigo, i.valor, i.data_hora, s.id_ses, p.numero, p.fileira FROM ingresso i
    JOIN sessao s ON s.id_ses = i.sessao_id
    JOIN poltrona p ON p.id_pol = i.poltrona_id
    WHERE i.id_ing = ?;`,
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
  // Consulta SQL para obter todos os ingressos
  connection.query(
    `SELECT i.id_ing, i.codigo, i.valor, i.data_hora, s.id_ses, p.numero, p.fileira FROM ingresso i
    JOIN sessao s ON s.id_ses = i.sessao_id
    JOIN poltrona p ON p.id_pol = i.poltrona_id;`,
    function (err, resultado) {
      if (err) {
        return response
          .status(500)
          .json({ erro: "Ocorreram erros ao buscar os dados" });
      }

      // Envio dos dados dos ingressos como resposta
      return response.status(200).json({ dados: resultado });
    }
  );
}

// Function create
function create(request, response) {
  // Definição das regras de validação utilizando o módulo validatorjs
  const regras = {
    codigo: "required|string|max:20",
    valor: "required|numeric|min:0.01",
    data_hora: "required|date",
    sessao_id: "required|integer",
    poltrona_id: "required|integer",
  };

  // Criação de um objeto Validator para validar os dados da requisição
  const validacao = new Validator(request.body, regras);

  if (validacao.fails()) {
    return response.status(400).json(validacao.errors);
  }

  // Extração dos dados da requisição
  const { codigo, valor, data_hora, sessao_id, poltrona_id } = request.body;

  // Consulta SQL para verificar a existência do codigo
  connection.query(
    "SELECT * FROM ingresso WHERE codigo = ?",
    [codigo],
    function (errCodigo, resultadoCodigo) {
      if (errCodigo) {
        return response.status(500).json({
          erro: "Ocorreram erros ao verificar o código",
        });
      }

      if (resultadoCodigo.length > 0) {
        return response.status(400).json({
          erro: "O código já está em uso. Escolha outro.",
        });
      }

      // Consulta SQL para verificar a existência da sessao
      connection.query(
        "SELECT * FROM sessao WHERE id_ses = ?",
        [sessao_id],
        function (errSessao, resultadoSessao) {
          if (errSessao) {
            return response.status(500).json({
              erro: "Ocorreram erros ao verificar a sessão",
            });
          }

          if (resultadoSessao.length === 0) {
            return response.status(400).json({
              erro: "O sessao_id informado não existe",
            });
          }

          // Consulta SQL para verificar a existência da poltrona
          connection.query(
            "SELECT * FROM poltrona WHERE id_pol = ?",
            [poltrona_id],
            function (errPoltrona, resultadoPoltrona) {
              if (errPoltrona) {
                return response.status(500).json({
                  erro: "Ocorreram erros ao verificar a poltrona",
                });
              }

              if (resultadoPoltrona.length === 0) {
                return response.status(400).json({
                  erro: "O poltrona_id informado não existe",
                });
              }

              // Consulta SQL para verificar se a poltrona já está associada à sessão
              connection.query(
                "SELECT * FROM ingresso WHERE poltrona_id = ? AND sessao_id = ?",
                [poltrona_id, sessao_id],
                function (errPoltronaSessao, resultadoPoltronaSessao) {
                  if (errPoltronaSessao) {
                    return response.status(500).json({
                      erro: "Ocorreram erros ao verificar a poltrona na sessão",
                    });
                  }

                  if (resultadoPoltronaSessao.length > 0) {
                    return response.status(400).json({
                      erro: "A poltrona já está associada à sessão. Escolha outra poltrona.",
                    });
                  }

                  // Consulta SQL para inserir um novo ingresso no banco de dados
                  // Se o código for único, a sessão existir, a poltrona existir e não estiver associada à sessão, inserir o ingresso
                  connection.query(
                    "INSERT INTO ingresso (codigo, valor, data_hora, sessao_id, poltrona_id) VALUES (?, ?, ?, ?, ?)",
                    [codigo, valor, data_hora, sessao_id, poltrona_id],
                    function (err, resultado) {
                      if (err) {
                        return response.status(500).json({
                          erro: "Ocorreram erros ao tentar salvar a informação",
                        });
                      }

                      // Verificação se algum imgresso foi inserido
                      if (resultado.affectedRows === 0) {
                        return response.status(500).json({
                          erro: "Ocorreram erros ao tentar salvar a informação",
                        });
                      }

                      // Envio dos dados do ingresso criado como resposta
                      return response.status(201).json({
                        codigo,
                        valor,
                        data_hora,
                        sessao_id,
                        poltrona_id,
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
  );
}

// Function update
function update(request, response) {
  // Extração do código do ingresso a ser atualizado a partir dos parâmetros da requisição
  const codigo = request.params.codigo;

  // Definição das regras de validação
  const regras = {
    codigo: "required|string|max:20",
    valor: "required|numeric|min:0.01",
    data_hora: "required|date",
    sessao_id: "required|integer",
    poltrona_id: "required|integer",
  };

  // Criação de um objeto Validator para validar os dados da requisição
  const validacao = new Validator(request.body, regras);

  if (validacao.fails()) {
    return response.status(400).json(validacao.errors);
  }

  // Consulta SQL para buscar os dados do ingresso no banco de dados
  connection.query(
    "SELECT * FROM ingresso WHERE id_ing = ?",
    [codigo],
    function (err, resultado) {
      if (err) {
        return response
          .status(500)
          .json({ erro: "Ocorreram erros ao buscar os dados" });
      }

      // Verificação se o ingresso a ser atualizado foi encontrado no banco de dados
      if (resultado.length === 0) {
        return response.status(404).json({
          erro: `Não foi possível encontrar o ingresso`,
        });
      }

      // Armazenamento dos dados do ingresso existente
      const ingressoExistente = resultado[0];

      // Extração dos dados atualizados da requisição
      const { valor, data_hora, sessao_id, poltrona_id } = request.body;

      // Verificar se a sessão existe
      connection.query(
        "SELECT * FROM sessao WHERE id_ses = ?",
        [sessao_id],
        function (errSessao, resultadoSessao) {
          if (errSessao) {
            return response.status(500).json({
              erro: "Ocorreram erros ao verificar a sessão",
            });
          }

          if (resultadoSessao.length === 0) {
            return response.status(400).json({
              erro: "O sessao_id informado não existe",
            });
          }

          // Verificar se a poltrona existe
          connection.query(
            "SELECT * FROM poltrona WHERE id_pol = ?",
            [poltrona_id],
            function (errPoltrona, resultadoPoltrona) {
              if (errPoltrona) {
                return response.status(500).json({
                  erro: "Ocorreram erros ao verificar a poltrona",
                });
              }

              if (resultadoPoltrona.length === 0) {
                return response.status(400).json({
                  erro: "O poltrona_id informado não existe",
                });
              }

              // Verificar se a poltrona já está associada à sessão
              connection.query(
                "SELECT * FROM ingresso WHERE poltrona_id = ? AND sessao_id = ? AND id_ing <> ?",
                [poltrona_id, sessao_id, codigo],
                function (errPoltronaSessao, resultadoPoltronaSessao) {
                  if (errPoltronaSessao) {
                    return response.status(500).json({
                      erro: "Ocorreram erros ao verificar a poltrona na sessão",
                    });
                  }

                  if (resultadoPoltronaSessao.length > 0) {
                    return response.status(400).json({
                      erro: "A poltrona já está associada à sessão informada. Não é possível atualizar o ingresso.",
                    });
                  }

                  // Consulta SQL para atualizar os dados do ingresso no banco de dados
                  // Se a poltrona não estiver associada à sessão, atualiza o ingresso
                  connection.query(
                    "UPDATE ingresso SET valor = ?, data_hora = ?, sessao_id = ?, poltrona_id = ? WHERE id_ing = ?",
                    [valor, data_hora, sessao_id, poltrona_id, codigo],
                    function (errAtualizacao, resultadoAtualizacao) {
                      if (errAtualizacao) {
                        return response.status(500).json({
                          erro: "Ocorreu um erro ao tentar atualizar o ingresso",
                        });
                      }

                      // Verificação se algum ingresso foi atualizado
                      if (resultadoAtualizacao.affectedRows === 0) {
                        return response.status(500).json({
                          erro: "Nenhum ingresso foi atualizado",
                        });
                      }

                      // Envio dos dados do ingresso atualizado como resposta
                      return response.status(200).json({
                        codigo,
                        valor,
                        data_hora,
                        sessao_id,
                        poltrona_id,
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
  // Obtenção do código do ingresso a ser excluído
  const codigo = request.params.codigo;

  // Consulta SQL para excluir o ingresso do banco de dados
  connection.query(
    "DELETE FROM ingresso WHERE id_ing = ?",
    [codigo],
    function (err, resultado) {
      if (err) {
        return response.json({
          erro: "Ocorreu um erro ao tentar excluir o ingresso",
        });
      }

      // Verificação se o ingresso foi encontrado e excluído com sucesso
      if (resultado.affectedRows === 0) {
        return response.json({
          erro: `Ingresso #${codigo} não foi encontrado`,
        });
      }

      // Resposta de sucesso após a exclusão bem-sucedida
      return response.json({
        mensagem: `Ingresso ${codigo} foi deletado com sucesso`,
      });
    }
  );
}

// Module exports: exportar as funções definidas
module.exports = { show, list, create, update, destroy };
