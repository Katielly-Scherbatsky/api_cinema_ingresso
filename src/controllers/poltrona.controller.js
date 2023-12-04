const Validator = require("validatorjs");
const connection = require("../configs/mysql.config");

// Função que deve receber um identificador (código) e retornar a poltrona correspondente
function show(req, res) {
  // Extração do código da poltrona a partir dos parâmetros da requisição
  const codigo = req.params.codigo;

  // Verificação se o código foi fornecido corretamente
  if (!codigo) {
    return res.status(400).json({ erro: "Identificador não fornecido" });
  }

  // Consulta SQL para obter informações da poltrona
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

      // Envio das informações do cliente como resposta
      return res.status(200).json(resultado[0]);
    }
  );
}

function list(request, response) {
  // Consulta SQL para obter todas as poltronas
  connection.query("SELECT * FROM poltrona", function (err, resultado) {
    if (err) {
      return response
        .status(500)
        .json({ erro: "Ocorreram erros ao buscar os dados" });
    }

    // Envio dos dados das poltronas como resposta
    return response.status(200).json({ dados: resultado });
  });
}

// Function create
function create(request, response) {
  // Definição das regras de validação utilizando o módulo validatorjs
  const regras = {
    numero: "required|integer",
    fileira: "required|string|max:1",
    status: "required|string|max:100",
    sala_id: "required|integer",
  };

  // Criação de um objeto Validator para validar os dados da requisição
  const validacao = new Validator(request.body, regras);

  if (validacao.fails()) {
    return response.status(400).json(validacao.errors);
  }

  const { numero, fileira, status, sala_id } = request.body;

  // Consulta SQL para verificar se a poltrona já existe na fileira antes de realizar a inserção
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

      // Consulta SQL para inserir uma nova poltrona no banco de dados
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

          // Verificação se alguma poltrona foi inserida
          if (resultadoInsercao.affectedRows === 0) {
            return response.status(500).json({
              erro: "Ocorreram erros ao tentar salvar a informação",
            });
          }

          // Envio dos dados da poltrona criada como resposta
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
  // Extração do código da poltrona a ser atualizada a partir dos parâmetros da requisição
  const codigo = request.params.codigo;

  // Definição das regras de validação
  const regras = {
    numero: "required|integer",
    fileira: "required|string|max:1",
    status: "required|string|max:100",
    sala_id: "required|integer",
  };

  // Criação de um objeto Validator para validar os dados da requisição
  const validacao = new Validator(request.body, regras);

  if (validacao.fails()) {
    return response.status(400).json(validacao.errors);
  }

  // Consulta SQL para buscar os dados da poltrona no banco de dados
  connection.query(
    "SELECT * FROM poltrona WHERE id_pol = ?",
    [codigo],
    function (err, resultado) {
      if (err) {
        return response
          .status(500)
          .json({ erro: "Ocorreram erros ao buscar os dados" });
      }

      // Verificação se a poltrona a ser atualizada foi encontrado no banco de dados
      if (resultado.length === 0) {
        return response.status(404).json({
          erro: `Não foi possível encontrar a poltrona`,
        });
      }

      // Armazenamento dos dados da poltrona existente
      const poltronaExistente = resultado[0];

      // Extração dos dados atualizados da requisição
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

          // Extração do total de poltronas na fileira
          const totalPoltronasNaFileira = resultadoConsulta[0].total;

          if (totalPoltronasNaFileira > 0) {
            return response.status(400).json({
              erro: "Essa poltrona já existe na fileira. Escolha um número único para a fileira.",
            });
          }

          // Consulta SQL para atualizar os dados da poltrona no banco de dados
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

              // Verificação se alguma poltrona foi atualizada
              if (resultadoAtualizacao.affectedRows === 0) {
                return response.status(500).json({
                  erro: "Nenhuma poltrona foi atualizada",
                });
              }

              // Envio dos dados da poltrona atualizada como resposta
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
  // Obtenção do código da poltrona a ser excluída
  const codigo = request.params.codigo;

  // Consulta SQL para excluir a poltrona do banco de dados
  connection.query(
    "DELETE FROM poltrona WHERE id_pol = ?",
    [codigo],
    function (err, resultado) {
      if (err) {
        return response.json({
          erro: "Ocorreu um erro ao tentar excluir a poltrona",
        });
      }

      // Verificação se a poltrona foi encontrada e excluída com sucesso
      if (resultado.affectedRows === 0) {
        return response.json({
          erro: `Poltrona #${codigo} não foi encontrada`,
        });
      }

      // Resposta de sucesso após a exclusão bem-sucedida
      return response.json({
        mensagem: `Poltrona ${codigo} foi deletada com sucesso`,
      });
    }
  );
}

// Module exports: exportar as funções definidas
module.exports = { show, list, create, update, destroy };
