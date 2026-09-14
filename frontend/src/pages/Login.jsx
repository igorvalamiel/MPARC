import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
    <form onSubmit={handleSubmit}>
      <h1>Entrar</h1>

      <label>
        CPF
        <input
          type="text"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          required
        />
      </label>

      <label>
        Senha
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
      </label>

      {erro && <p style={{ color: 'red' }}>{erro}</p>}

      <button type="submit" disabled={enviando}>
        {enviando ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  );
}

export default Login
