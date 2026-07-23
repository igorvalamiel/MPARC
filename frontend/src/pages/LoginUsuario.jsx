import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUsuario } from "../services/auth";
import logo from "../images/mparc_short_logo.png";

export default function LoginUsuario() {
  const [idUsuario, setIdUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const [tentativas, setTentativas] = useState(0);
  const BLOQUEIO_TEMPORARIO = 3;

  async function handleLogin(e) {
    e.preventDefault();

    if (tentativas >= BLOQUEIO_TEMPORARIO) {
      setErro("Muitas tentativas. Aguarde alguns minutos.");
      return;
    }

    setErro("");
    setCarregando(true);

    try {
      await loginUsuario(idUsuario, senha);
      navigate("/triagem");
    } catch (err) {
      setTentativas((prev) => prev + 1);

      if (err.response?.status === 401) {
        setErro("ID ou senha incorretos.");
      } else if (err.response?.status === 429) {
        setErro("Muitas tentativas. Tente novamente mais tarde.");
      } else if (err.response?.status === 403) {
        setErro("Conta bloqueada. Entre em contato com o administrador.");
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
          <p className="text-sm text-slate-500 mt-1">Login para profissionais de saúde</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4" aria-label="Formulário de login">

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">ID do Profissional</label>
            <input
              type="text"
              value={idUsuario}
              onChange={(e) => setIdUsuario(e.target.value)}
              placeholder="Digite seu ID"
              required
              aria-required="true"
              aria-label="ID do profissional"
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={carregando}
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
              disabled={carregando}
            />
          </div>

          {/* Mensagem de erro */}
          {erro && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600 text-center" role="alert">
                {erro}
              </p>
            </div>
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

        {/* Sem link para recuperar senha nem para o login admin */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">
            Esqueceu sua senha? Fale com o administrador.
          </p>
        </div>

      </div>
    </div>
  );
}
