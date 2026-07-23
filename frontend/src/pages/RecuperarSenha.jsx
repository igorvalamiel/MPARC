import { useState } from "react";
import { Link } from "react-router-dom";
import { solicitarRecuperacaoSenha } from "../services/auth";
import logo from "../images/mparc_short_logo.png";

export default function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  async function handleRecuperarSenha(e) {
    e.preventDefault();
    setErro("");
    setMensagem("");

    if (!email.trim()) {
      setErro("Por favor, informe seu email.");
      return;
    }

    if (!validarEmail(email)) {
      setErro("Formato de email inválido.");
      return;
    }

    setCarregando(true);

    try {
      await solicitarRecuperacaoSenha(email);
      setMensagem(
        "Se este email estiver cadastrado, você receberá um link para redefinir sua senha em instantes."
      );
      setEmail(""); // Limpa o campo após sucesso
    } catch (err) {
      if (err.response?.status === 429) {
        setErro("Muitas solicitações. Aguarde alguns minutos.");
      } else {
        // Por segurança, não revelamos se o email existe ou não
        setMensagem(
          "Se este email estiver cadastrado, você receberá um link para redefinir sua senha em instantes."
        );
        setEmail("");
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
          <h1 className="text-2xl font-bold text-slate-800">Recuperar Senha</h1>
          <p className="text-sm text-slate-500 mt-1">
            Digite seu email para receber as instruções
          </p>
        </div>

        {/* Formulário */}
        <form
          onSubmit={handleRecuperarSenha}
          className="flex flex-col gap-4"
          aria-label="Formulário de recuperação de senha"
        >
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              aria-required="true"
              aria-label="Endereço de email para recuperação"
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

          {/* Mensagem de sucesso */}
          {mensagem && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-600 text-center" role="status">
                {mensagem}
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
            {carregando ? "Enviando..." : "Enviar instruções"}
          </button>
        </form>

        {/* Link para voltar ao login */}
        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm text-slate-500 hover:text-slate-700 hover:underline transition-colors"
          >
            ← Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
}
