const Validator = require("validatorjs");
const connection = require("../configs/mysql.config");

// Função que deve receber um identificador (código) e retornar a poltrona correspondente
function show(req, res) {
  const codigo = req.params.codigo;

  if (!codigo) {
    return res.status(400).json({ erro: "Identificador não fornecido" });
  }

  connection.query(
    "SELECT * FROM poltrona WHERE id_pol = ?",
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

function list(request, response) {
  connection.query("SELECT * FROM poltrona", function (err, resultado) {
    if (err) {
      return response
        .status(500)
        .json({ erro: "Ocorreram erros ao buscar os dados" });
    }
    return response.status(200).json({ dados: resultado });
  });
}

// Function create
function create(request, response) {
  const regras = {
    numero: "required|integer",
    fileira: "required|string|max:1",
    status: "required|string|max:100",
    sala_id: "required|integer",
  };

  const validacao = new Validator(request.body, regras);

  if (validacao.fails()) {
    return response.status(400).json(validacao.errors);
  }

  const { numero, fileira, status, sala_id } = request.body;

  // Verifica se a poltrona já existe na fileira antes de realizar a inserção
  connection.query(
    "SELECT COUNT(*) as total FROM poltrona WHERE numero = ? AND fileira = ?",
    [numero, fileira],
    function (err, resultadoConsulta) {
      if (err) {
        return response.status(500).json({
          erro: "Ocorreram erros ao verificar a duplicidade da poltrona na fileira",
        });
      }

      const totalPoltronasNaFileira = resultadoConsulta[0].total;

      if (totalPoltronasNaFileira > 0) {
        return response.status(400).json({
          erro: "Essa poltrona já existe na fileira. Escolha um número único para a fileira.",
        });
      }

      // Se a poltrona não existir na fileira, realiza a inserção
      connection.query(
        "INSERT INTO poltrona (numero, fileira, status, sala_id) VALUES (?, ?, ?, ?)",
        [numero, fileira, status, sala_id],
        function (err, resultadoInsercao) {
          if (err) {
            return response.status(500).json({
              erro: "Ocorreram erros ao tentar salvar a informação",
            });
          }

          if (resultadoInsercao.affectedRows === 0) {
            return response.status(500).json({
              erro: "Ocorreram erros ao tentar salvar a informação",
            });
          }

          return response.status(201).json({
            numero,
            fileira,
            status,
            sala_id,
            id: resultadoInsercao.insertId,
          });
        }
      );
    }
  );
}

// Function update
function update(request, response) {
  const codigo = request.params.codigo;

  const regras = {
    numero: "required|integer",
    fileira: "required|string|max:1",
    status: "required|string|max:100",
    sala_id: "required|integer",
  };

  const validacao = new Validator(request.body, regras);

  if (validacao.fails()) {
    return response.status(400).json(validacao.errors);
  }

  // Buscar o dado no BD
  connection.query(
    "SELECT * FROM poltrona WHERE id_pol = ?",
    [codigo],
    function (err, resultado) {
      if (err) {
        return response
          .status(500)
          .json({ erro: "Ocorreram erros ao buscar os dados" });
      }

      if (resultado.length === 0) {
        return response.status(404).json({
          erro: `Não foi possível encontrar a poltrona`,
        });
      }

      const poltronaExistente = resultado[0];
      const { numero, fileira, status, sala_id } = request.body;

      // Verifica se a nova poltrona já existe na mesma fileira
      connection.query(
        "SELECT COUNT(*) as total FROM poltrona WHERE numero = ? AND fileira = ? AND id_pol != ?",
        [numero, fileira, codigo],
        function (err, resultadoConsulta) {
          if (err) {
            return response.status(500).json({
              erro: "Ocorreram erros ao verificar a duplicidade da poltrona na fileira",
            });
          }

          const totalPoltronasNaFileira = resultadoConsulta[0].total;

          if (totalPoltronasNaFileira > 0) {
            return response.status(400).json({
              erro: "Essa poltrona já existe na fileira. Escolha um número único para a fileira.",
            });
          }

          // Se a nova poltrona não existir na mesma fileira, realiza a atualização
          connection.query(
            "UPDATE poltrona SET numero = ?, fileira = ?, status = ?, sala_id = ? WHERE id_pol = ?",
            [numero, fileira, status, sala_id, codigo],
            function (err, resultadoAtualizacao) {
              if (err) {
                return response.status(500).json({
                  erro: "Ocorreu um erro ao tentar atualizar a poltrona",
                });
              }

              if (resultadoAtualizacao.affectedRows === 0) {
                return response.status(500).json({
                  erro: "Nenhuma poltrona foi atualizada",
                });
              }

              return response.status(200).json({
                numero,
                fileira,
                status,
                sala_id,
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
    "DELETE FROM poltrona WHERE id_pol = ?",
    [codigo],
    function (err, resultado) {
      if (err) {
        return response.json({
          erro: "Ocorreu um erro ao tentar excluir a poltrona",
        });
      }

      if (resultado.affectedRows === 0) {
        return response.json({
          erro: `Poltrona #${codigo} não foi encontrada`,
        });
      }

      return response.json({
        mensagem: `Poltrona ${codigo} foi deletada com sucesso`,
      });
    }
  );
}

// Module exports sempre no final do arquivo
module.exports = { show, list, create, update, destroy };
