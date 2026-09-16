import { useEffect, useState } from 'react';
import * as api from '../services/api';

export default function NovaClassificacao() {
  const [etapa, setEtapa] = useState('formulario');
  const [boletimId, setBoletimId] = useState('');
  const [fluxogramas, setFluxogramas] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const [fluxogramaAtual, setFluxogramaAtual] = useState(null);
  const [indiceNivel, setIndiceNivel] = useState(0);
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    if (etapa !== 'escolha-fluxograma') return;

    setCarregando(true);
    api.getFluxogramas()
      .then(setFluxogramas)
      .catch((err) => setErro(err.message))
      .finally(() => setCarregando(false));
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

  function avancarNivel() {
    setIndiceNivel((i) => i + 1);
  }

  function usarOutroFluxograma() {
    setFluxogramaAtual(null);
    setIndiceNivel(0);
    setEtapa('escolha-fluxograma');
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

  if (etapa === 'formulario') {
    return (
      <form onSubmit={handleSubmit}>
        <h1>Nova classificação</h1>
        <label>
          ID do paciente (opcional)
          <input value={boletimId} onChange={(e) => setBoletimId(e.target.value)} />
        </label>
        <button type="submit">Continuar</button>
      </form>
    );
  }

  if (etapa === 'escolha-fluxograma') {
    if (carregando) return <p>Carregando...</p>;
    if (erro) return <p>{erro}</p>;

    return (
      <div>
        <h1>Escolha o fluxograma</h1>
        {fluxogramas.map((f) => (
          <button key={f.id} onClick={() => escolherFluxograma(f.id)}>
            {f.nome}
          </button>
        ))}
      </div>
    );
  }

  if (etapa === 'wizard') {
    const nivel = fluxogramaAtual.niveis[indiceNivel];

    // nível sem discriminadores (ex: Azul) é sempre o fim de linha automático
    if (nivel.discriminadores.length === 0) {
      return (
        <div>
          <h1>{fluxogramaAtual.nome}</h1>
          <p>Nenhum discriminador anterior se aplicou.</p>
          <button onClick={() => escolherDiscriminador(nivel, null)}>
            Confirmar classificação {nivel.cor}
          </button>
          <button onClick={usarOutroFluxograma}>Usar outro fluxograma</button>
        </div>
      );
    }

    return (
      <div>
        <h1>{fluxogramaAtual.nome}</h1>
        <p>Nível: {nivel.cor}</p>

        {nivel.discriminadores.map((d) => (
          <button key={d} onClick={() => escolherDiscriminador(nivel, d)}>
            {d}
          </button>
        ))}

        <button onClick={nenhumDesses}>Nenhum desses se aplica</button>
      </div>
    );
  }

  if (etapa === 'sem-classificacao') {
    const nivel = fluxogramaAtual.niveis[indiceNivel];

    return (
      <div>
        <h1>{fluxogramaAtual.nome}</h1>
        <p>Nenhum discriminador se aplicou em nenhum nível verificado.</p>
        <button onClick={() => escolherDiscriminador(nivel, null)}>
          Confirmar classificação {nivel.cor}
        </button>
        <button onClick={usarOutroFluxograma}>Usar outro fluxograma</button>
      </div>
    );
  }

  if (etapa === 'resultado') {
    return (
      <div>
        <h1>Classificação: {resultado.cor}</h1>
        <p>Fluxograma: {resultado.fluxograma}</p>
        <p>Motivo: {resultado.discriminador || 'Nenhum discriminador anterior se aplicou'}</p>
      </div>
    );
  }

  return null;
}
