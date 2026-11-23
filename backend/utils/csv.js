function escapar(valor) {
  const texto = valor === null || valor === undefined ? '' : String(valor);

  if (/[",\n]/.test(texto)) {
    return `"${texto.replace(/"/g, '""')}"`;
  }

  return texto;
}

function paraCsv(linhas, colunas) {
  const cabecalho = colunas.map((c) => escapar(c.titulo)).join(',');

  const corpo = linhas
    .map((linha) => colunas.map((c) => escapar(linha[c.chave])).join(','))
    .join('\n');

  return `${cabecalho}\n${corpo}`;
}

module.exports = { paraCsv };