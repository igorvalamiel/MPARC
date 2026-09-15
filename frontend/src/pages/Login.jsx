import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

function Login() {
  const { usuario, carregando, entrar } = useAuth();
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  // já logado? não faz sentido ver o form de novo
  if (!carregando && usuario) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault(); // impede o comportamento padrão do form (recarregar a página)
    setErro('');
    setEnviando(true);

    try {
      await entrar(cpf, senha);
      // se deu certo, o "usuario" no context muda,
      // e o <Navigate> lá em cima redireciona sozinho
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="login-screen">
      <aside className="login-brand">
        <span className="login-wordmark">MPARC</span>
        <p className="login-tagline">
          Classificação de risco em pronto atendimento.
        </p>
        <ul className="login-legend">
          <li className="dot dot-azul" />
          <li className="dot dot-verde" />
          <li className="dot dot-amarelo" />
          <li className="dot dot-laranja" />
          <li className="dot dot-vermelho" />
        </ul>
      </aside>

      <main className="login-panel">
        <form className="login-form" onSubmit={handleSubmit}>
          <h1>Entrar</h1>
          <p className="login-subtitle">Acesse com seu CPF e senha.</p>

          <label className="field">
            <span>CPF</span>
            <input
              type="text"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Senha</span>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </label>

          {erro && <p className="login-error">{erro}</p>}

          <button type="submit" disabled={enviando}>
            {enviando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </main>
    </div>
  );
}

export default Login
