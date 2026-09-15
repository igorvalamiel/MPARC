import { useAuth } from '../context/AuthContext';
import './Perfil.css';

export default function Perfil() {
  const { usuario } = useAuth();

  return (
    <div className="perfil-screen">
      <h1>Meu perfil</h1>

      <dl className="perfil-lista">
        <dt>Nome</dt>
        <dd>{usuario?.nome}</dd>

        <dt>CPF</dt>
        <dd>{usuario?.cpf}</dd>

        <dt>Número do conselho</dt>
        <dd>{usuario?.numeroconselho || '—'}</dd>
      </dl>
    </div>
  );
}