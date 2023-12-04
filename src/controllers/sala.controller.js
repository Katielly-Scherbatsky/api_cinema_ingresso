const Validator = require("validatorjs");
const connection = require("../configs/mysql.config");

// Função que deve receber um identificador (código) e retornar a sala correspondente
function show(req, res) {
  // Extração do código da sala a partir dos parâmetros da requisição
  const codigo = req.params.codigo;

  // Verificação se o código foi fornecido corretamente
  if (!codigo) {
    return res.status(400).json({ erro: "Identificador não fornecido" });
  }

  // Consulta SQL para obter informações da sala
  connection.query(
    "SELECT * FROM sala WHERE id_sal = ?",
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
  // Consulta SQL para obter todas as salas
  connection.query("SELECT * FROM sala", function (err, resultado) {
    if (err) {
      return response
        .status(500)
        .json({ erro: "Ocorreram erros ao buscar os dados" });
    }

    // Envio dos dados das salas como resposta
    return response.status(200).json({ dados: resultado });
  });
}

// Function create
function create(request, response) {
  // Definição das regras de validação utilizando o módulo validatorjs
  const regras = {
    nome: "required|string|min:5|max:300",
    numero: "required|integer",
    capacidade: "required|integer|max:300",
  };

  // Criação de um objeto Validator para validar os dados da requisição
  const validacao = new Validator(request.body, regras);

  if (validacao.fails()) {
    return response.status(400).json(validacao.errors);
  }

  // Extração dos dados da requisição
  const { nome, numero, capacidade } = request.body;

  // Consulta SQL para inserir uma nova sala no banco de dados
  connection.query(
    "INSERT INTO sala (nome, numero, capacidade) VALUES (?, ?, ?)",
    [nome, numero, capacidade],
    function (err, resultado) {
      if (err) {
        return response.status(500).json({
          erro: "Ocorreram erros ao tentar salvar a informação",
        });
      }

      // Verificação se alguma sala foi inserida
      if (resultado.affectedRows === 0) {
        return response.status(500).json({
          erro: "Ocorreram erros ao tentar salvar a informação",
        });
      }

      // Envio dos dados da sala criada como resposta
      return response.status(201).json({
        nome,
        numero,
        capacidade,
        id: resultado.insertId,
      });
    }
  );
}

// Function update
function update(request, response) {
  // Extração do código da sala a ser atualizada a partir dos parâmetros da requisição
  const codigo = request.params.codigo;

  // Definição das regras de validação
  const regras = {
    nome: "required|string|min:5|max:300",
    numero: "required|integer",
    capacidade: "required|integer|max:300",
  };

  // Criação de um objeto Validator para validar os dados da requisição
  const validacao = new Validator(request.body, regras);

  if (validacao.fails()) {
    return response.status(400).json(validacao.errors);
  }

  // Consulta SQL para buscar os dados da sala no banco de dados
  connection.query(
    "SELECT * FROM sala WHERE id_sal = ?",
    [codigo],
    function (err, resultado) {
      if (err) {
        return response
          .status(500)
          .json({ erro: "Ocorreram erros ao buscar os dados" });
      }

      // Verificação se a sala a ser atualizada foi encontrado no banco de dados
      if (resultado.length === 0) {
        return response.status(404).json({
          erro: `Não foi possível encontrar a sala`,
        });
      }

      // Extração dos dados atualizados da requisição
      const { nome, numero, capacidade } = request.body;

      // Consulta SQL para atualizar os dados da sala no banco de dados
      connection.query(
        "UPDATE sala SET nome = ?, numero = ?, capacidade = ? WHERE id_sal = ?",
        [nome, numero, capacidade, codigo],
        function (err, resultadoUpdate) {
          if (err) {
            return response.status(500).json({
              erro: "Ocorreu um erro ao tentar atualizar a sala",
            });
          }

          // Verificação se alguma sala foi atualizada
          if (resultadoUpdate.affectedRows === 0) {
            return response.status(500).json({
              erro: "Nenhuma sala foi atualizada",
            });
          }

          // Envio dos dados da sala atualizada como resposta
          return response.status(200).json({
            nome,
            numero,
            capacidade,
            id: codigo,
          });
        }
      );
    }
  );
}

//function destroy
function destroy(request, response) {
  // Obtenção do código da sala a ser excluída
  const codigo = request.params.codigo;

  // Consulta SQL para excluir a sala do banco de dados
  connection.query(
    "DELETE FROM sala WHERE id_sal = ?",
    [codigo],
    function (err, resultado) {
      if (err) {
        return response.json({
          erro: "Ocorreu um erro ao tentar excluir a sala",
        });
      }

      // Verificação se a sala foi encontrada e excluída com sucesso
      if (resultado.affectedRows === 0) {
        return response.json({
          erro: `Sala #${codigo} não foi encontrado`,
        });
      }

      // Resposta de sucesso após a exclusão bem-sucedida
      return response.json({
        mensagem: `Sala ${codigo} foi deletado com sucesso`,
      });
    }
  );
}

// Module exports: exportar as funções definidas
module.exports = { show, list, create, update, destroy };
