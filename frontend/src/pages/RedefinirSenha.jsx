import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { redefinirSenha } from "../services/auth";
import logo from "../images/mparc_short_logo.png";

export default function RedefinirSenha() {
  const { token } = useParams(); // Pega o token da URL
  const navigate = useNavigate();
  
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  function validarSenha(senha) {
    // Mínimo 8 caracteres, pelo menos 1 letra e 1 número
    const regex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    return regex.test(senha);
  }

  async function handleRedefinirSenha(e) {
    e.preventDefault();
    setErro("");
    setMensagem("");

    if (!novaSenha || !confirmarSenha) {
      setErro("Por favor, preencha todos os campos.");
      return;
    }

    if (!validarSenha(novaSenha)) {
      setErro("A senha deve ter no mínimo 8 caracteres, incluindo letras e números.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setCarregando(true);

    try {
      await redefinirSenha(token, novaSenha);
      setMensagem("Senha redefinida com sucesso!");
      
      // Redireciona para o login após 2 segundos
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      
    } catch (err) {
      if (err.response?.status === 400) {
        setErro("Link inválido ou expirado. Solicite uma nova recuperação.");
      } else if (err.response?.status === 429) {
        setErro("Muitas tentativas. Aguarde alguns minutos.");
      } else {
        setErro("Erro ao redefinir senha. Tente novamente.");
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
          <h1 className="text-2xl font-bold text-slate-800">Redefinir Senha</h1>
          <p className="text-sm text-slate-500 mt-1">
            Crie uma nova senha para sua conta
          </p>
        </div>

        {/* Formulário */}
        <form
          onSubmit={handleRedefinirSenha}
          className="flex flex-col gap-4"
          aria-label="Formulário de redefinição de senha"
        >
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Nova Senha
            </label>
            <input
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              required
              aria-required="true"
              aria-label="Nova senha"
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={carregando}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Confirmar Senha
            </label>
            <input
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Repita a nova senha"
              required
              aria-required="true"
              aria-label="Confirmar nova senha"
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={carregando}
            />
          </div>

          {/* Requisitos da senha */}
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500 font-medium mb-1">
              Sua senha deve conter:
            </p>
            <ul className="text-xs text-slate-400 space-y-0.5">
              <li>• Mínimo de 8 caracteres</li>
              <li>• Pelo menos 1 letra</li>
              <li>• Pelo menos 1 número</li>
            </ul>
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
            {carregando ? "Redefinindo..." : "Redefinir senha"}
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