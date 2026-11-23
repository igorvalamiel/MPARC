import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../services/api';
import './NovaClassificacao.css';

const CLASSE_COR = {
  Vermelho: 'vermelho',
  Laranja: 'laranja',
  Amarelo: 'amarelo',
  Verde: 'verde',
  Azul: 'azul',
};

export default function NovaClassificacao() {
  const [etapa, setEtapa] = useState('formulario');
  const [boletimId, setBoletimId] = useState('');
  const [fluxogramas, setFluxogramas] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const [fluxogramaAtual, setFluxogramaAtual] = useState(null);
  const [indiceNivel, setIndiceNivel] = useState(0);
  const [resultado, setResultado] = useState(null);

  const [salvando, setSalvando] = useState(false);
  const [erroSalvar, setErroSalvar] = useState('');
  const [salvo, setSalvo] = useState(false);

  // Busca a lista de fluxogramas assim que a pessoa chega nessa etapa
  useEffect(() => {
    if (etapa !== 'escolha-fluxograma') return;

    setCarregando(true);
    api.getFluxogramas()
      .then(setFluxogramas)
      .catch((err) => setErro(err.message))
      .finally(() => setCarregando(false));
  }, [etapa]);

  // Salva a classificação assim que o resultado é confirmado
  useEffect(() => {
    if (etapa !== 'resultado') return;

    setSalvando(true);
    setErroSalvar('');

    api.criarClassificacao({
      boletimId: boletimId || null,
      fluxograma: resultado.fluxograma,
      cor: resultado.cor,
      discriminador: resultado.discriminador,
    })
      .then(() => setSalvo(true))
      .catch((err) => setErroSalvar(err.message))
      .finally(() => setSalvando(false));
  }, [etapa]);

  function handleSubmit(e) {
    e.preventDefault();
    setEtapa('escolha-fluxograma');
  }

  async function escolherFluxograma(id) {
    setCarregando(true);
    try {
      const fluxograma = await api.getFluxograma(id);
      setFluxogramaAtual(fluxograma);
      setIndiceNivel(0);
      setEtapa('wizard');
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  function escolherDiscriminador(nivel, discriminador) {
    setResultado({
      fluxograma: fluxogramaAtual.nome,
      cor: nivel.cor,
      discriminador,
    });
    setEtapa('resultado');
  }

  function nenhumDesses() {
    const niveis = fluxogramaAtual.niveis;
    const ehUltimoNivel = indiceNivel === niveis.length - 1;

    if (ehUltimoNivel) {
      setEtapa('sem-classificacao');
    } else {
      setIndiceNivel((i) => i + 1);
    }
  }

  function usarOutroFluxograma() {
    setFluxogramaAtual(null);
    setIndiceNivel(0);
    setEtapa('escolha-fluxograma');
  }

  return (
    <div className="nc-screen">
      <header className="nc-topbar">
        <Link to="/" className="nc-wordmark">MPARC</Link>
        <Link to="/" className="nc-cancelar">Cancelar</Link>
      </header>

      <main className="nc-main">
        {etapa === 'formulario' && (
          <form className="nc-card" onSubmit={handleSubmit}>
            <h1>Nova classificação</h1>
            <p className="nc-subtitle">Preencha o que tiver disponível pra começar.</p>

            <label className="field">
              <span>ID do paciente (opcional)</span>
              <input
                value={boletimId}
                onChange={(e) => setBoletimId(e.target.value)}
              />
            </label>

            <button type="submit" className="nc-btn-primary">Continuar</button>
          </form>
        )}

        {etapa === 'escolha-fluxograma' && (
          <div className="nc-card nc-card-wide">
            <h1>Escolha o fluxograma</h1>
            {carregando && <p className="nc-info">Carregando...</p>}
            {erro && <p className="nc-erro">{erro}</p>}

            <div className="nc-grade-fluxogramas">
              {fluxogramas.map((f) => (
                <button
                  key={f.id}
                  className="nc-fluxograma-btn"
                  onClick={() => escolherFluxograma(f.id)}
                >
                  {f.nome}
                </button>
              ))}
            </div>
          </div>
        )}

        {etapa === 'wizard' && (() => {
          const nivel = fluxogramaAtual.niveis[indiceNivel];
          const classeCor = CLASSE_COR[nivel.cor];
          const semDiscriminadores = nivel.discriminadores.length === 0;

          return (
            <div className="nc-card nc-card-wide">
              <h1>{fluxogramaAtual.nome}</h1>
              <div className={`nc-faixa nc-faixa-${classeCor}`}>
                Nível avaliado: {nivel.cor}
              </div>

              {semDiscriminadores ? (
                <>
                  <p className="nc-info">Nenhum discriminador anterior se aplicou.</p>
                  <div className="nc-acoes-finais">
                    <button
                      className="nc-btn-primary"
                      onClick={() => escolherDiscriminador(nivel, null)}
                    >
                      Confirmar classificação {nivel.cor}
                    </button>
                    <button className="nc-btn-secundario" onClick={usarOutroFluxograma}>
                      Usar outro fluxograma
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <ul className="nc-lista-discriminadores">
                    {nivel.discriminadores.map((d) => (
                      <li key={d}>
                        <button onClick={() => escolherDiscriminador(nivel, d)}>
                          {d}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button className="nc-btn-fantasma" onClick={nenhumDesses}>
                    Nenhum desses se aplica
                  </button>
                </>
              )}
            </div>
          );
        })()}

        {etapa === 'sem-classificacao' && (() => {
          const nivel = fluxogramaAtual.niveis[indiceNivel];
          const classeCor = CLASSE_COR[nivel.cor];

          return (
            <div className="nc-card">
              <h1>{fluxogramaAtual.nome}</h1>
              <p className="nc-info">Nenhum discriminador se aplicou em nenhum nível verificado.</p>
              <div className="nc-acoes-finais">
                <button
                  className={`nc-btn-primary nc-btn-${classeCor}`}
                  onClick={() => escolherDiscriminador(nivel, null)}
                >
                  Confirmar classificação {nivel.cor}
                </button>
                <button className="nc-btn-secundario" onClick={usarOutroFluxograma}>
                  Usar outro fluxograma
                </button>
              </div>
            </div>
          );
        })()}

        {etapa === 'resultado' && (
          <div className={`nc-card nc-resultado nc-resultado-${CLASSE_COR[resultado.cor]}`}>
            <span className="nc-resultado-cor">{resultado.cor}</span>
            <h1>Classificação registrada</h1>
            <p className="nc-info">Fluxograma: {resultado.fluxograma}</p>
            <p className="nc-info">
              Motivo: {resultado.discriminador || 'Nenhum discriminador se aplicou'}
            </p>

            {salvando && <p className="nc-info">Salvando…</p>}
            {salvo && <p className="nc-info">✓ Salvo com sucesso</p>}
            {erroSalvar && <p className="nc-info">Erro ao salvar: {erroSalvar}</p>}

            <Link to="/" className="nc-btn-secundario">Voltar ao início</Link>
          </div>
        )}
      </main>
    </div>
  );
}
