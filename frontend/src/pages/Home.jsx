import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

export default function Home() {
  const { usuario, sair } = useAuth();

  return (
    <div className="home-screen">
      <header className="home-topbar">
        <span className="home-wordmark">MPARC</span>
        <Link to="/perfil" className="home-user">
          <span className="home-avatar">{usuario?.nome?.charAt(0)}</span>
          <span>{usuario?.nome}</span>
        </Link>
      </header>

      <main className="home-main">
        <h1>Bem-vindo(a), {usuario?.nome}</h1>
        <p className="home-subtitle">O que você quer fazer agora?</p>

        <div className="home-actions">
          <Link to="/classificacoes" className="action-card">
            <span className="action-title">Classificações de hoje</span>
            <span className="action-desc">Consultar o que já foi registrado</span>
          </Link>

          <Link to="/classificacoes/nova" className="action-card action-primary">
            <span className="action-title">Nova classificação</span>
            <span className="action-desc">Registrar um novo atendimento</span>
          </Link>

          <button className="action-card action-danger" onClick={sair}>
            <span className="action-title">Sair</span>
            <span className="action-desc">Encerrar a sessão</span>
          </button>
        </div>
      </main>
    </div>
  );
}