const Validator = require("validatorjs");
const connection = require("../configs/mysql.config");

// Função que deve receber um identificador (código) e retornar o filme correspondente
function show(req, res) {
  // Extração do código do filme a partir dos parâmetros da requisição
  const codigo = req.params.codigo;

  // Verificação se o código foi fornecido corretamente
  if (!codigo) {
    return res.status(400).json({ erro: "Identificador não fornecido" });
  }

  // Consulta SQL para obter informações do filme
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

      // Envio das informações do cliente como resposta
      return res.status(200).json(resultado[0]);
    }
  );
}

// Function list
function list(request, response) {
  // Consulta SQL para obter todos os filmes
  connection.query("SELECT * FROM filme", function (err, resultado) {
    if (err) {
      return response
        .status(500)
        .json({ erro: "Ocorreram erros ao buscar os dados" });
    }

    // Envio dos dados dos filmes como resposta
    return response.status(200).json({ dados: resultado });
  });
}

// Function create
function create(request, response) {
  // Definição das regras de validação utilizando o módulo validatorjs
  const regras = {
    titulo: "required|string|max:300",
    sinopse: "required|string|max:500",
    atores: "required|string|max:300",
    diretor: "required|string|max:300",
    genero: "required|string|max:300",
    classificacao_indicativa: "required|string|max:300",
    duracao: "required",
  };

  // Criação de um objeto Validator para validar os dados da requisição
  const validacao = new Validator(request.body, regras);

  if (validacao.fails()) {
    return response.status(400).json(validacao.errors);
  }

  // Extração dos dados da requisição
  const {
    titulo,
    sinopse,
    atores,
    diretor,
    genero,
    classificacao_indicativa,
    duracao,
  } = request.body;

  // Consulta SQL para verificar a existência do filme pelo título
  connection.query(
    "SELECT COUNT(*) as total FROM filme WHERE titulo = ?",
    [titulo],
    function (err, resultadoConsulta) {
      if (err) {
        return response.status(500).json({
          erro: "Ocorreram erros ao verificar a existência do filme",
        });
      }

      // Verificação se o filme já existe no sistema
      const totalFilmes = resultadoConsulta[0].total;

      if (totalFilmes > 0) {
        return response.status(400).json({
          erro: "Este filme já existe no sistema. Escolha um título único.",
        });
      }

      // Consulta SQL para inserir um novo filme no banco de dados
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

          // Verificação se algum filme foi inserido
          if (resultadoInsercao.affectedRows === 0) {
            return response.status(500).json({
              erro: "Ocorreram erros ao tentar salvar a informação",
            });
          }

          // Envio dos dados do filme criado como resposta
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
  // Extração do código do filme a ser atualizado a partir dos parâmetros da requisição
  const codigo = request.params.codigo;

  // Definição das regras de validação
  const regras = {
    titulo: "required|string|max:300",
    sinopse: "required|string|max:500",
    atores: "required|string|max:300",
    diretor: "required|string|max:300",
    genero: "required|string|max:300",
    classificacao_indicativa: "required|string|max:300",
    duracao: "required",
  };

  // Criação de um objeto Validator para validar os dados da requisição
  const validacao = new Validator(request.body, regras);

  if (validacao.fails()) {
    return response.status(400).json(validacao.errors);
  }

  // Extração do título da requisição
  const { titulo } = request.body;

  // Consulta SQL para verificar a existência do filme pelo título, excluindo o filme a ser atualizado pelo seu código
  connection.query(
    "SELECT COUNT(*) as total FROM filme WHERE titulo = ? AND id_fil <> ?",
    [titulo, codigo],
    function (err, resultadoConsulta) {
      if (err) {
        return response.status(500).json({
          erro: "Ocorreram erros ao verificar a existência do filme",
        });
      }

      // Verificação se o filme já existe no sistema
      const totalFilmes = resultadoConsulta[0].total;

      if (totalFilmes > 0) {
        return response.status(400).json({
          erro: "Já existe um filme com este título. Escolha um título único.",
        });
      }

      // Consulta SQL para buscar os dados do filme no banco de dados
      connection.query(
        "SELECT * FROM filme WHERE id_fil = ?",
        [codigo],
        function (err, resultado) {
          if (err) {
            return response
              .status(500)
              .json({ erro: "Ocorreram erros ao buscar os dados" });
          }

          // Verificação se o filme a ser atualizado foi encontrado no banco de dados
          if (resultado.length === 0) {
            return response.status(404).json({
              erro: `Não foi possível encontrar o filme`,
            });
          }

          // Extração dos dados atualizados da requisição
          const {
            sinopse,
            atores,
            diretor,
            genero,
            classificacao_indicativa,
            duracao,
          } = request.body;

          // Consulta SQL para atualizar os dados do filme no banco de dados
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

              // Verificação se algum filme foi atualizado
              if (resultadoUpdate.affectedRows === 0) {
                return response.status(500).json({
                  erro: "Nenhum filme foi atualizado",
                });
              }

              // Envio dos dados do filme atualizado como resposta
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
  );
}

//function destroy
function destroy(request, response) {
  // // Obtenção do código do filme a ser excluído
  const codigo = request.params.codigo;

  // Consulta SQL para excluir o filme do banco de dados
  connection.query(
    "DELETE FROM filme WHERE id_fil = ?",
    [codigo],
    function (err, resultado) {
      if (err) {
        return response.json({
          erro: "Ocorreu um erro ao tentar excluir o filme",
        });
      }

      // Verificação se o filme foi encontrado e excluído com sucesso
      if (resultado.affectedRows === 0) {
        return response.json({
          erro: `Filme #${codigo} não foi encontrado`,
        });
      }

      // Resposta de sucesso após a exclusão bem-sucedida
      return response.json({
        mensagem: `Filme ${codigo} foi deletado com sucesso`,
      });
    }
  );
}

// Module exports sempre no final do arquivo
module.exports = { show, list, create, update, destroy };
