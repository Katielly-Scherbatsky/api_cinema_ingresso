const Validator = require("validatorjs");
const connection = require("../configs/mysql.config");

// Função que deve receber um identificador (código) e retornar o filme correspondente
function show(req, res) {
  const codigo = req.params.codigo;

  if (!codigo) {
    return res.status(400).json({ erro: "Identificador não fornecido" });
  }

  connection.query(
    "SELECT * FROM filme WHERE id_fil = ?",
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
  connection.query("SELECT * FROM filme", function (err, resultado) {
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
    titulo: "required|string|max:300",
    sinopse: "required|string|max:500",
    atores: "required|string|max:300",
    diretor: "required|string|max:300",
    genero: "required|string|max:300",
    classificacao_indicativa: "required|string|max:300",
    duracao: "required",
  };

  const validacao = new Validator(request.body, regras);

  if (validacao.fails()) {
    return response.status(400).json(validacao.errors);
  }

  const {
    titulo,
    sinopse,
    atores,
    diretor,
    genero,
    classificacao_indicativa,
    duracao,
  } = request.body;

  // Verifica se o filme já existe no sistema pelo título
  connection.query(
    "SELECT COUNT(*) as total FROM filme WHERE titulo = ?",
    [titulo],
    function (err, resultadoConsulta) {
      if (err) {
        return response.status(500).json({
          erro: "Ocorreram erros ao verificar a existência do filme",
        });
      }

      const totalFilmes = resultadoConsulta[0].total;

      if (totalFilmes > 0) {
        return response.status(400).json({
          erro: "Este filme já existe no sistema. Escolha um título único.",
        });
      }

      // Se o filme não existir, realiza a inserção
      connection.query(
        "INSERT INTO filme (titulo, sinopse, atores, diretor, genero, classificacao_indicativa, duracao) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          titulo,
          sinopse,
          atores,
          diretor,
          genero,
          classificacao_indicativa,
          duracao,
        ],
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
            titulo,
            sinopse,
            atores,
            diretor,
            genero,
            classificacao_indicativa,
            duracao,
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
    titulo: "required|string|max:300",
    sinopse: "required|string|max:500",
    atores: "required|string|max:300",
    diretor: "required|string|max:300",
    genero: "required|string|max:300",
    classificacao_indicativa: "required|string|max:300",
    duracao: "required",
  };

  const validacao = new Validator(request.body, regras);

  if (validacao.fails()) {
    return response.status(400).json(validacao.errors);
  }

  // Buscar o dado no BD
  connection.query(
    "SELECT * FROM filme WHERE id_fil = ?",
    [codigo],
    function (err, resultado) {
      if (err) {
        return response
          .status(500)
          .json({ erro: "Ocorreram erros ao buscar os dados" });
      }

      if (resultado.length === 0) {
        return response.status(404).json({
          erro: `Não foi possível encontrar o filme`,
        });
      }

      const {
        titulo,
        sinopse,
        atores,
        diretor,
        genero,
        classificacao_indicativa,
        duracao,
      } = request.body;

      // Atualizar a filme no BD
      connection.query(
        "UPDATE filme SET titulo = ?, sinopse = ?, atores = ?,  diretor = ?,  genero = ?,  classificacao_indicativa = ?,  duracao = ? WHERE id_fil = ?",
        [
          titulo,
          sinopse,
          atores,
          diretor,
          genero,
          classificacao_indicativa,
          duracao,
          codigo,
        ],
        function (err, resultadoUpdate) {
          if (err) {
            return response.status(500).json({
              erro: "Ocorreu um erro ao tentar atualizar o filme",
            });
          }

          if (resultadoUpdate.affectedRows === 0) {
            return response.status(500).json({
              erro: "Nenhum filme foi atualizado",
            });
          }

          // Retorna a resposta JSON aqui
          return response.status(200).json({
            titulo,
            sinopse,
            atores,
            diretor,
            genero,
            classificacao_indicativa,
            duracao,
            id: codigo,
          });
        }
      );
    }
  );
}

//function destroy
function destroy(request, response) {
  const codigo = request.params.codigo;

  connection.query(
    "DELETE FROM filme WHERE id_fil = ?",
    [codigo],
    function (err, resultado) {
      if (err) {
        return response.json({
          erro: "Ocorreu um erro ao tentar excluir o filme",
        });
      }

      if (resultado.affectedRows === 0) {
        return response.json({
          erro: `Filme #${codigo} não foi encontrado`,
        });
      }

      return response.json({
        mensagem: `Filme ${codigo} foi deletado com sucesso`,
      });
    }
  );
}

// Module exports sempre no final do arquivo
module.exports = { show, list, create, update, destroy };
