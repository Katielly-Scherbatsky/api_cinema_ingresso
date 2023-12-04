const Validator = require("validatorjs");
const connection = require("../configs/mysql.config");

// Função que deve receber um identificador (código) e retornar o ingresso correspondente
function show(req, res) {
  const codigo = req.params.codigo;

  if (!codigo) {
    return res.status(400).json({ erro: "Identificador não fornecido" });
  }

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

      return res.status(200).json(resultado[0]);
    }
  );
}

// Function list
function list(request, response) {
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
      return response.status(200).json({ dados: resultado });
    }
  );
}

// Function create
function create(request, response) {
  const regras = {
    codigo: "required|string|max:20",
    valor: "required|numeric|min:0.01", // valor seja um número maior que zero
    data_hora: "required|date",
    sessao_id: "required|integer",
    poltrona_id: "required|integer",
  };

  const validacao = new Validator(request.body, regras);

  if (validacao.fails()) {
    return response.status(400).json(validacao.errors);
  }

  const { codigo, valor, data_hora, sessao_id, poltrona_id } = request.body;

  // Verificar se o código já existe
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

      // Verificar se a poltrona já está associada à sessão
      connection.query(
        "SELECT * FROM ingresso WHERE poltrona_id = ? AND sessao_id = ?",
        [poltrona_id, sessao_id],
        function (errPoltrona, resultadoPoltrona) {
          if (errPoltrona) {
            return response.status(500).json({
              erro: "Ocorreram erros ao verificar a poltrona",
            });
          }

          if (resultadoPoltrona.length > 0) {
            return response.status(400).json({
              erro: "A poltrona já está associada à sessão. Escolha outra poltrona.",
            });
          }

          // Se o código for único e a poltrona não estiver associada à sessão, inserir o ingresso
          connection.query(
            "INSERT INTO ingresso (codigo, valor, data_hora, sessao_id, poltrona_id) VALUES (?, ?, ?, ?, ?)",
            [codigo, valor, data_hora, sessao_id, poltrona_id],
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

// Function update
function update(request, response) {
  const codigo = request.params.codigo;

  const regras = {
    codigo: "required|string|max:20",
    valor: "required|numeric|min:0.01", // valor seja um número maior que zero
    data_hora: "required|date",
    sessao_id: "required|integer",
    poltrona_id: "required|integer",
  };

  const validacao = new Validator(request.body, regras);

  if (validacao.fails()) {
    return response.status(400).json(validacao.errors);
  }

  // Buscar o dado no BD
  connection.query(
    "SELECT * FROM ingresso WHERE id_ing = ?",
    [codigo],
    function (err, resultado) {
      if (err) {
        return response
          .status(500)
          .json({ erro: "Ocorreram erros ao buscar os dados" });
      }

      if (resultado.length === 0) {
        return response.status(404).json({
          erro: `Não foi possível encontrar o ingresso`,
        });
      }

      const ingressoExistente = resultado[0];
      const { valor, data_hora, sessao_id, poltrona_id } = request.body;

      // Verificar se a poltrona já está associada à sessão
      connection.query(
        "SELECT * FROM ingresso WHERE poltrona_id = ? AND sessao_id = ?",
        [poltrona_id, sessao_id],
        function (errPoltrona, resultadoPoltrona) {
          if (errPoltrona) {
            return response.status(500).json({
              erro: "Ocorreram erros ao verificar a poltrona",
            });
          }

          if (resultadoPoltrona.length > 0) {
            return response.status(400).json({
              erro: "A poltrona já está associada à sessão informada. Não é possível atualizar o ingresso.",
            });
          }

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

              if (resultadoAtualizacao.affectedRows === 0) {
                return response.status(500).json({
                  erro: "Nenhum ingresso foi atualizado",
                });
              }

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

//function destroy
function destroy(request, response) {
  const codigo = request.params.codigo;

  connection.query(
    "DELETE FROM ingresso WHERE id_ing = ?",
    [codigo],
    function (err, resultado) {
      if (err) {
        return response.json({
          erro: "Ocorreu um erro ao tentar excluir o ingresso",
        });
      }

      if (resultado.affectedRows === 0) {
        return response.json({
          erro: `Ingresso #${codigo} não foi encontrado`,
        });
      }

      return response.json({
        mensagem: `Ingresso ${codigo} foi deletado com sucesso`,
      });
    }
  );
}

// Module exports sempre no final do arquivo
module.exports = { show, list, create, update, destroy };
