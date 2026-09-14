const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Configuração da conexão com o banco
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  port: 5432,
});

// --------------------------------------------------------------------
// Adicionando sistema de login

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'troque-este-segredo-em-producao';

app.post('/login', async (req, res) => {
  // Passo 1: pega o que o front mandou no corpo da requisição
  const { cpf, senha } = req.body;

  // valida que os dois campos vieram preenchidos
  if (!cpf || !senha) {
    return res.status(400).json({ error: 'Informe CPF e senha' });
  }

  try {
    // Passo 2: busca o usuário pelo CPF
    const { rows } = await pool.query(
      'SELECT * FROM usuarios WHERE cpf = $1',
      [cpf]
    );

    // Passo 3: CPF não encontrado
    if (rows.length === 0) {
      return res.status(401).json({ error: 'CPF ou senha inválidos' });
    }

    const usuario = rows[0];

    // Passo 4: compara a senha digitada com o hash salvo
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    // Passo 5: senha errada — mesma mensagem genérica do passo 3
    if (!senhaCorreta) {
      return res.status(401).json({ error: 'CPF ou senha inválidos' });
    }

    // Passo 6: gera o token e devolve
    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, usuario: { id: usuario.id, nome: usuario.nome, cpf: usuario.cpf } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao efetuar login' });
  }
});

// --------------------------------------------------------------------
// Adicionando sistema middleware que verifica o token que retornou da verificação do banco de dados

function autenticar(req, res, next) {
  // Passo 1: pega o header Authorization
  const authHeader = req.headers.authorization;

  // Passo 2: verifica se veio e se está no formato certo
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não informado' });
  }

  // Passo 3: separa "Bearer" do token de verdade
  const token = authHeader.split(' ')[1];

  try {
    // Passo 4: verifica se o token é válido e não expirou
    const payload = jwt.verify(token, JWT_SECRET);

    // Passo 5: guarda os dados do usuário na própria requisição,
    // pra rota seguinte poder usar
    req.usuario = payload;

    // Passo 6: deixa passar pra rota
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

//--------------------------------------------------------------------

// Rota de teste para buscar usuários
app.get('/usuarios', autenticar, async (req, res) => {
  // esse código só roda se "autenticar" chamou next()
  try {
    const { rows } = await pool.query('SELECT id, profissional_id, nome, numeroconselho, cpf FROM usuarios;');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar usuários no banco' });
  }
});

// Inicialização do servidor
app.listen(3000, () => {
  console.log('API rodando na porta 3000');
});


