const Validator = require("validatorjs");
const connection = require("../configs/mysql.config");

// Função que deve receber um identificador (código) e retornar a sessao correspondente
function show(req, res) {
  // Extração do código da sessao a partir dos parâmetros da requisição
  const codigo = req.params.codigo;

  // Verificação se o código foi fornecido corretamente
  if (!codigo) {
    return res.status(400).json({ erro: "Identificador não fornecido" });
  }

  // Consulta SQL para obter informações da sessao
  connection.query(
    `SELECT s.id_ses, s.data, s.horario_inicio, s.horario_fim, sa.nome, f.titulo FROM sessao s
    JOIN sala sa ON sa.id_sal = s.sala_id
    JOIN filme f ON f.id_fil = s.filme_id
    WHERE s.id_ses = ?;`,
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
  // Consulta SQL para obter todas as sessoes
  connection.query(
    `SELECT s.id_ses, s.data, s.horario_inicio, s.horario_fim, sa.nome, f.titulo FROM sessao s
    JOIN sala sa ON sa.id_sal = s.sala_id
    JOIN filme f ON f.id_fil = s.filme_id;`,
    function (err, resultado) {
      if (err) {
        return response
          .status(500)
          .json({ erro: "Ocorreram erros ao buscar os dados" });
      }

      // Envio dos dados das sessoes como resposta
      return response.status(200).json({ dados: resultado });
    }
  );
}

// Function create
function create(request, response) {
  // Definição das regras de validação utilizando o módulo validatorjs
  const regras = {
    data: "required|date",
    horario_inicio: "required",
    horario_fim: "required",
    sala_id: "required|integer",
    filme_id: "required|integer",
  };

  // Criação de um objeto Validator para validar os dados da requisição
  const validacao = new Validator(request.body, regras);

  if (validacao.fails()) {
    return response.status(400).json(validacao.errors);
  }

  // Extração dos dados da requisição
  const { data, horario_inicio, horario_fim, sala_id, filme_id } = request.body;

  // Consulta SQL para verificar se a sala existe no sistema
  connection.query(
    "SELECT * FROM sala WHERE id_sal = ?",
    [sala_id],
    function (errSala, resultadoSala) {
      if (errSala) {
        return response.status(500).json({
          erro: "Ocorreram erros ao tentar verificar a sala",
        });
      }

      if (resultadoSala.length === 0) {
        return response.status(404).json({
          erro: "Sala não encontrada",
        });
      }

      // Consulta SQL para verificar se o filme existe no sistema
      connection.query(
        "SELECT * FROM filme WHERE id_fil = ?",
        [filme_id],
        function (errFilme, resultadoFilme) {
          if (errFilme) {
            return response.status(500).json({
              erro: "Ocorreram erros ao tentar verificar o filme",
            });
          }

          if (resultadoFilme.length === 0) {
            return response.status(404).json({
              erro: "Filme não encontrado",
            });
          }

          // Consulta SQL para inserir uma nova sessao no banco de dados
          // Se a sala e o filme existirem, insira a sessão
          connection.query(
            "INSERT INTO sessao (data, horario_inicio, horario_fim, sala_id, filme_id) VALUES (?, ?, ?, ?, ?)",
            [data, horario_inicio, horario_fim, sala_id, filme_id],
            function (err, resultadoInsercao) {
              if (err) {
                return response.status(500).json({
                  erro: "Ocorreram erros ao tentar salvar a informação",
                });
              }

              // Verificação se alguma sessao foi inserida
              if (resultadoInsercao.affectedRows === 0) {
                return response.status(500).json({
                  erro: "Ocorreram erros ao tentar salvar a informação",
                });
              }

              // Envio dos dados da sessao criada como resposta
              return response.status(201).json({
                data,
                horario_inicio,
                horario_fim,
                sala_id,
                filme_id,
                id_sessao: resultadoInsercao.insertId,
              });
            }
          );
        }
      );
    }
  );
}

// Function update
function update(request, response) {
  // Extração do código da sessao a ser atualizada a partir dos parâmetros da requisição
  const codigo = request.params.codigo;

  // Definição das regras de validação
  const regras = {
    data: "required|date",
    horario_inicio: "required",
    horario_fim: "required",
    sala_id: "required|integer",
    filme_id: "required|integer",
  };

  // Criação de um objeto Validator para validar os dados da requisição
  const validacao = new Validator(request.body, regras);

  if (validacao.fails()) {
    return response.status(400).json(validacao.errors);
  }

  // Consulta SQL para buscar os dados da sessao no banco de dados
  connection.query(
    "SELECT * FROM sessao WHERE id_ses = ?",
    [codigo],
    function (err, resultadoSessao) {
      if (err) {
        return response
          .status(500)
          .json({ erro: "Ocorreram erros ao buscar os dados da sessão" });
      }

      // Verificação se a sessao a ser atualizada foi encontrado no banco de dados
      if (resultadoSessao.length === 0) {
        return response.status(404).json({
          erro: `Não foi possível encontrar a sessão`,
        });
      }

      // Armazenamento dos dados da sessão existente
      const sessaoExistente = resultadoSessao[0];

      // Extração dos dados atualizados da requisição
      const { data, horario_inicio, horario_fim, sala_id, filme_id } =
        request.body;

      // Verifica se a sala existe no sistema
      connection.query(
        "SELECT * FROM sala WHERE id_sal = ?",
        [sala_id],
        function (errSala, resultadoSala) {
          if (errSala) {
            return response.status(500).json({
              erro: "Ocorreram erros ao tentar verificar a sala",
            });
          }

          if (resultadoSala.length === 0) {
            return response.status(404).json({
              erro: "Sala não encontrada",
            });
          }

          // Verifica se o filme existe no sistema
          connection.query(
            "SELECT * FROM filme WHERE id_fil = ?",
            [filme_id],
            function (errFilme, resultadoFilme) {
              if (errFilme) {
                return response.status(500).json({
                  erro: "Ocorreram erros ao tentar verificar o filme",
                });
              }

              if (resultadoFilme.length === 0) {
                return response.status(404).json({
                  erro: "Filme não encontrado",
                });
              }

              // Consulta SQL para atualizar os dados da sessao no banco de dados
              // Se a sala e o filme existirem, atualiza a sessão
              connection.query(
                "UPDATE sessao SET data = ?, horario_inicio = ?, horario_fim = ?, sala_id = ?, filme_id = ? WHERE id_ses = ?",
                [data, horario_inicio, horario_fim, sala_id, filme_id, codigo],
                function (errAtualizacao, resultadoAtualizacao) {
                  if (errAtualizacao) {
                    return response.status(500).json({
                      erro: "Ocorreu um erro ao tentar atualizar a sessão",
                    });
                  }

                  // Verificação se alguma sessao foi atualizada
                  if (resultadoAtualizacao.affectedRows === 0) {
                    return response.status(500).json({
                      erro: "Nenhuma sessão foi atualizada",
                    });
                  }

                  // Envio dos dados da sessao atualizada como resposta
                  return response.status(200).json({
                    data,
                    horario_inicio,
                    horario_fim,
                    sala_id,
                    filme_id,
                    id_sessao: codigo,
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

//function destroy
function destroy(request, response) {
  // Obtenção do código da sessao a ser excluída
  const codigo = request.params.codigo;

  // Consulta SQL para excluir a sessao do banco de dados
  connection.query(
    "DELETE FROM sessao WHERE id_ses = ?",
    [codigo],
    function (err, resultado) {
      if (err) {
        return response.json({
          erro: "Ocorreu um erro ao tentar excluir a sessão",
        });
      }

      // Verificação se a sessao foi encontrada e excluída com sucesso
      if (resultado.affectedRows === 0) {
        return response.json({
          erro: `Sessão #${codigo} não foi encontrada`,
        });
      }

      // Resposta de sucesso após a exclusão bem-sucedida
      return response.json({
        mensagem: `Sessão ${codigo} foi deletada com sucesso`,
      });
    }
  );
}

// Module exports: exportar as funções definidas
module.exports = { show, list, create, update, destroy };
