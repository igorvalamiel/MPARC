const fs = require('fs');
const path = require('path');
const { paraCsv } = require('./utils/csv');

async function exportarClassificacoesDaSemana(pool) {
  const { rows } = await pool.query(
    `SELECT c.id, c.boletim_id, c.classificacao, c.caminho, c.criado_em,
            u.nome AS profissional_nome
     FROM classificacoes c
     JOIN usuarios u ON u.id = c.profissional_id::integer
     WHERE c.criado_em >= NOW() - INTERVAL '7 days'
     ORDER BY c.criado_em`
  );

  const csv = paraCsv(rows, [
    { chave: 'id', titulo: 'ID' },
    { chave: 'boletim_id', titulo: 'ID do paciente' },
    { chave: 'classificacao', titulo: 'Classificação' },
    { chave: 'caminho', titulo: 'Caminho' },
    { chave: 'profissional_nome', titulo: 'Profissional' },
    { chave: 'criado_em', titulo: 'Data/hora' },
  ]);

  const pasta = path.join(__dirname, 'exports');
  fs.mkdirSync(pasta, { recursive: true });

  const hoje = new Date().toISOString().slice(0, 10);
  const arquivo = path.join(pasta, `classificacoes_${hoje}.csv`);

  fs.writeFileSync(arquivo, csv, 'utf-8');
  console.log(`CSV exportado: ${arquivo}`);
}

module.exports = { exportarClassificacoesDaSemana };