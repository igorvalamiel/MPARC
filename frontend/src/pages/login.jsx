import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/auth";
import logo from "../images/mparc_short_logo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const [tentativas, setTentativas] = useState(0);
  const BLOQUEIO_TEMPORARIO = 3;

  function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  async function handleLogin(e) {
    e.preventDefault();

    if (tentativas >= BLOQUEIO_TEMPORARIO) {
      setErro("Muitas tentativas. Aguarde alguns minutos.");
      return;
    }

    setErro("");

    if (!validarEmail(email)) {
      setErro("Formato de email inválido.");
      return;
    }

    setCarregando(true);

    try {
      await login(email, senha);
      navigate("/triagem");
    } catch (err) {
      setTentativas((prev) => prev + 1); // ← Faltou incrementar!
      
      if (err.response?.status === 401) {
        setErro("Email ou senha incorretos.");
      } else if (err.response?.status === 429) {
        setErro("Muitas tentativas. Tente novamente mais tarde.");
      } else if (err.response?.status === 403) {
        setErro("Conta bloqueada. Entre em contato com o suporte.");
      } else {
        setErro("Erro de conexão. Verifique sua internet.");
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-sm">
        {/* Logo / Título */}
        <div className="mb-8 text-center">
          <img src={logo} alt="Logo MPARC" className="w-40 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800">MPARC</h1>
          <p className="text-sm text-slate-500 mt-1">Login para Administradores</p>
        </div>

        {/* ÚNICO formulário com aria-label */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4" aria-label="Formulário de login">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              aria-required="true"
              aria-label="Endereço de email"
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite sua senha"
              required
              aria-required="true"
              aria-label="Senha de acesso"
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Mensagem de erro */}
          {erro && (
            <p className="text-sm text-red-500 text-center" role="alert">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className={`bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg py-2 text-sm transition-colors ${
              carregando ? "cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {/* Link Esqueci minha senha */}
        <div className="mt-6 text-center">
          <Link
            to="/recuperar-senha"
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
          > 
            Esqueci minha senha
          </Link>
        </div>

      </div>
    </div>
  );
}