const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const cron = require('node-cron');
const { exportarClassificacoesDaSemana } = require('./exportarSemanal');

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

app.get('/me', autenticar, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, profissional_id, nome, numeroconselho, cpf FROM usuarios WHERE id = $1',
      [req.usuario.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

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

// toda segunda-feira, às 00:05
cron.schedule('* * * * *', () => {
  exportarClassificacoesDaSemana(pool).catch(console.error);
});

// --------------------------------------------------------------------
// Importando arquivo dos fluxogramas

const fluxogramas = require('./data/fluxogramas.json');

// Lista leve: só id e nome, pra tela de "escolha o fluxograma"
app.get('/fluxogramas', autenticar, (req, res) => {
  const lista = fluxogramas.map(({ id, nome }) => ({ id, nome }));
  res.json(lista);
});

// Um fluxograma completo, com os níveis e discriminadores
app.get('/fluxogramas/:id', autenticar, (req, res) => {
  const fluxograma = fluxogramas.find((f) => f.id === req.params.id);

  if (!fluxograma) {
    return res.status(404).json({ error: 'Fluxograma não encontrado' });
  }

  res.json(fluxograma);
});

app.get('/classificacoes', autenticar, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.id, c.boletim_id, c.classificacao, c.caminho, c.criado_em,
              u.nome AS profissional_nome
       FROM classificacoes c
       JOIN usuarios u ON u.id = c.profissional_id::integer
       WHERE c.criado_em >= NOW() - INTERVAL '7 days'
       ORDER BY c.criado_em DESC`
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar classificações' });
  }
});

app.post('/classificacoes', autenticar, async (req, res) => {
  const { boletimId, fluxograma, cor, discriminador } = req.body;

  if (!fluxograma || !cor) {
    return res.status(400).json({ error: 'Dados da classificação incompletos' });
  }

  const caminho = discriminador
    ? `${fluxograma} > ${cor} > ${discriminador}`
    : `${fluxograma} > ${cor}`;

  try {
    const { rows } = await pool.query(
      `INSERT INTO classificacoes (profissional_id, boletim_id, classificacao, caminho)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [String(req.usuario.id), boletimId || null, cor, caminho]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao salvar classificação' });
  }
});