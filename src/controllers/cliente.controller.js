// Importação de módulos
const Validator = require("validatorjs");
const connection = require("../configs/mysql.config");

// Função que deve receber um identificador (código) e retornar o cliente correspondente
function show(req, res) {
  // Extração do código do cliente a partir dos parâmetros da requisição
  const codigo = req.params.codigo;

  // Verificação se o código foi fornecido corretamente
  if (!codigo) {
    return res.status(400).json({ erro: "Identificador não fornecido" });
  }

  // Consulta SQL para obter informações do cliente
  connection.query(
    "SELECT * FROM cliente WHERE id_cli = ?",
    [codigo],
    function (err, resultado) {
      if (err) {
        return res.status(500).json({
          erro: "Ocorreram erros ao tentar salvar a informação",
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

//function list
function list(request, response) {
  // Consulta SQL para obter todos os clientes
  connection.query("SELECT * FROM cliente", function (err, resultado) {
    if (err) {
      return response
        .status(500)
        .json({ erro: "Ocorreram erros ao buscar os dados" });
    }

    // Envio dos dados dos clientes como resposta
    return response.status(200).json({ dados: resultado });
  });
}

//function create
function create(request, response) {
  // Definição das regras de validação utilizando o módulo validatorjs
  const regras = {
    nome: "required|string|min:5", // Deve ser uma string obrigatória com no mínimo 5 caracteres
    sexo: "required|string|min:5", // Deve ser uma string obrigatória com no mínimo 5 caracteres
    data_nascimento: "required|date", // Deve ser uma data obrigatória
    cpf: "required|string|max:100", // Deve ser uma string obrigatória com no máximo 100 caracteres
    rg: "required|string|max:100", // Deve ser uma string obrigatória com no máximo 100 caracteres
    email: "required|email|max:300", // Deve ser um endereço de e-mail obrigatório com no máximo 300 caracteres
    telefone: "string|max:300", // Deve ser uma string opcional com no máximo 300 caracteres
    tipagem_sanguinea: "max:2", // Deve ser uma string opcional com no máximo 2 caracteres
    fator_rh: "max:1", // Deve ser uma string opcional com no máximo 1 caractere
  };

  // Criação de um objeto Validator para validar os dados da requisição
  const validacao = new Validator(request.body, regras);

  if (validacao.fails()) {
    return response.status(400).json(validacao.errors);
  }

  // Extração dos dados da requisição
  const nome = request.body.nome;
  const sexo = request.body.sexo;
  const data_nascimento = request.body.data_nascimento;
  const cpf = request.body.cpf;
  const rg = request.body.rg;
  const email = request.body.email;
  const telefone = request.body.telefone;
  const tipagem_sanguinea = request.body.tipagem_sanguinea;
  const fator_rh = request.body.fator_rh;

  // Consulta SQL para inserir um novo cliente no banco de dados
  connection.query(
    "INSERT INTO cliente (nome, sexo, data_nascimento, cpf, rg, email, telefone, tipagem_sanguinea, fator_rh) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      nome,
      sexo,
      data_nascimento,
      cpf,
      rg,
      email,
      telefone,
      tipagem_sanguinea,
      fator_rh,
    ],
    function (err, resultado) {
      if (err) {
        return response.json({
          erro: "Ocorreram erros ao tentar salvar a informação",
        });
      }

      if (resultado.affectedRows == 0) {
        return response.json({
          erro: `Ocorreram erros ao tentar salvar a informação`,
        });
      }

      // Envio dos dados do cliente criado como resposta
      return response.json({
        nome,
        sexo,
        data_nascimento,
        cpf,
        rg,
        email,
        telefone,
        tipagem_sanguinea,
        fator_rh,
        id: resultado.insertId,
      });
    }
  );
}

//function update
function update(request, response) {
  // Extração do código do cliente a ser atualizado a partir dos parâmetros da requisição
  const codigo = request.params.codigo;

  // Definição das regras de validação
  const regras = {
    nome: "required|string|min:5",
    sexo: "required|string|min:5",
    data_nascimento: "required|date",
    cpf: "required|string|max:100",
    rg: "required|string|max:100",
    email: "required|email|max:300",
    telefone: "string|max:300",
    tipagem_sanguinea: "max:2",
    fator_rh: "max:1",
  };

  // Criação de um objeto Validator para validar os dados da requisição
  const validacao = new Validator(request.body, regras);

  if (validacao.fails()) {
    return response.json(validacao.errors);
  }

  // Consulta SQL para buscar os dados do cliente no banco de dados
  connection.query(
    "SELECT * FROM cliente WHERE id_cli = ?",
    [codigo],
    function (err, resultado) {
      if (err) {
        return response.json({ erro: "Ocorreram erros ao buscar os dados" });
      }

      // Verificação se o cliente a ser atualizado foi encontrado no banco de dados
      if (resultado.length === 0) {
        return response.json({
          erro: `não foi possivel encontrar o contato`,
        });
      }

      // Extração dos dados atualizados da requisição
      const nome = request.body.nome;
      const sexo = request.body.sexo;
      const data_nascimento = request.body.data_nascimento;
      const cpf = request.body.cpf;
      const rg = request.body.rg;
      const email = request.body.email;
      const telefone = request.body.telefone;
      const tipagem_sanguinea = request.body.tipagem_sanguinea;
      const fator_rh = request.body.fator_rh;

      // Consulta SQL para atualizar os dados do cliente no banco de dados
      connection.query(
        "UPDATE cliente SET nome = ?, sexo = ?, data_nascimento = ?, cpf = ?, rg = ?, email = ?, telefone = ?, tipagem_sanguinea = ?, fator_rh = ? WHERE id_cli = ?",
        [
          nome,
          sexo,
          data_nascimento,
          cpf,
          rg,
          email,
          telefone,
          tipagem_sanguinea,
          fator_rh,
          codigo,
        ],
        function (err, resultado) {
          if (err) {
            return response.json({
              erro: "Ocorreu um erro ao tentar atualizar o contato",
            });
          }

          // Verificação se algum cliente foi atualizado
          if (resultado.affectedRows === 0) {
            return response.json({
              erro: "Nenhum contato foi atualizado",
            });
          }

          // Envio dos dados do cliente atualizado como resposta
          return response.json({
            nome,
            sexo,
            data_nascimento,
            cpf,
            rg,
            email,
            telefone,
            tipagem_sanguinea,
            fator_rh,
            id: resultado.insertId,
          });
        }
      );
    }
  );
}

//function destroy
function destroy(request, response) {
  // Obtenção do código do cliente a ser excluído
  const codigo = request.params.codigo;

  // Consulta SQL para excluir o cliente do banco de dados
  connection.query(
    "DELETE FROM cliente WHERE id_cli = ?",
    [codigo],
    function (err, resultado) {
      if (err) {
        return response.json({
          erro: "Ocorreu um erro ao tentar excluir o contato",
        });
      }

      // Verificação se o cliente foi encontrado e excluído com sucesso
      if (resultado.affectedRows === 0) {
        return response.json({
          erro: `Cliente #${codigo} não foi encontrado`,
        });
      }

      // Resposta de sucesso após a exclusão bem-sucedida
      return response.json({
        mensagem: `Cliente ${codigo} foi deletado com sucesso`,
      });
    }
  );
}

// Module exports: exportar as funções definidas
module.exports = { show, list, create, update, destroy };
