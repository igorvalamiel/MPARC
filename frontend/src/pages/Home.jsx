import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { usuario, sair } = useAuth();

  return (
    <div>
      <h1>Bem-vindo(a), {usuario?.nome}</h1>
      <button onClick={sair}>Sair</button>
    </div>
  );
}