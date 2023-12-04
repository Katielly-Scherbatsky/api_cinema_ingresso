const Validator = require("validatorjs");
const connection = require("../configs/mysql.config");

// Função que deve receber um identificador (código) e retornar o cliente correspondente
function show(req, res) {
  const codigo = req.params.codigo;

  if (codigo == undefined) {
    return res.json({ erro: "Ocorreram erros ao buscar a informação" });
  }

  connection.query(
    "SELECT * FROM cliente WHERE id_cli = ?",
    [codigo],
    function (err, resultado) {
      if (err) {
        return res.json({
          erro: "Ocorreram erros ao tentar salvar a informação",
        });
      }

      if (resultado.length == 0) {
        return res.json({ erro: `O código #${codigo} não foi encontrado!` });
      }

      return res.json(resultado[0]);
    }
  );
}

//function list
function list(request, response) {
  connection.query("SELECT * FROM cliente", function (err, resultado) {
    if (err) {
      return response.json({ erro: "Ocorreram erros ao buscar os dados" });
    }
    return response.json({ dados: resultado });
  });
}

//function create
function create(request, response) {
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

  const validacao = new Validator(request.body, regras);

  if (validacao.fails()) {
    return response.json(validacao.errors);
  }

  const nome = request.body.nome;
  const sexo = request.body.sexo;
  const data_nascimento = request.body.data_nascimento;
  const cpf = request.body.cpf;
  const rg = request.body.rg;
  const email = request.body.email;
  const telefone = request.body.telefone;
  const tipagem_sanguinea = request.body.tipagem_sanguinea;
  const fator_rh = request.body.fator_rh;

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
  const codigo = request.params.codigo;

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

  const validacao = new Validator(request.body, regras);

  if (validacao.fails()) {
    return response.json(validacao.errors);
  }

  //buscar o dado no bd
  connection.query(
    "SELECT * FROM cliente WHERE id_cli = ?",
    [codigo],
    function (err, resultado) {
      if (err) {
        return response.json({ erro: "Ocorreram erros ao buscar os dados" });
      }

      if (resultado.length === 0) {
        return response.json({
          erro: `não foi possivel encontrar o contato`,
        });
      }

      const nome = request.body.nome;
      const sexo = request.body.sexo;
      const data_nascimento = request.body.data_nascimento;
      const cpf = request.body.cpf;
      const rg = request.body.rg;
      const email = request.body.email;
      const telefone = request.body.telefone;
      const tipagem_sanguinea = request.body.tipagem_sanguinea;
      const fator_rh = request.body.fator_rh;

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

          if (resultado.affectedRows === 0) {
            return response.json({
              erro: "Nenhum contato foi atualizado",
            });
          }
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
  const codigo = request.params.codigo;

  connection.query(
    "DELETE FROM cliente WHERE id_cli = ?",
    [codigo],
    function (err, resultado) {
      if (err) {
        return response.json({
          erro: "Ocorreu um erro ao tentar excluir o contato",
        });
      }

      if (resultado.affectedRows === 0) {
        return response.json({
          erro: `Cliente #${codigo} não foi encontrado`,
        });
      }

      return response.json({
        mensagem: `Cliente ${codigo} foi deletado com sucesso`,
      });
    }
  );
}

// Module exports sempre no final do arquivo
module.exports = { show, list, create, update, destroy };
